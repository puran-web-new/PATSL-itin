import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, PDFFont, PDFName, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { getPool } from '../../../lib/db';
import { requireAdmin } from '../../../lib/security';
import { CaseData, deriveFinancials, hydrateCaseData, REASON_LABELS } from '../../../lib/caseData';
import { getFirmProfile } from '../../../lib/firmProfile';
import { getClientSession } from '../../../lib/clientAuth';
import { F1040_FIELDS, W7_FIELD_MAP, COA_FIELD_MAP, coaRowField } from '../../../lib/pdfFieldMaps';
import { tierFor } from '../../../lib/pricing';

const INK = rgb(0.04, 0.05, 0.12);
const SLATE = rgb(0.35, 0.39, 0.45);
const BRAND = rgb(0.15, 0.32, 0.86);

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function setText(form: any, fieldName: string | undefined, value: string) {
  if (!fieldName) return false;
  try {
    form.getTextField(fieldName).setText(value ?? '');
    return true;
  } catch {
    return false;
  }
}

function setCheck(form: any, fieldName: string | undefined) {
  if (!fieldName) return false;
  try {
    form.getCheckBox(fieldName).check();
    return true;
  } catch {
    return false;
  }
}

function digitsOnly(value: string) {
  return (value || '').replace(/[^0-9]/g, '');
}

// SSN/ITIN boxes on Form 1040 are 9-character "comb" fields (one evenly spaced cell
// per digit) — they can only hold a 9-digit number, so there's no reliable way to fit
// "Applied For" inside one. When there's no prior ITIN to enter (the normal case for a
// first-time applicant filing alongside their W-7), this is left blank on purpose; the
// cover sheet reminds staff to write "Applied For" in that box by hand before mailing,
// which is the standard paper-filing convention for a return submitted with a pending W-7.
function setSsnField(form: any, fieldName: string | undefined, rawValue: string) {
  if (!fieldName) return;
  const digits = digitsOnly(rawValue);
  if (digits.length !== 9) return;
  try {
    form.getTextField(fieldName).setText(digits);
  } catch {
    // field not present on this template — ignore
  }
}

