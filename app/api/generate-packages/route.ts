import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { getPool } from '../../../lib/db';
import { requireAdmin } from '../../../lib/security';
import { CaseData, deriveFinancials, hydrateCaseData, REASON_LABELS } from '../../../lib/caseData';
import { F1040_FIELDS, W7_FIELD_MAP } from '../../../lib/pdfFieldMaps';

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
// Form W-7 — uses the real IRS template once it's installed at
// public/templates/fW7.pdf (see lib/pdfFieldMaps.ts). Until then, renders a
// clearly labeled data-summary page so the case can still move forward.
// ---------------------------------------------------------------------------
async function buildW7(caseData: CaseData): Promise<PDFDocument> {
  const filePath = path.join(process.cwd(), 'public', 'templates', 'fW7.pdf');

  if (await fileExists(filePath)) {
    const doc = await PDFDocument.load(await fs.readFile(filePath));
    const form = doc.getForm();

    const reasonBoxes: Record<string, string> = {
      a: 'Reason_A', b: 'Reason_B', c: 'Reason_C', d: 'Reason_D',
      e: 'Reason_E', f: 'Reason_F', g: 'Reason_G', h: 'Reason_H',
    };
    caseData.reasonCodes.forEach((code) => setCheck(form, W7_FIELD_MAP[`reason_${code}`] || reasonBoxes[code]));

    setText(form, W7_FIELD_MAP.firstName, caseData.firstName);
    setText(form, W7_FIELD_MAP.middleName, caseData.middleName);
    setText(form, W7_FIELD_MAP.lastName, caseData.lastName);
    setText(form, W7_FIELD_MAP.mailingStreet, caseData.mailingStreet);
    setText(form, W7_FIELD_MAP.foreignStreet, caseData.foreignStreet);
    setText(form, W7_FIELD_MAP.dateOfBirth, caseData.dateOfBirth);
    setText(form, W7_FIELD_MAP.countryOfBirth, caseData.countryOfBirth);
    setText(form, W7_FIELD_MAP.passportNumber, caseData.idNumber);
    setText(form, W7_FIELD_MAP.passportCountry, caseData.idIssuedBy || caseData.countryOfCitizenship);

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
// Certificate of Accuracy — the IRS does not publish a fillable COA PDF (CAAs
// compose their own per the CAA Agreement's required content elements), so this
// is generated directly rather than filled from a template.
// ---------------------------------------------------------------------------
async function buildCOA(caseData: CaseData): Promise<PDFDocument> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);

  let y = 742;
  page.drawRectangle({ x: 0, y: 742, width: 612, height: 50, color: INK });
  page.drawText('Certificate of Accuracy', { x: 50, y: 762, size: 18, font: bold, color: rgb(1, 1, 1) });
  page.drawText('For IRS Individual Taxpayer Identification Number (Form W-7)', { x: 50, y: 748, size: 9, font: regular, color: rgb(0.8, 0.85, 0.95) });

  y = 710;
  const line = (label: string, value: string, size = 10) => {
    page.drawText(label, { x: 50, y, size: 8, font: bold, color: SLATE });
    page.drawText(value || '—', { x: 50, y: y - 13, size, font: regular, color: rgb(0.1, 0.1, 0.15) });
    y -= 34;
  };

  line('Acceptance Agent', `${caseData.caaBusinessName}  |  EIN: ${caseData.caaEin || '—'}  |  PTIN: ${caseData.caaPtin || '—'}  |  Office code: ${caseData.caaOfficeCode || '—'}`);
  line('Applicant', [caseData.firstName, caseData.middleName, caseData.lastName].filter(Boolean).join(' '));
  line('Date of birth / Country of citizenship', `${caseData.dateOfBirth || '—'}  /  ${caseData.countryOfCitizenship || '—'}`);
  line('Reason for ITIN application', caseData.reasonCodes.map((c) => `${c}) ${REASON_LABELS[c] || ''}`).join('; ') || '—');
  line('Identity document reviewed', `${caseData.idDocType.replace('_', ' ')} #${caseData.idNumber || '—'}, issued by ${caseData.idIssuedBy || '—'}, expires ${caseData.idExpirationDate || '—'}`);
  if (caseData.documentsReviewedSummary) line('Reviewer notes', caseData.documentsReviewedSummary);

  y -= 10;
  page.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 0.5, color: rgb(0.85, 0.86, 0.9) });
  y -= 24;

  const attestation =
    'I certify that: (1) I am authorized under my Acceptance Agent Agreement with the Internal Revenue Service ' +
    'to submit this Form W-7 on behalf of the applicant; (2) I have reviewed the original identification ' +
    'document(s) listed above, or certified copies issued by the issuing agency, and returned them to the ' +
    'applicant; (3) to the best of my knowledge and belief, the information provided on the accompanying ' +
    'Form W-7 and this Certificate of Accuracy is true, correct, and complete.';

  const words = attestation.split(' ');
  let lineText = '';
  const maxWidth = 512;
  for (const word of words) {
    const test = lineText ? `${lineText} ${word}` : word;
    if (regular.widthOfTextAtSize(test, 10) > maxWidth) {
      page.drawText(lineText, { x: 50, y, size: 10, font: regular, color: rgb(0.15, 0.17, 0.22) });
      y -= 16;
      lineText = word;
    } else {
      lineText = test;
    }
  }
  if (lineText) {
    page.drawText(lineText, { x: 50, y, size: 10, font: regular, color: rgb(0.15, 0.17, 0.22) });
    y -= 16;
  }

  y -= 40;
  page.drawLine({ start: { x: 50, y }, end: { x: 260, y }, thickness: 0.8, color: rgb(0.2, 0.2, 0.25) });
  page.drawText('Signature of Certifying Acceptance Agent', { x: 50, y: y - 12, size: 8, font: regular, color: SLATE });
  page.drawText(caseData.caaReviewerName || caseData.caaBusinessName, { x: 50, y: y + 4, size: 10, font: bold });

  page.drawLine({ start: { x: 320, y }, end: { x: 480, y }, thickness: 0.8, color: rgb(0.2, 0.2, 0.25) });
  page.drawText('Date', { x: 320, y: y - 12, size: 8, font: regular, color: SLATE });
  page.drawText(caseData.signatureDate || '—', { x: 320, y: y + 4, size: 10, font: bold });

  page.drawText(caseData.caaReviewerTitle || 'Certified Acceptance Agent', { x: 50, y: y - 28, size: 8, font: regular, color: SLATE });

  return doc;
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

    page.drawRectangle({ x: 0, y: 692, width: 612, height: 100, color: INK });
    page.drawText('PATSL Client Record File', { x: 50, y: 752, size: 22, font: bold, color: rgb(1, 1, 1) });
    page.drawText('Keep this package for your records', { x: 50, y: 728, size: 11, font: regular, color: rgb(0.8, 0.85, 0.95) });

    let y = 650;
    page.drawText(`Applicant: ${app.first_name} ${app.last_name}`, { x: 50, y, size: 12, font: bold }); y -= 20;
    page.drawText(`Reference: ${app.id}`, { x: 50, y, size: 10, font: regular, color: SLATE }); y -= 30;

    page.drawText('This package includes:', { x: 50, y, size: 11, font: bold }); y -= 20;
    const items = [
      '1. Form W-7 — Application for IRS Individual Taxpayer Identification Number',
      '2. Certificate of Accuracy, completed by your Certified Acceptance Agent',
      '3. Copy of your associated federal tax return (Form 1040), if applicable',
    ];
    for (const item of items) {
      page.drawText(item, { x: 60, y, size: 10, font: regular, color: rgb(0.15, 0.17, 0.22) });
      y -= 18;
    }
    y -= 12;
    page.drawText('Review every page for accuracy before it is mailed to the IRS. Contact PATSL immediately', { x: 50, y, size: 9, font: regular, color: SLATE }); y -= 13;
    page.drawText('if any name, date, or identification detail needs correction.', { x: 50, y, size: 9, font: regular, color: SLATE }); y -= 26;

    page.drawText(`Prepared by ${caseData.caaBusinessName}`, { x: 50, y, size: 9, font: regular, color: SLATE });
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
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { applicationId, packageType = 'IRS_MAIL' } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required.' }, { status: 400 });
    }

    const pool = getPool();
    const db = await pool.connect();
    let app: any;
    try {
      const result = await db.query(
        `SELECT a.*, c.first_name, c.last_name, c.email, c.phone
         FROM applications a
         JOIN clients c ON c.id = a.client_id
         WHERE a.id = $1`,
        [applicationId]
      );
      app = result.rows[0];
    } finally {
      db.release();
    }

    if (!app) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    const caseData = hydrateCaseData(app);

    const w7Doc = await buildW7(caseData);
    const coaDoc = await buildCOA(caseData);
    const f1040Doc = await buildF1040(caseData);

    const mergedDoc = await PDFDocument.create();
    let sequence: PDFDocument[] = [];

    if (packageType === 'CAA_RECORD') {
      sequence = [await buildIrsCoverPage(app, caseData)(), w7Doc, coaDoc];
    } else if (packageType === 'CLIENT_COPY') {
      sequence = [await buildClientCoverPage(app, caseData)(), w7Doc, coaDoc, f1040Doc];
    } else {
      sequence = [await buildIrsCoverPage(app, caseData)(), w7Doc, coaDoc, f1040Doc];
    }

    for (const pdf of sequence) {
      const pages = await mergedDoc.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => mergedDoc.addPage(p));
    }

    const bytes = await mergedDoc.save();
    await getPool().query(
      `INSERT INTO audit_events (application_id, event_type, actor, metadata)
       VALUES ($1, 'PACKAGE_GENERATED', 'admin', $2)`,
      [applicationId, JSON.stringify({ packageType })]
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
