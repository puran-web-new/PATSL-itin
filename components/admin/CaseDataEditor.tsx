'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CaseData,
  Dependent,
  REASON_LABELS,
  deriveFinancials,
  emptyCaseData,
  hydrateCaseData,
} from '../../lib/caseData';

type ApplicationRow = {
  id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  service_tier: string;
  date_of_birth: string | null;
  country_of_citizenship: string | null;
  mailing_address: string | null;
  foreign_address: string | null;
  w7_data: Record<string, any>;
};

const hydrate = hydrateCaseData;

const emptyDependent: Dependent = {
  firstLast: '',
  ssnOrItin: '',
  relationship: '',
  childTaxCredit: false,
  creditForOtherDependents: false,
};

export default function CaseDataEditor({
  applicationId,
  token,
  onLoaded,
}: {
  applicationId: string;
  token: string;
  onLoaded?: (info: { clientId: string; firstName: string; lastName: string }) => void;
}) {
  const [application, setApplication] = useState<ApplicationRow | null>(null);
  const [data, setData] = useState<CaseData>(emptyCaseData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [appRes, firmRes] = await Promise.all([
          fetch(`/api/admin/applications/${applicationId}`, { headers: { 'x-admin-token': token } }),
          fetch('/api/admin/firm-profile', { headers: { 'x-admin-token': token } }),
        ]);
        const result = await appRes.json();
        if (!appRes.ok) throw new Error(result.error || 'Failed to load application.');
        setApplication(result.application);
        onLoaded?.({
          clientId: result.application.client_id,
          firstName: result.application.first_name,
          lastName: result.application.last_name,
        });

        let hydrated = hydrate(result.application);
        if (firmRes.ok) {
          const { firmProfile } = await firmRes.json();
          // Only fill in firm/CAA fields if this case has never had them customized —
          // never clobber something staff already typed for this specific case.
          if (!hydrated.caaEin && !hydrated.caaPtin && !hydrated.caaOfficeCode) {
            hydrated = {
              ...hydrated,
              caaBusinessName: hydrated.caaBusinessName || firmProfile.businessName,
              caaEin: firmProfile.ein,
              caaPtin: firmProfile.ptin,
              caaOfficeCode: firmProfile.officeCode,
              caaReviewerName: hydrated.caaReviewerName || firmProfile.reviewerName,
              caaReviewerTitle: hydrated.caaReviewerTitle || firmProfile.reviewerTitle,
              firmPhone: hydrated.firmPhone || firmProfile.phone,
              firmAddress: hydrated.firmAddress || firmProfile.address,
            };
          }
        }
        setData(hydrated);
      } catch (err: any) {
        setError(err.message || 'Failed to load application.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  function set<K extends keyof CaseData>(field: K, value: CaseData[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function toggleReason(code: string) {
    setData((prev) => ({
      ...prev,
      reasonCodes: prev.reasonCodes.includes(code)
        ? prev.reasonCodes.filter((c) => c !== code)
        : [...prev.reasonCodes, code],
    }));
    setSaved(false);
  }

  function updateDependent(index: number, patch: Partial<Dependent>) {
    setData((prev) => {
      const next = [...prev.dependents];
      next[index] = { ...next[index], ...patch };
      return { ...prev, dependents: next };
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}/case-data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ caseData: data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Save failed.');
      setSaved(true);
    } catch (err: any) {
      setError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function generate(packageType: 'IRS_MAIL' | 'CLIENT_COPY' | 'CAA_RECORD' | 'W7_ONLY' | 'COA_ONLY' | 'F1040_ONLY' | 'INVOICE_ONLY' | 'MAILING_LABEL_ONLY') {
    setGenerating(packageType);
    setError('');
    try {
      await save();
      const res = await fetch('/api/generate-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ applicationId, packageType }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Package generation failed.');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PATSL_${packageType}_${application?.last_name || applicationId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Package generation failed.');
    } finally {
      setGenerating(null);
    }
  }

  if (loading) return <p className="text-slate-400">Loading application...</p>;
  if (!application) return <p className="text-red-400">{error || 'Application not found.'}</p>;

  const totals = deriveFinancials(data);
  const input = 'w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm text-white placeholder:text-slate-400';
  const label = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500';

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {error && <div className="rounded-lg border border-red-900 bg-red-950 p-4 text-sm text-red-200">{error}</div>}

        <Section title="Identity" usedOn={['W-7', 'COA', '1040']}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="First name"><input className={input} value={data.firstName} onChange={(e) => set('firstName', e.target.value)} /></Field>
            <Field label="Middle name"><input className={input} value={data.middleName} onChange={(e) => set('middleName', e.target.value)} /></Field>
            <Field label="Last name"><input className={input} value={data.lastName} onChange={(e) => set('lastName', e.target.value)} /></Field>
            <Field label="Name at birth (if different)"><input className={input} value={data.nameAtBirth} onChange={(e) => set('nameAtBirth', e.target.value)} /></Field>
            <Field label="Date of birth"><input type="date" className={input} value={data.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} /></Field>
            <Field label="Country of birth"><input className={input} value={data.countryOfBirth} onChange={(e) => set('countryOfBirth', e.target.value)} /></Field>
            <Field label="Birth city / state"><input className={input} value={data.birthCityState} onChange={(e) => set('birthCityState', e.target.value)} /></Field>
            <Field label="Sex">
              <select className={input} value={data.sex} onChange={(e) => set('sex', e.target.value as CaseData['sex'])}>
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </Field>
            <Field label="Country of citizenship"><input className={input} value={data.countryOfCitizenship} onChange={(e) => set('countryOfCitizenship', e.target.value)} /></Field>
          </div>
        </Section>

        <Section title="Reason for applying (Form W-7)" usedOn={['W-7']}>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(REASON_LABELS).map(([code, text]) => (
              <label key={code} className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
                <input type="checkbox" className="mt-0.5" checked={data.reasonCodes.includes(code)} onChange={() => toggleReason(code)} />
                <span><strong className="text-slate-200">{code}.</strong> {text}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(data.reasonCodes.includes('a') || data.reasonCodes.includes('f')) && (
              <>
                <Field label="Treaty country"><input className={input} value={data.treatyCountry} onChange={(e) => set('treatyCountry', e.target.value)} /></Field>
                <Field label="Treaty article number"><input className={input} value={data.treatyArticleNumber} onChange={(e) => set('treatyArticleNumber', e.target.value)} /></Field>
              </>
            )}
            {(data.reasonCodes.includes('d') || data.reasonCodes.includes('e')) && (
              <>
                <Field label="Relationship to U.S. citizen/resident"><input className={input} value={data.dependentRelationship} onChange={(e) => set('dependentRelationship', e.target.value)} /></Field>
                <Field label="U.S. citizen/resident name"><input className={input} value={data.usCitizenName} onChange={(e) => set('usCitizenName', e.target.value)} /></Field>
                <Field label="Their SSN/ITIN"><input className={input} value={data.usCitizenSsnOrItin} onChange={(e) => set('usCitizenSsnOrItin', e.target.value)} /></Field>
              </>
            )}
            {data.reasonCodes.includes('h') && (
              <Field label="Other — describe"><input className={input} value={data.reasonOtherDetails} onChange={(e) => set('reasonOtherDetails', e.target.value)} /></Field>
            )}
          </div>
        </Section>

        <Section title="Mailing & foreign address" usedOn={['W-7', '1040']}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Mailing street"><input className={input} value={data.mailingStreet} onChange={(e) => set('mailingStreet', e.target.value)} /></Field>
            <Field label="Apt / route"><input className={input} value={data.mailingAptOrRoute} onChange={(e) => set('mailingAptOrRoute', e.target.value)} /></Field>
            <Field label="City"><input className={input} value={data.mailingCity} onChange={(e) => set('mailingCity', e.target.value)} /></Field>
            <Field label="State"><input className={input} value={data.mailingState} onChange={(e) => set('mailingState', e.target.value)} /></Field>
            <Field label="ZIP"><input className={input} value={data.mailingZip} onChange={(e) => set('mailingZip', e.target.value)} /></Field>
            <span />
            <Field label="Foreign street"><input className={input} value={data.foreignStreet} onChange={(e) => set('foreignStreet', e.target.value)} /></Field>
            <Field label="Foreign city"><input className={input} value={data.foreignCity} onChange={(e) => set('foreignCity', e.target.value)} /></Field>
            <Field label="Foreign province/county"><input className={input} value={data.foreignProvince} onChange={(e) => set('foreignProvince', e.target.value)} /></Field>
            <Field label="Foreign postal code"><input className={input} value={data.foreignPostalCode} onChange={(e) => set('foreignPostalCode', e.target.value)} /></Field>
            <Field label="Foreign country"><input className={input} value={data.foreignCountry} onChange={(e) => set('foreignCountry', e.target.value)} /></Field>
          </div>
        </Section>

        <Section title="Identification document" usedOn={['W-7', 'COA']}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Document type">
              <select className={input} value={data.idDocType} onChange={(e) => set('idDocType', e.target.value as CaseData['idDocType'])}>
                <option value="PASSPORT">Passport</option>
                <option value="NATIONAL_ID">National ID</option>
                <option value="DRIVERS_LICENSE">Driver's license / State ID</option>
                <option value="USCIS">USCIS documentation</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="Issued by"><input className={input} value={data.idIssuedBy} onChange={(e) => set('idIssuedBy', e.target.value)} /></Field>
            <Field label="Document number"><input className={input} value={data.idNumber} onChange={(e) => set('idNumber', e.target.value)} /></Field>
            <Field label="Expiration date"><input type="date" className={input} value={data.idExpirationDate} onChange={(e) => set('idExpirationDate', e.target.value)} /></Field>
            <Field label="Date of entry into U.S."><input type="date" className={input} value={data.dateOfEntryUs} onChange={(e) => set('dateOfEntryUs', e.target.value)} /></Field>
            <Field label="Foreign tax ID (if any)"><input className={input} value={data.foreignTaxId} onChange={(e) => set('foreignTaxId', e.target.value)} /></Field>
            <Field label="Visa type"><input className={input} value={data.visaType} onChange={(e) => set('visaType', e.target.value)} /></Field>
            <Field label="Visa number"><input className={input} value={data.visaNumber} onChange={(e) => set('visaNumber', e.target.value)} /></Field>
            <Field label="Visa expiration"><input type="date" className={input} value={data.visaExpirationDate} onChange={(e) => set('visaExpirationDate', e.target.value)} /></Field>
            <Field label="Previous ITIN / IRSN (if any)"><input className={input} value={data.previousItinOrIrsn} onChange={(e) => set('previousItinOrIrsn', e.target.value)} /></Field>
          </div>
          <p className="mb-2 mt-5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">School / sponsor (line 6g — F/J/M/Q visa holders)</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="School or company name"><input className={input} value={data.schoolOrCompanyName} onChange={(e) => set('schoolOrCompanyName', e.target.value)} /></Field>
            <Field label="City and state"><input className={input} value={data.schoolCityState} onChange={(e) => set('schoolCityState', e.target.value)} /></Field>
            <Field label="Length of stay"><input className={input} value={data.lengthOfStay} onChange={(e) => set('lengthOfStay', e.target.value)} placeholder="e.g. 08/2026 - 05/2028" /></Field>
          </div>
        </Section>

        <Section title="Contact" usedOn={['W-7', '1040']}>
          <p className="mb-3 text-[11px] text-slate-500">
            Phone and email are prefilled from the application. Update any field here, then save before generating the PDF.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Phone"><input className={input} value={data.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
            <Field label="Email"><input className={input} value={data.email} onChange={(e) => set('email', e.target.value)} /></Field>
            <Field label="Occupation"><input className={input} value={data.occupation} onChange={(e) => set('occupation', e.target.value)} /></Field>
          </div>
        </Section>

        <Section title="Dependents" usedOn={['1040']}>
          <div className="space-y-3">
            {data.dependents.map((dep, index) => (
              <div key={index} className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 sm:grid-cols-6">
                <input className={`${input} sm:col-span-2`} placeholder="Full name" value={dep.firstLast} onChange={(e) => updateDependent(index, { firstLast: e.target.value })} />
                <input className={`${input} sm:col-span-2`} placeholder="SSN / ITIN" value={dep.ssnOrItin} onChange={(e) => updateDependent(index, { ssnOrItin: e.target.value })} />
                <input className={input} placeholder="Relationship" value={dep.relationship} onChange={(e) => updateDependent(index, { relationship: e.target.value })} />
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <label className="flex items-center gap-1"><input type="checkbox" checked={dep.childTaxCredit} onChange={(e) => updateDependent(index, { childTaxCredit: e.target.checked })} /> CTC</label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={dep.creditForOtherDependents} onChange={(e) => updateDependent(index, { creditForOtherDependents: e.target.checked })} /> ODC</label>
                  <button
                    type="button"
                    onClick={() => setData((prev) => ({ ...prev, dependents: prev.dependents.filter((_, i) => i !== index) }))}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {data.dependents.length < 6 && (
              <button
                type="button"
                onClick={() => setData((prev) => ({ ...prev, dependents: [...prev.dependents, { ...emptyDependent }] }))}
                className="rounded-lg border border-dashed border-slate-700 px-4 py-2 text-xs font-semibold text-slate-400 hover:border-teal-500 hover:text-teal-300"
              >
                + Add dependent
              </button>
            )}
          </div>
        </Section>

        <Section title="Form 1040 — filing & income" usedOn={['1040']}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Filing status">
              <select className={input} value={data.filingStatus} onChange={(e) => set('filingStatus', e.target.value as CaseData['filingStatus'])}>
                <option value="">Select</option>
                <option value="SINGLE">Single</option>
                <option value="MARRIED_FILING_JOINTLY">Married filing jointly</option>
                <option value="MARRIED_FILING_SEPARATELY">Married filing separately</option>
                <option value="HEAD_OF_HOUSEHOLD">Head of household</option>
                <option value="QUALIFYING_SURVIVING_SPOUSE">Qualifying surviving spouse</option>
              </select>
            </Field>
            <Field label="Digital assets received/sold?">
              <select className={input} value={data.digitalAssets} onChange={(e) => set('digitalAssets', e.target.value as CaseData['digitalAssets'])}>
                <option value="">Select</option>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </select>
            </Field>
            <span />
            <Field label="Wages, salaries, tips (line 1a)"><input inputMode="decimal" className={input} value={data.wagesLine1a} onChange={(e) => set('wagesLine1a', e.target.value)} /></Field>
            <Field label="Other income total"><input inputMode="decimal" className={input} value={data.otherIncomeTotal} onChange={(e) => set('otherIncomeTotal', e.target.value)} /></Field>
            <Field label="Adjustments to income"><input inputMode="decimal" className={input} value={data.adjustmentsToIncome} onChange={(e) => set('adjustmentsToIncome', e.target.value)} /></Field>
            <Field label="Standard deduction (auto if blank)"><input inputMode="decimal" className={input} value={data.standardDeduction} onChange={(e) => set('standardDeduction', e.target.value)} /></Field>
            <Field label="Tax amount (from tax table/software)"><input inputMode="decimal" className={input} value={data.taxAmount} onChange={(e) => set('taxAmount', e.target.value)} /></Field>
          </div>
        </Section>

        <Section title="Form 1040 — payments & refund" usedOn={['1040']}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Federal income tax withheld"><input inputMode="decimal" className={input} value={data.federalWithholding} onChange={(e) => set('federalWithholding', e.target.value)} /></Field>
            <Field label="Estimated tax payments"><input inputMode="decimal" className={input} value={data.estimatedTaxPayments} onChange={(e) => set('estimatedTaxPayments', e.target.value)} /></Field>
            <Field label="Refund account type">
              <select className={input} value={data.refundAccountType} onChange={(e) => set('refundAccountType', e.target.value as CaseData['refundAccountType'])}>
                <option value="">None / mail check</option>
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
              </select>
            </Field>
            <Field label="Routing number"><input className={input} value={data.refundRoutingNumber} onChange={(e) => set('refundRoutingNumber', e.target.value)} /></Field>
            <Field label="Account number"><input className={input} value={data.refundAccountNumber} onChange={(e) => set('refundAccountNumber', e.target.value)} /></Field>
          </div>
        </Section>

        <Section title="Firm credentials & paid preparer" usedOn={['W-7', 'COA', '1040']}>
          <p className="mb-3 text-[11px] text-slate-500">These values automatically fill the W-7, Certificate of Accuracy, and Form 1040 Paid Preparer boxes. The Form 1040 signature box is left blank for the preparer to sign.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Firm name"><input className={input} value={data.caaBusinessName} onChange={(e) => set('caaBusinessName', e.target.value)} /></Field>
            <Field label="Firm EIN"><input className={input} value={data.caaEin} onChange={(e) => set('caaEin', e.target.value)} /></Field>
            <Field label="Preparer PTIN"><input className={input} value={data.caaPtin} onChange={(e) => set('caaPtin', e.target.value)} /></Field>
            <Field label="Office code"><input className={input} value={data.caaOfficeCode} onChange={(e) => set('caaOfficeCode', e.target.value)} /></Field>
            <Field label="Preparer name"><input className={input} value={data.caaReviewerName} onChange={(e) => set('caaReviewerName', e.target.value)} /></Field>
            <Field label="Firm phone"><input type="tel" className={input} value={data.firmPhone} onChange={(e) => set('firmPhone', e.target.value)} /></Field>
            <Field label="Firm address"><input className={input} value={data.firmAddress} onChange={(e) => set('firmAddress', e.target.value)} /></Field>
            <Field label="Reviewer title"><input className={input} value={data.caaReviewerTitle} onChange={(e) => set('caaReviewerTitle', e.target.value)} /></Field>
            <Field label="Documents reviewed summary"><input className={input} value={data.documentsReviewedSummary} onChange={(e) => set('documentsReviewedSummary', e.target.value)} placeholder="e.g. Original passport reviewed and returned to applicant" /></Field>
            <Field label="Signature date"><input type="date" className={input} value={data.signatureDate} onChange={(e) => set('signatureDate', e.target.value)} /></Field>
          </div>
        </Section>

        <Section title="Invoice & payment" usedOn={['Invoice']}>
          <p className="mb-3 text-[11px] text-slate-500">
            Leave these blank to use the real Square order on file automatically. Only fill them in for a
            payment taken outside Square (cash, check, or a manual override of the fee).
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Invoice number (auto if blank)"><input className={input} value={data.invoiceNumber} onChange={(e) => set('invoiceNumber', e.target.value)} placeholder={`INV-${applicationId.slice(0, 8).toUpperCase()}`} /></Field>
            <Field label="Payment method override"><input className={input} value={data.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)} placeholder="e.g. Cash, Check, Zelle" /></Field>
            <Field label="Service fee override ($)"><input inputMode="decimal" className={input} value={data.serviceFeeOverride} onChange={(e) => set('serviceFeeOverride', e.target.value)} placeholder="Uses service tier price if blank" /></Field>
          </div>
        </Section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Applicant</p>
          <p className="mt-1 text-sm font-bold text-white">{application.first_name} {application.last_name}</p>
          <p className="text-xs text-slate-500">{application.email}</p>
          <p className="mt-2 font-mono text-[10px] text-slate-400">{application.id}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Computed totals</p>
          <dl className="mt-2 space-y-1.5">
            <Row label="Total income" value={totals.totalIncome} />
            <Row label="AGI" value={totals.agi} />
            <Row label="Standard deduction" value={totals.standardDeduction} />
            <Row label="Taxable income" value={totals.taxableIncome} />
            <Row label="Total payments" value={totals.totalPayments} />
            <Row label={totals.refund > 0 ? 'Refund' : 'Amount owed'} value={totals.refund > 0 ? totals.refund : totals.amountOwed} highlight />
          </dl>
          <p className="mt-3 text-[10px] leading-4 text-slate-500">
            Totals are simple addition/subtraction of the figures entered above — enter your reviewed Tax amount
            from the IRS Tax Table or your tax software; this tool does not calculate tax liability.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <button type="button" onClick={() => setShowReview((v) => !v)} className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            Review &amp; validate
            <span className="text-slate-400">{showReview ? '−' : '+'}</span>
          </button>
          {showReview && (
            <dl className="mt-3 space-y-1.5 text-xs text-slate-300">
              <ReviewRow label="Name" value={[data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ') || '—'} />
              <ReviewRow label="Date of birth" value={data.dateOfBirth || '—'} />
              <ReviewRow label="Reason for applying" value={data.reasonCodes.length ? data.reasonCodes.join(', ') : '—'} />
              <ReviewRow label="Mailing address" value={[data.mailingStreet, data.mailingCity, data.mailingState, data.mailingZip].filter(Boolean).join(', ') || '—'} />
              <ReviewRow label="Foreign address" value={[data.foreignStreet, data.foreignCity, data.foreignCountry].filter(Boolean).join(', ') || '—'} />
              <ReviewRow label="ID document" value={data.idNumber ? `${data.idDocType.replace(/_/g, ' ')} #${data.idNumber}` : '—'} />
              <ReviewRow label="ID expires" value={data.idExpirationDate || '—'} />
              <ReviewRow label="Filing status" value={data.filingStatus || 'Not set'} />
              <ReviewRow label="Dependents" value={String(data.dependents.length)} />
              <ReviewRow label="CAA reviewer" value={data.caaReviewerName || '—'} />
              <ReviewRow label="CAA EIN / PTIN" value={`${data.caaEin || '—'} / ${data.caaPtin || '—'}`} />
            </dl>
          )}
        </div>

        <div className="space-y-2">
          <button onClick={save} disabled={saving} className="btn-pill-primary w-full disabled:opacity-40">
            {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save case data'}
          </button>
          <button onClick={() => generate('IRS_MAIL')} disabled={!!generating} className="w-full rounded-lg border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900 disabled:opacity-50">
            {generating === 'IRS_MAIL' ? 'Generating...' : 'Generate IRS mail package'}
          </button>
          <p className="px-1 text-[10.5px] text-slate-500">
            Includes a printable USPS Flat Rate Envelope mailing label as the last page, generated automatically.
          </p>
          <button onClick={() => generate('CLIENT_COPY')} disabled={!!generating} className="w-full rounded-lg border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900 disabled:opacity-50">
            {generating === 'CLIENT_COPY' ? 'Generating...' : 'Generate full client copy'}
          </button>
          <button onClick={() => generate('CAA_RECORD')} disabled={!!generating} className="w-full rounded-lg border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900 disabled:opacity-50">
            {generating === 'CAA_RECORD' ? 'Generating...' : 'Generate CAA record copy'}
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Individual documents</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => generate('W7_ONLY')} disabled={!!generating} className="rounded-lg border border-slate-700 px-2 py-2 text-[11px] font-semibold text-slate-300 hover:bg-slate-900 disabled:opacity-50">
              {generating === 'W7_ONLY' ? '...' : 'W-7 only'}
            </button>
            <button onClick={() => generate('COA_ONLY')} disabled={!!generating} className="rounded-lg border border-slate-700 px-2 py-2 text-[11px] font-semibold text-slate-300 hover:bg-slate-900 disabled:opacity-50">
              {generating === 'COA_ONLY' ? '...' : 'COA only'}
            </button>
            <button onClick={() => generate('F1040_ONLY')} disabled={!!generating} className="rounded-lg border border-slate-700 px-2 py-2 text-[11px] font-semibold text-slate-300 hover:bg-slate-900 disabled:opacity-50">
              {generating === 'F1040_ONLY' ? '...' : '1040 only'}
            </button>
            <button onClick={() => generate('INVOICE_ONLY')} disabled={!!generating} className="rounded-lg border border-slate-700 px-2 py-2 text-[11px] font-semibold text-slate-300 hover:bg-slate-900 disabled:opacity-50">
              {generating === 'INVOICE_ONLY' ? '...' : 'Invoice only'}
            </button>
            <button onClick={() => generate('MAILING_LABEL_ONLY')} disabled={!!generating} className="col-span-2 rounded-lg border border-slate-700 px-2 py-2 text-[11px] font-semibold text-slate-300 hover:bg-slate-900 disabled:opacity-50">
              {generating === 'MAILING_LABEL_ONLY' ? '...' : 'Mailing label only (USPS Flat Rate)'}
            </button>
          </div>
        </div>

      </aside>
    </div>
  );
}

function Section({ title, usedOn, children }: { title: string; usedOn?: string[]; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-teal-300">{title}</h2>
        {usedOn && usedOn.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Used on:</span>
            {usedOn.map((doc) => (
              <span key={doc} className="rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-[9.5px] font-bold text-slate-400">
                {doc}
              </span>
            ))}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-400">{label}</dt>
      <dd className={highlight ? 'font-bold text-teal-300' : 'text-slate-200'}>
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </dd>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="flex-none text-[10.5px] text-slate-500">{label}</dt>
      <dd className="text-right text-[11px] text-slate-200">{value}</dd>
    </div>
  );
}