function money(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// The W-7's date-of-birth, ID-expiration, and date-of-entry boxes are 8-character
// "comb" fields — the MM / DD / YYYY dividers are printed on the form itself, not part
// of the fillable field, so the field only accepts 8 raw digits (MMDDYYYY). Accepts
// either an ISO date (YYYY-MM-DD, from the case editor's <input type="date">) or an
// already-digits string.
function formatDateComb(value: string) {
  if (!value) return '';
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[2]}${iso[3]}${iso[1]}`;
  const digits = digitsOnly(value);
  return digits.length === 8 ? digits : '';
}

// ---------------------------------------------------------------------------
// Form 1040 — real official IRS template (public/templates/f1040.pdf), filled
// against verified field names in lib/pdfFieldMaps.ts.
// ---------------------------------------------------------------------------
async function buildF1040(caseData: CaseData): Promise<PDFDocument> {
  const filePath = path.join(process.cwd(), 'public', 'templates', 'f1040.pdf');
  const totals = deriveFinancials(caseData);

  if (!(await fileExists(filePath))) {
    return buildPlaceholderPage('Form 1040', 'Official IRS PDF template not yet installed at public/templates/f1040.pdf.');
  }

  const doc = await PDFDocument.load(await fs.readFile(filePath));
  const form = doc.getForm();

  setText(form, F1040_FIELDS.firstNameMI, [caseData.firstName, caseData.middleName].filter(Boolean).join(' '));
  setText(form, F1040_FIELDS.lastName, caseData.lastName);
  setSsnField(form, F1040_FIELDS.ssn, caseData.previousItinOrIrsn);

  setText(form, F1040_FIELDS.street, caseData.mailingStreet);
  setText(form, F1040_FIELDS.apt, caseData.mailingAptOrRoute);
  setText(form, F1040_FIELDS.city, caseData.mailingCity);
  setText(form, F1040_FIELDS.state, caseData.mailingState);
  setText(form, F1040_FIELDS.zip, caseData.mailingZip);
  setText(form, F1040_FIELDS.foreignCountry, caseData.foreignCountry);
  setText(form, F1040_FIELDS.foreignProvince, caseData.foreignProvince);
  setText(form, F1040_FIELDS.foreignPostal, caseData.foreignPostalCode);

  if (caseData.filingStatus) {
    setCheck(form, F1040_FIELDS.filingStatus[caseData.filingStatus]);
  }

  if (caseData.digitalAssets === 'YES') setCheck(form, F1040_FIELDS.digitalAssetsYes);
  if (caseData.digitalAssets === 'NO') setCheck(form, F1040_FIELDS.digitalAssetsNo);

  caseData.dependents.slice(0, 4).forEach((dep, index) => {
    const row = F1040_FIELDS.dependentRows[index];
    if (!row) return;
    setText(form, row.name, dep.firstLast);
    setSsnField(form, row.ssn, dep.ssnOrItin);
    setText(form, row.relationship, dep.relationship);
    if (dep.childTaxCredit) setCheck(form, row.ctc);
    if (dep.creditForOtherDependents) setCheck(form, row.odc);
  });
  if (caseData.dependents.length > 4) setCheck(form, F1040_FIELDS.dependentsOverflow);

  setText(form, F1040_FIELDS.wages1a, totals.wages ? money(totals.wages) : '');
  setText(form, F1040_FIELDS.line1z, totals.wages ? money(totals.wages) : '');
  setText(form, F1040_FIELDS.totalIncome9, totals.totalIncome ? money(totals.totalIncome) : '');
  setText(form, F1040_FIELDS.adjustments10, totals.adjustments ? money(totals.adjustments) : '');
  setText(form, F1040_FIELDS.agi11, totals.totalIncome ? money(totals.agi) : '');
  setText(form, F1040_FIELDS.standardDeduction12, caseData.filingStatus ? money(totals.standardDeduction) : '');
  setText(form, F1040_FIELDS.totalDeductions14, caseData.filingStatus ? money(totals.standardDeduction) : '');
  setText(form, F1040_FIELDS.taxableIncome15, caseData.filingStatus ? money(totals.taxableIncome) : '');

  if (caseData.taxAmount) {
    setText(form, F1040_FIELDS.tax16, money(totals.tax));
    setText(form, F1040_FIELDS.totalTax24, money(totals.tax));
  }
  if (totals.totalPayments) {
    setText(form, F1040_FIELDS.totalPayments33, money(totals.totalPayments));
  }
  if (totals.amountOwed > 0) {
    setText(form, F1040_FIELDS.amountYouOwe37, money(totals.amountOwed));
  }

  setText(form, F1040_FIELDS.occupation, caseData.occupation);
  setText(form, F1040_FIELDS.phone, caseData.phone);
  setText(form, F1040_FIELDS.email, caseData.email);

  form.flatten();
  return doc;
}

// ---------------------------------------------------------------------------
// Form W-7 — real official IRS template at public/templates/fW7.pdf, filled
// against field names verified in lib/pdfFieldMaps.ts (confirmed visually by
// rendering a labeled copy of the form and reading off every field name against
// its printed position — not guessed from the cryptic Adobe field IDs alone).
// ---------------------------------------------------------------------------
function splitIntoParts(digits: string, lengths: number[]) {
  const parts: string[] = [];
  let offset = 0;
  for (const len of lengths) {
    parts.push(digits.slice(offset, offset + len));
    offset += len;
  }
  return parts;
}

function combine(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(', ');
}

async function buildW7(caseData: CaseData): Promise<PDFDocument> {
  const filePath = path.join(process.cwd(), 'public', 'templates', 'fW7.pdf');

  if (await fileExists(filePath)) {
    const doc = await PDFDocument.load(await fs.readFile(filePath));
    const form = doc.getForm();
    const M = W7_FIELD_MAP;

    const priorIdDigits = digitsOnly(caseData.previousItinOrIrsn);
    setCheck(form, priorIdDigits.length === 9 ? M.renewExisting : M.applyNew);

    caseData.reasonCodes.forEach((code) => setCheck(form, (M.reason as Record<string, string>)[code]));
    setText(form, M.dependentRelationship, caseData.dependentRelationship);
    setText(form, M.usCitizenName, caseData.usCitizenName);
    setText(form, M.usCitizenSsnOrItin, caseData.usCitizenSsnOrItin);
    setText(form, M.reasonOtherDetails, caseData.reasonOtherDetails);
    setText(form, M.treatyCountry, caseData.treatyCountry);
    setText(form, M.treatyArticleNumber, caseData.treatyArticleNumber);

    setText(form, M.firstName, caseData.firstName);
    setText(form, M.middleName, caseData.middleName);
    setText(form, M.lastName, caseData.lastName);

    if (caseData.nameAtBirth) {
      const parts = caseData.nameAtBirth.trim().split(/\s+/);
      setText(form, M.birthFirstName, parts[0] || '');
      setText(form, M.birthLastName, parts.length > 1 ? parts[parts.length - 1] : '');
      setText(form, M.birthMiddleName, parts.length > 2 ? parts.slice(1, -1).join(' ') : '');
    }

    setText(form, M.mailingLine1, combine(caseData.mailingStreet, caseData.mailingAptOrRoute));
    setText(form, M.mailingLine2, combine(caseData.mailingCity, caseData.mailingState, caseData.mailingZip));
    setText(form, M.foreignLine1, caseData.foreignStreet);
    setText(form, M.foreignLine2, combine(caseData.foreignCity, caseData.foreignProvince, caseData.foreignPostalCode, caseData.foreignCountry));

    setText(form, M.dateOfBirth, formatDateComb(caseData.dateOfBirth));
    setText(form, M.countryOfBirth, caseData.countryOfBirth);
    setText(form, M.birthCityState, caseData.birthCityState);
    if (caseData.sex === 'MALE') setCheck(form, M.sexMale);
    if (caseData.sex === 'FEMALE') setCheck(form, M.sexFemale);

    setText(form, M.countryOfCitizenship, caseData.countryOfCitizenship);
    setText(form, M.foreignTaxId, caseData.foreignTaxId);
    setText(form, M.visaInfo, combine(caseData.visaType, caseData.visaNumber, caseData.visaExpirationDate));

    setText(form, M.schoolOrCompanyName, caseData.schoolOrCompanyName);
    setText(form, M.schoolCityState, caseData.schoolCityState);
    setText(form, M.lengthOfStay, caseData.lengthOfStay);

    if (caseData.idDocType === 'PASSPORT') setCheck(form, M.idDoc.passport);
    else if (caseData.idDocType === 'DRIVERS_LICENSE') setCheck(form, M.idDoc.driversLicense);
    else if (caseData.idDocType === 'USCIS') setCheck(form, M.idDoc.uscis);
    else {
      setCheck(form, M.idDoc.other);
      setText(form, M.idOtherDescription, caseData.idDocType === 'NATIONAL_ID' ? 'National ID card' : 'Other');
    }
    setText(form, M.idIssuedBy, caseData.idIssuedBy);
    setText(form, M.idNumber, caseData.idNumber);
    setText(form, M.idExpirationDate, formatDateComb(caseData.idExpirationDate));
    setText(form, M.dateOfEntryUs, formatDateComb(caseData.dateOfEntryUs));

    if (priorIdDigits.length === 9) {
      setCheck(form, M.previousItinKnownYes);
      const parts = splitIntoParts(priorIdDigits, [3, 2, 4]);
      M.previousItin.forEach((field, i) => setText(form, field, parts[i]));
    } else {
      setCheck(form, M.previousItinKnownNo);
    }

    setText(form, M.applicantPhone, caseData.phone);

    setText(form, M.aaPhone, getFirmProfile().phone);
    setText(form, M.aaNameAndTitle, combine(caseData.caaReviewerName, caseData.caaReviewerTitle));
    setText(form, M.aaCompanyName, caseData.caaBusinessName);
    setText(form, M.aaEin, caseData.caaEin);
    setText(form, M.aaPtin, caseData.caaPtin);
    setText(form, M.aaOfficeCode, caseData.caaOfficeCode);

    form.flatten();
    return doc;
  }

  const reasonText = caseData.reasonCodes.map((c) => `${c}) ${REASON_LABELS[c] || ''}`).join('; ') || 'Not selected';
  return buildDataSummary('Form W-7 — Application for ITIN', 'Official IRS PDF template not yet installed at public/templates/fW7.pdf.', [
    ['Applicant', [caseData.firstName, caseData.middleName, caseData.lastName].filter(Boolean).join(' ')],
    ['Name at birth (if different)', caseData.nameAtBirth],
    ['Date of birth', caseData.dateOfBirth],
    ['Country of birth', caseData.countryOfBirth],
    ['Birth city/state', caseData.birthCityState],
    ['Sex', caseData.sex],
    ['Country of citizenship', caseData.countryOfCitizenship],
    ['Reason for applying', reasonText],
    ['Treaty country / article', [caseData.treatyCountry, caseData.treatyArticleNumber].filter(Boolean).join(' / ')],
    ['Mailing address', [caseData.mailingStreet, caseData.mailingAptOrRoute, caseData.mailingCity, caseData.mailingState, caseData.mailingZip].filter(Boolean).join(', ')],
    ['Foreign address', [caseData.foreignStreet, caseData.foreignCity, caseData.foreignProvince, caseData.foreignPostalCode, caseData.foreignCountry].filter(Boolean).join(', ')],
    ['ID document', `${caseData.idDocType} #${caseData.idNumber || '—'} (issued by ${caseData.idIssuedBy || '—'}, exp. ${caseData.idExpirationDate || '—'})`],
    ['Date of entry into U.S.', caseData.dateOfEntryUs],
    ['Foreign tax ID', caseData.foreignTaxId],
    ['Visa', [caseData.visaType, caseData.visaNumber, caseData.visaExpirationDate].filter(Boolean).join(' / ')],
    ['Previous ITIN/IRSN', caseData.previousItinOrIrsn],
    ['Phone', caseData.phone],
    ['Signature date', caseData.signatureDate],
  ]);
}

// ---------------------------------------------------------------------------
// Certificate of Accuracy — real official IRS template at
// public/templates/fw7coa.pdf ("Form W-7-COA", Rev. 8-2025), filled against
// its own self-descriptive field names in lib/pdfFieldMaps.ts.
// ---------------------------------------------------------------------------
const DOC_TYPE_TO_COA_ROW: Record<string, keyof typeof COA_FIELD_MAP.docRows> = {
  PASSPORT: 'PASSPORT',
  NATIONAL_ID: 'NATIONAL_ID',
  USCIS: 'USCIS',
};

async function buildCOA(caseData: CaseData): Promise<PDFDocument> {
  const filePath = path.join(process.cwd(), 'public', 'templates', 'fw7coa.pdf');

  if (await fileExists(filePath)) {
    const doc = await PDFDocument.load(await fs.readFile(filePath));
    const form = doc.getForm();
    const M = COA_FIELD_MAP;

    setText(form, M.theUndersigned, caseData.caaReviewerName);
    setText(form, M.businessName, caseData.caaBusinessName);
    if (caseData.signatureDate) {
      const [year, month, day] = caseData.signatureDate.split('-');
      setText(form, M.datedMonth, month);
      setText(form, M.datedDay, day);
      setText(form, M.datedYear, year ? year.slice(2) : '');
    }
    setText(form, M.applicantsName, [caseData.firstName, caseData.middleName, caseData.lastName].filter(Boolean).join(' '));

    let rowKey: keyof typeof COA_FIELD_MAP.docRows | undefined = DOC_TYPE_TO_COA_ROW[caseData.idDocType];
    if (!rowKey && caseData.idDocType === 'DRIVERS_LICENSE') {
      const foreign = !/united states|u\.s\.a?\.?|usa/i.test(caseData.idIssuedBy || '');
      rowKey = foreign ? 'FOREIGN_DRIVERS_LICENSE' : 'US_DRIVERS_LICENSE';
    }
    if (rowKey) {
      const row = M.docRows[rowKey];
      setCheck(form, coaRowField(row, 'identity'));
      // A passport is the only stand-alone document proving both identity and
      // foreign status; national ID and USCIS photo ID also cover both columns
      // per the form's own instructions. A same-country driver's license only
      // proves identity, so it deliberately does not check Foreign Status.
      if (rowKey !== 'US_DRIVERS_LICENSE') setCheck(form, coaRowField(row, 'foreignStatus'));
    }

    setText(form, M.signatureResponsible, caseData.caaReviewerName);
    setText(form, M.dateResponsibleParty, caseData.signatureDate);
    setText(form, M.acceptanceAgentEIN, caseData.caaEin);
    setText(form, M.agentCode, caseData.caaOfficeCode);
    setText(form, M.agentPTIN, caseData.caaPtin);

    form.flatten();
    return doc;
  }

  return buildDataSummary('Certificate of Accuracy (Form W-7-COA)', 'Template not found at public/templates/fw7coa.pdf.', [
    ['Acceptance Agent', `${caseData.caaBusinessName} | EIN ${caseData.caaEin || '—'} | PTIN ${caseData.caaPtin || '—'}`],
    ['Applicant', [caseData.firstName, caseData.middleName, caseData.lastName].filter(Boolean).join(' ')],
    ['Identity document reviewed', `${caseData.idDocType.replace('_', ' ')} #${caseData.idNumber || '—'}`],
    ['Reviewer', caseData.caaReviewerName],
    ['Date', caseData.signatureDate],
  ]);
}

// ---------------------------------------------------------------------------
// PDF hygiene helpers: force Letter-size actual-size printing (no auto-scaling
// or "fit to page" shrinking that would throw off an official form's margins),
// and format cents-based currency for the invoice.
// ---------------------------------------------------------------------------
function applyPrintScaling(doc: PDFDocument) {
  doc.catalog.set(PDFName.of('ViewerPreferences'), doc.context.obj({ PrintScaling: PDFName.of('None') }));
}

function formatCurrency(cents: number, currency = 'USD') {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency });
}

// ---------------------------------------------------------------------------
// Supporting ID copies — the identity documents a client uploaded during intake
// (stored in Vercel Blob) get appended as the final pages of the IRS mail bundle,
// per standard CAA practice of including certified copies of the identity
// document reviewed. Images are embedded onto a Letter page; PDFs are copied
// page-for-page. Any document that fails to fetch (missing/expired URL, already
// scrubbed per the 90-day retention policy, network hiccup) is skipped rather
// than failing the whole package — staff can always attach it manually.
// ---------------------------------------------------------------------------
async function embedSupportingDocuments(mergedDoc: PDFDocument, documents: { storage_path: string | null; is_scrubbed: boolean; doc_type: string }[]) {
  for (const docRow of documents) {
    if (!docRow.storage_path || docRow.is_scrubbed) continue;
    try {
      const res = await fetch(docRow.storage_path);
      if (!res.ok) continue;
      const contentType = res.headers.get('content-type') || '';
      const bytes = new Uint8Array(await res.arrayBuffer());

      if (contentType.includes('pdf')) {
        const srcDoc = await PDFDocument.load(bytes);
        const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        pages.forEach((p) => mergedDoc.addPage(p));
      } else {
        const image = contentType.includes('png') ? await mergedDoc.embedPng(bytes) : await mergedDoc.embedJpg(bytes);
        const page = mergedDoc.addPage([612, 792]);
        const margin = 40;
        const maxWidth = 612 - margin * 2;
        const maxHeight = 792 - margin * 2 - 30;
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const w = image.width * scale;
        const h = image.height * scale;
        const font = await mergedDoc.embedFont(StandardFonts.HelveticaBold);
        page.drawText(`Supporting identity document — ${docRow.doc_type.replace(/_/g, ' ')}`, {
          x: margin,
          y: 792 - margin,
          size: 10,
          font,
          color: SLATE,
        });
        page.drawImage(image, { x: (612 - w) / 2, y: (792 - h - margin - 20), width: w, height: h });
      }
    } catch (err) {
      console.error('Skipping supporting document (fetch/embed failed):', docRow.storage_path, err);
    }
  }
}

// ---------------------------------------------------------------------------
// Itemized invoice / receipt. Pulls the real amount and payment status from the
// Square-backed `invoices` table whenever one exists for this case (single
// source of truth — no re-typing a fee that was already charged); staff can
// override the fee, payment method, or invoice number in the case editor only
// for payments taken outside Square (cash/check walk-ins).
// ---------------------------------------------------------------------------
function buildInvoice(app: any, caseData: CaseData, invoiceRow: { amount_cents: number; currency: string; payment_status: string; square_order_id: string | null; created_at: string } | null) {
  return async (): Promise<PDFDocument> => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const regular = await doc.embedFont(StandardFonts.Helvetica);

    const tier = tierFor(app.service_tier);
    const amountCents = invoiceRow?.amount_cents ?? (caseData.serviceFeeOverride ? Math.round(Number(caseData.serviceFeeOverride) * 100) : tier.amountCents);
    const currency = invoiceRow?.currency || 'USD';
    const invoiceNumber = caseData.invoiceNumber || `INV-${String(app.id).slice(0, 8).toUpperCase()}`;
    const invoiceDate = invoiceRow?.created_at ? new Date(invoiceRow.created_at) : new Date();
    const paymentMethod = caseData.paymentMethod || (invoiceRow ? 'Square (card)' : 'Not recorded');
    const paymentStatus = invoiceRow?.payment_status || 'PENDING';

    page.drawRectangle({ x: 0, y: 742, width: 612, height: 50, color: INK });
    page.drawText('Invoice & Receipt', { x: 50, y: 762, size: 18, font: bold, color: rgb(1, 1, 1) });

    let y = 700;
    page.drawText(caseData.caaBusinessName || 'PATSL Developer LLC', { x: 50, y, size: 12, font: bold }); y -= 16;
    const firm = getFirmProfile();
    if (firm.address) { page.drawText(firm.address, { x: 50, y, size: 9, font: regular, color: SLATE }); y -= 13; }
    if (firm.phone || firm.email) { page.drawText([firm.phone, firm.email].filter(Boolean).join(' · '), { x: 50, y, size: 9, font: regular, color: SLATE }); y -= 13; }

    page.drawText(`Invoice #: ${invoiceNumber}`, { x: 380, y: 700, size: 10, font: bold });
    page.drawText(`Date: ${invoiceDate.toLocaleDateString()}`, { x: 380, y: 686, size: 9, font: regular, color: SLATE });
    page.drawText(`Reference: ${String(app.id).slice(0, 8)}`, { x: 380, y: 672, size: 9, font: regular, color: SLATE });

    y -= 20;
    page.drawText('Bill to', { x: 50, y, size: 9, font: bold, color: SLATE }); y -= 15;
    page.drawText(`${app.first_name} ${app.last_name}`, { x: 50, y, size: 11, font: bold }); y -= 15;
    if (app.email) { page.drawText(app.email, { x: 50, y, size: 9, font: regular, color: SLATE }); y -= 13; }
    if (app.phone) { page.drawText(app.phone, { x: 50, y, size: 9, font: regular, color: SLATE }); y -= 13; }

    y -= 20;
    page.drawRectangle({ x: 50, y: y - 4, width: 512, height: 22, color: rgb(0.94, 0.95, 0.97) });
    page.drawText('Description', { x: 58, y: y + 2, size: 9, font: bold, color: SLATE });
    page.drawText('Amount', { x: 500, y: y + 2, size: 9, font: bold, color: SLATE });
    y -= 30;
    page.drawText(`${tier.name} — ITIN Preparation & CAA Certification`, { x: 58, y, size: 10, font: regular });
    page.drawText(formatCurrency(amountCents, currency), { x: 500, y, size: 10, font: regular });
    y -= 24;
    page.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 0.5, color: rgb(0.85, 0.86, 0.9) });
    y -= 22;
    page.drawText('Tax', { x: 58, y, size: 10, font: regular, color: SLATE });
    page.drawText(formatCurrency(0, currency), { x: 500, y, size: 10, font: regular, color: SLATE });
    y -= 24;
    page.drawText('Total', { x: 58, y, size: 12, font: bold });
    page.drawText(formatCurrency(amountCents, currency), { x: 500, y, size: 12, font: bold });

    y -= 40;
    page.drawText(`Payment method: ${paymentMethod}`, { x: 50, y, size: 9, font: regular, color: SLATE }); y -= 15;
    page.drawText(`Payment status: ${paymentStatus.replace(/_/g, ' ')}`, { x: 50, y, size: 9, font: bold, color: paymentStatus === 'PAID' ? rgb(0.02, 0.4, 0.25) : rgb(0.6, 0.4, 0.05) }); y -= 15;
    if (invoiceRow?.square_order_id) {
      page.drawText(`Square order: ${invoiceRow.square_order_id}`, { x: 50, y, size: 8, font: regular, color: SLATE }); y -= 13;
    }

    y -= 20;
    page.drawText('Thank you for choosing PATSL. This receipt is for your records.', { x: 50, y, size: 9, font: regular, color: SLATE });

    return doc;
  };
}

function drawCenteredNote(page: PDFPage, font: PDFFont, text: string, y: number) {
  page.drawText(text, { x: 50, y, size: 9, font, color: SLATE });
}

async function buildPlaceholderPage(title: string, note: string): Promise<PDFDocument> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  page.drawRectangle({ x: 0, y: 742, width: 612, height: 50, color: INK });
  page.drawText(title, { x: 50, y: 762, size: 18, font: bold, color: rgb(1, 1, 1) });
  drawCenteredNote(page, regular, note, 700);
  return doc;
}

async function buildDataSummary(title: string, note: string, pairs: [string, string][]): Promise<PDFDocument> {
  const doc = await PDFDocument.create();
  let page = doc.addPage([612, 792]);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({ x: 0, y: 742, width: 612, height: 50, color: INK });
  page.drawText(title, { x: 50, y: 762, size: 16, font: bold, color: rgb(1, 1, 1) });
  page.drawText(note, { x: 50, y: 748, size: 8, font: regular, color: rgb(0.85, 0.87, 0.94) });

  let y = 710;
  for (const [label, value] of pairs) {
    if (y < 60) {
      page = doc.addPage([612, 792]);
      y = 740;
    }
    page.drawText(label.toUpperCase(), { x: 50, y, size: 7.5, font: bold, color: SLATE });
    page.drawText(String(value || '—'), { x: 50, y: y - 12, size: 10, font: regular, color: rgb(0.1, 0.1, 0.15) });
    y -= 30;
  }
  return doc;
}

function buildClientCoverPage(app: any, caseData: CaseData) {
  return async (): Promise<PDFDocument> => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    const boldItalic = await doc.embedFont(StandardFonts.HelveticaBoldOblique);

    page.drawRectangle({ x: 0, y: 712, width: 612, height: 80, color: INK });
    page.drawText('Your ITIN Application — Next Steps', { x: 50, y: 758, size: 20, font: bold, color: rgb(1, 1, 1) });
    page.drawText(`Prepared for ${app.first_name} ${app.last_name} · Reference ${String(app.id).slice(0, 8)}`, { x: 50, y: 736, size: 10, font: regular, color: rgb(0.8, 0.85, 0.95) });

    let y = 685;
    page.drawText('What\'s enclosed', { x: 50, y, size: 11, font: bold }); y -= 20;
    const items = [
      'Form W-7 — Application for IRS Individual Taxpayer Identification Number',
      'Certificate of Accuracy (Form W-7-COA), completed by your Certified Acceptance Agent',
      'Copy of your associated federal tax return (Form 1040), if applicable',
      'A copy of the identity document your CAA certified as part of this application',
    ];
    for (const item of items) {
      page.drawText('•', { x: 52, y, size: 10, font: bold, color: INK });
      page.drawText(item, { x: 64, y, size: 10, font: regular, color: rgb(0.15, 0.17, 0.22) });
      y -= 17;
    }

    y -= 14;
    page.drawText('Where to sign', { x: 50, y, size: 11, font: bold }); y -= 18;
    const signLines = [
      'Form W-7: sign and date the "Sign Here" block at the bottom of the form.',
      'Form 1040: sign and date next to "Sign Here" on page 1, in the signature box.',
      caseData.previousItinOrIrsn && /^\d{9}$/.test(digitsOnly(caseData.previousItinOrIrsn))
        ? ''
        : 'Form 1040 SSN/ITIN box: write "Applied For" by hand — it prints blank for first-time applicants.',
    ].filter(Boolean);
    for (const line of signLines) {
      page.drawText(line, { x: 60, y, size: 9.5, font: regular, color: rgb(0.15, 0.17, 0.22) });
      y -= 16;
    }

    y -= 14;
    page.drawText('Mailing the package to the IRS', { x: 50, y, size: 11, font: bold }); y -= 18;
    page.drawText('If you are mailing this yourself rather than through PATSL, send the signed originals to:', { x: 50, y, size: 9.5, font: regular, color: SLATE }); y -= 16;
    page.drawRectangle({ x: 50, y: y - 46, width: 300, height: 58, color: rgb(0.95, 0.96, 0.98) });
    page.drawText('Internal Revenue Service', { x: 60, y: y - 12, size: 10, font: bold });
    page.drawText('ITIN Operation', { x: 60, y: y - 26, size: 10, font: regular });
    page.drawText('P.O. Box 149342', { x: 60, y: y - 40, size: 10, font: regular });
    page.drawText('Austin, TX 78714-9342', { x: 60, y: y - 54, size: 10, font: regular });
    y -= 74;

    page.drawText('Expected processing time: approximately 7-11 weeks from the date the IRS receives your', { x: 50, y, size: 9.5, font: regular, color: rgb(0.15, 0.17, 0.22) }); y -= 14;
    page.drawText('application (longer during peak filing season, Jan-Apr). Track status any time at', { x: 50, y, size: 9.5, font: regular, color: rgb(0.15, 0.17, 0.22) }); y -= 14;
    page.drawText('patsl-itin-final.vercel.app/status with your reference ID above.', { x: 50, y, size: 9.5, font: regular, color: rgb(0.15, 0.17, 0.22) }); y -= 22;

    page.drawText('Review every page for accuracy before mailing. Contact PATSL immediately if any name, date,', { x: 50, y, size: 8.5, font: regular, color: SLATE }); y -= 12;
    page.drawText('or identification detail needs correction.', { x: 50, y, size: 8.5, font: regular, color: SLATE }); y -= 20;

    page.drawText(`Prepared by ${caseData.caaBusinessName}`, { x: 50, y, size: 9, font: boldItalic, color: SLATE });
    return doc;
  };
}

function buildIrsCoverPage(app: any, caseData: CaseData) {
  return async (): Promise<PDFDocument> => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText('PATSL ITIN Package', { x: 50, y: 730, size: 22, font: bold });
    page.drawText(`Applicant: ${app.first_name} ${app.last_name}`, { x: 50, y: 695, size: 12, font: regular });
    page.drawText(`Reference: ${app.id}`, { x: 50, y: 675, size: 10, font: regular, color: SLATE });
    page.drawText('Enclosed in required IRS order: Form W-7, Certificate of Accuracy, Form 1040.', { x: 50, y: 645, size: 10, font: regular, color: rgb(0.55, 0.1, 0.1) });

    if (!/^\d{9}$/.test(digitsOnly(caseData.previousItinOrIrsn))) {
      page.drawText('Before mailing: write "Applied For" by hand in the SSN box on Form 1040 — the', { x: 50, y: 615, size: 9, font: regular, color: rgb(0.55, 0.1, 0.1) });
      page.drawText('printed field is limited to 9 digits and was left blank for this first-time applicant.', { x: 50, y: 602, size: 9, font: regular, color: rgb(0.55, 0.1, 0.1) });
    }
    return doc;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { applicationId, packageType = 'IRS_MAIL' } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required.' }, { status: 400 });
    }

    // Staff (admin token) can generate any package type. A signed-in client may
    // only ever pull their own client-copy package for their own case — every
    // other package/route stays admin-only.
    let actorLabel = 'admin';
    const adminDenied = requireAdmin(req);
    if (adminDenied) {
      if (packageType !== 'CLIENT_COPY') {
        return adminDenied;
      }
      const session = await getClientSession(req);
      if (!session) return adminDenied;
      const ownership = await getPool().query(`SELECT 1 FROM applications WHERE id = $1 AND client_id = $2`, [applicationId, session.clientId]);
      if (!ownership.rows[0]) {
        return NextResponse.json({ error: 'Not authorized for this application.' }, { status: 403 });
      }
      actorLabel = 'client';
    }

    const pool = getPool();
    const db = await pool.connect();
    let app: any;
    let documents: any[] = [];
    let invoiceRow: any = null;
    try {
      const result = await db.query(
        `SELECT a.*, c.first_name, c.last_name, c.email, c.phone
         FROM applications a
         JOIN clients c ON c.id = a.client_id
         WHERE a.id = $1`,
        [applicationId]
      );
      app = result.rows[0];

      if (app) {
        const [docsResult, invoiceResult] = await Promise.all([
          db.query(
            `SELECT storage_path, doc_type, is_scrubbed FROM identity_documents
             WHERE application_id = $1 ORDER BY created_at DESC`,
            [applicationId]
          ),
          db.query(
            `SELECT amount_cents, currency, payment_status, square_order_id, created_at FROM invoices
             WHERE application_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [applicationId]
          ),
        ]);
        documents = docsResult.rows;
        invoiceRow = invoiceResult.rows[0] || null;
      }
    } finally {
      db.release();
    }

    if (!app) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    let caseData = hydrateCaseData(app);
    if (!caseData.caaEin && !caseData.caaPtin && !caseData.caaOfficeCode) {
      const firm = getFirmProfile();
      caseData = {
        ...caseData,
        caaBusinessName: caseData.caaBusinessName || firm.businessName,
        caaEin: firm.ein,
        caaPtin: firm.ptin,
        caaOfficeCode: firm.officeCode,
        caaReviewerName: caseData.caaReviewerName || firm.reviewerName,
        caaReviewerTitle: caseData.caaReviewerTitle || firm.reviewerTitle,
      };
    }

    const mergedDoc = await PDFDocument.create();
    let sequence: PDFDocument[] = [];
    let appendSupportingDocs = false;

    if (packageType === 'W7_ONLY') {
      sequence = [await buildW7(caseData)];
    } else if (packageType === 'COA_ONLY') {
      sequence = [await buildCOA(caseData)];
    } else if (packageType === 'F1040_ONLY') {
      sequence = [await buildF1040(caseData)];
    } else if (packageType === 'INVOICE_ONLY') {
      sequence = [await buildInvoice(app, caseData, invoiceRow)()];
    } else if (packageType === 'CAA_RECORD') {
      // Internal CAA file copy — cover sheet + W-7 + COA, for the office's own records.
      sequence = [await buildIrsCoverPage(app, caseData)(), await buildW7(caseData), await buildCOA(caseData)];
    } else if (packageType === 'CLIENT_COPY') {
      // Page 1: cover/next-steps letter · Page 2: itemized invoice · Page 3+: client copies of W-7, COA, 1040.
      sequence = [
        await buildClientCoverPage(app, caseData)(),
        await buildInvoice(app, caseData, invoiceRow)(),
        await buildW7(caseData),
        await buildCOA(caseData),
        await buildF1040(caseData),
      ];
    } else {
      // IRS_MAIL — the package that actually gets mailed: Page 1 Form W-7, Page 2 Certificate
      // of Accuracy, Page 3+ Form 1040, then certified copies of the identity document(s)
      // reviewed. No cover sheet — nothing goes into the envelope that isn't an official form
      // or a certified ID copy.
      sequence = [await buildW7(caseData), await buildCOA(caseData), await buildF1040(caseData)];
      appendSupportingDocs = true;
    }

    for (const pdf of sequence) {
      const pages = await mergedDoc.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => mergedDoc.addPage(p));
    }

    if (appendSupportingDocs) {
      await embedSupportingDocuments(mergedDoc, documents);
    }

    applyPrintScaling(mergedDoc);
    const bytes = await mergedDoc.save();
    await getPool().query(
      `INSERT INTO audit_events (application_id, event_type, actor, metadata)
       VALUES ($1, 'PACKAGE_GENERATED', $2, $3)`,
      [applicationId, actorLabel, JSON.stringify({ packageType })]
    );

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PATSL_${packageType}_${app.last_name}_${String(app.id).slice(0, 8)}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Package generation failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate package.' }, { status: 500 });
  }
}
