'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  countryOfCitizenship: string;
};

type CaseDetails = {
  exceptionType: string;
  mailingAddress: string;
  foreignAddress: string;
  serviceTier: string;
};

const STEP_LABELS = ['Personal info', 'Case details', 'Identity verification', 'Review & payment'];

const DRAFT_KEY = 'patsl-intake-draft';

const emptyPersonal: PersonalInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  countryOfCitizenship: '',
};

const emptyCase: CaseDetails = {
  exceptionType: 'STANDARD_RETURN',
  mailingAddress: '',
  foreignAddress: '',
  serviceTier: 'CAA_CONCIERGE',
};

export default function IntakeWizard() {
  const searchParams = useSearchParams();
  const successReturn = searchParams.get('success') === 'true';
  const returnedApplicationId = searchParams.get('applicationId');
  const tierParam = searchParams.get('tier');

  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState<PersonalInfo>(emptyPersonal);
  const [caseDetails, setCaseDetails] = useState<CaseDetails>(emptyCase);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const [creatingIntake, setCreatingIntake] = useState(false);
  const [intakeError, setIntakeError] = useState('');

  const [docType, setDocType] = useState('PASSPORT');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuingCountry, setIssuingCountry] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [docError, setDocError] = useState('');
  const [docSkipped, setDocSkipped] = useState(false);

  const [creatingPayment, setCreatingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [paymentAttempted, setPaymentAttempted] = useState(false);

  useEffect(() => {
    if (tierParam) {
      setCaseDetails((prev) => ({ ...prev, serviceTier: tierParam }));
    }
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        if (draft.personal) setPersonal(draft.personal);
        if (draft.caseDetails) setCaseDetails((prev) => ({ ...prev, ...draft.caseDetails, ...(tierParam ? { serviceTier: tierParam } : {}) }));
        if (draft.applicationId) setApplicationId(draft.applicationId);
        if (draft.step) setStep(draft.step);
      } catch {
        // ignore malformed draft
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (successReturn) return;
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ personal, caseDetails, applicationId, step }));
  }, [personal, caseDetails, applicationId, step, successReturn]);

  const updatePersonal = (field: keyof PersonalInfo, value: string) => setPersonal((prev) => ({ ...prev, [field]: value }));
  const updateCase = (field: keyof CaseDetails, value: string) => setCaseDetails((prev) => ({ ...prev, [field]: value }));

  const canContinueStep1 = personal.firstName.trim() && personal.lastName.trim() && personal.email.trim();

  async function submitStep2(e: FormEvent) {
    e.preventDefault();
    setIntakeError('');

    if (applicationId) {
      setStep(3);
      return;
    }

    setCreatingIntake(true);
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...personal, ...caseDetails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create your application.');
      setApplicationId(data.applicationId);
      setStep(3);
    } catch (err: any) {
      setIntakeError(err.message || 'Could not create your application.');
    } finally {
      setCreatingIntake(false);
    }
  }

  async function uploadDocument(e: FormEvent) {
    e.preventDefault();
    if (!file || !applicationId) return;
    setUploading(true);
    setDocError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicationId', applicationId);
      formData.append('docType', docType);

      const uploadRes = await fetch('/api/documents/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed.');

      await fetch('/api/documents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          docType,
          documentNumber,
          issuingCountry,
          expirationDate: expirationDate || null,
          storagePath: uploadData.url,
        }),
      });

      setUploadedUrl(uploadData.url);
    } catch (err: any) {
      setDocError(err.message || 'Upload failed. You can continue and send it later.');
    } finally {
      setUploading(false);
    }
  }

  async function submitPayment() {
    if (!applicationId) return;
    setCreatingPayment(true);
    setPaymentError('');
    setPaymentAttempted(true);
    try {
      const res = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, serviceTier: caseDetails.serviceTier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment link creation failed.');
      setCheckoutUrl(data.checkoutUrl);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Payment link creation failed.');
    } finally {
      setCreatingPayment(false);
    }
  }

  const tierLabel = useMemo(() => {
    const labels: Record<string, string> = {
      EXPRESS_SELF_SERVICE: 'Express Self-Service - $149',
      CAA_CONCIERGE: 'CAA Concierge - $349',
      B2B_PORTAL: 'B2B Wholesale - $99',
    };
    return labels[caseDetails.serviceTier] || caseDetails.serviceTier;
  }, [caseDetails.serviceTier]);

  if (successReturn) {
    return (
      <section className="container-page py-16 text-center md:py-24">
        <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl text-white">✓</span>
          <h1 className="mt-4 text-2xl font-bold text-ink-900">Payment received</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your case is now in CAA review. Save your reference ID to track progress any time.
          </p>
          {returnedApplicationId && (
            <p className="mt-4 rounded-lg bg-white px-4 py-3 font-mono text-sm text-ink-900">{returnedApplicationId}</p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/status" className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
              Track my case
            </Link>
            <Link href="/" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-white">
              Back to home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page py-10 md:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Secure Intake</p>
        <h1 className="mt-2 text-3xl font-bold text-ink-900">PATSL ITIN Application Portal</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create your application record, verify identity, choose a service tier, and complete payment.
        </p>

        <ol className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STEP_LABELS.map((label, index) => {
            const stepNumber = index + 1;
            const active = stepNumber === step;
            const done = stepNumber < step;
            return (
              <li
                key={label}
                className={`rounded-lg border p-3 text-xs font-semibold ${
                  active
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : done
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                Step {stepNumber} &middot; {label}
              </li>
            );
          })}
        </ol>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canContinueStep1) setStep(2);
              }}
              className="grid gap-4 md:grid-cols-2"
            >
              <input required className="rounded-lg border border-slate-300 p-3" placeholder="First name" value={personal.firstName} onChange={(e) => updatePersonal('firstName', e.target.value)} />
              <input required className="rounded-lg border border-slate-300 p-3" placeholder="Last name" value={personal.lastName} onChange={(e) => updatePersonal('lastName', e.target.value)} />
              <input required type="email" className="rounded-lg border border-slate-300 p-3" placeholder="Email" value={personal.email} onChange={(e) => updatePersonal('email', e.target.value)} />
              <input className="rounded-lg border border-slate-300 p-3" placeholder="Phone" value={personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} />
              <input type="date" className="rounded-lg border border-slate-300 p-3" value={personal.dateOfBirth} onChange={(e) => updatePersonal('dateOfBirth', e.target.value)} />
              <input className="rounded-lg border border-slate-300 p-3" placeholder="Country of citizenship" value={personal.countryOfCitizenship} onChange={(e) => updatePersonal('countryOfCitizenship', e.target.value)} />
              <button disabled={!canContinueStep1} className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:bg-slate-300 md:col-span-2">
                Continue
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={submitStep2} className="grid gap-4 md:grid-cols-2">
              {intakeError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:col-span-2">{intakeError}</div>}
              <select className="rounded-lg border border-slate-300 p-3 md:col-span-2" value={caseDetails.exceptionType} onChange={(e) => updateCase('exceptionType', e.target.value)}>
                <option value="STANDARD_RETURN">Standard filing with tax return</option>
                <option value="EXCEPTION_1A_PARTNERSHIP">Exception 1(a) partnership or U.S. LLC</option>
                <option value="TAX_TREATY">Tax treaty claim</option>
              </select>
              <select className="rounded-lg border border-slate-300 p-3 md:col-span-2" value={caseDetails.serviceTier} onChange={(e) => updateCase('serviceTier', e.target.value)}>
                <option value="EXPRESS_SELF_SERVICE">Express Self-Service - $149</option>
                <option value="CAA_CONCIERGE">CAA Concierge - $349</option>
                <option value="B2B_PORTAL">B2B Wholesale - $99</option>
              </select>
              <textarea className="rounded-lg border border-slate-300 p-3 md:col-span-2" rows={3} placeholder="U.S. mailing address" value={caseDetails.mailingAddress} onChange={(e) => updateCase('mailingAddress', e.target.value)} />
              <textarea className="rounded-lg border border-slate-300 p-3 md:col-span-2" rows={3} placeholder="Foreign address" value={caseDetails.foreignAddress} onChange={(e) => updateCase('foreignAddress', e.target.value)} />
              <div className="flex gap-3 md:col-span-2">
                <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-ink-900 hover:bg-ink-50">
                  Back
                </button>
                <button disabled={creatingIntake} className="flex-1 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:bg-slate-400">
                  {creatingIntake ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div>
              {applicationId && (
                <p className="mb-4 rounded-lg bg-ink-50 px-4 py-3 text-xs text-slate-600">
                  Application reference: <span className="font-mono font-semibold text-ink-900">{applicationId}</span> — save this to track your case later.
                </p>
              )}

              {uploadedUrl ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  Identity document received. You can continue to review &amp; payment.
                </div>
              ) : (
                <form onSubmit={uploadDocument} className="grid gap-4 md:grid-cols-2">
                  {docError && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 md:col-span-2">{docError}</div>}
                  <select className="rounded-lg border border-slate-300 p-3" value={docType} onChange={(e) => setDocType(e.target.value)}>
                    <option value="PASSPORT">Passport (bio page)</option>
                    <option value="NATIONAL_ID">National ID card</option>
                    <option value="BIRTH_CERTIFICATE">Birth certificate</option>
                  </select>
                  <input className="rounded-lg border border-slate-300 p-3" placeholder="Document number" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
                  <input className="rounded-lg border border-slate-300 p-3" placeholder="Issuing country" value={issuingCountry} onChange={(e) => setIssuingCountry(e.target.value)} />
                  <input type="date" className="rounded-lg border border-slate-300 p-3" placeholder="Expiration date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Upload a clear photo or scan (JPG, PNG, or PDF, up to 10MB)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="mt-2 block w-full text-sm"
                    />
                  </div>
                  <button disabled={!file || uploading} className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:bg-slate-300 md:col-span-2">
                    {uploading ? 'Uploading...' : 'Upload document'}
                  </button>
                </form>
              )}

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-ink-900 hover:bg-ink-50">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!uploadedUrl) setDocSkipped(true);
                    setStep(4);
                  }}
                  className="flex-1 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
                >
                  {uploadedUrl ? 'Continue to review' : 'Skip for now & continue'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <dl className="grid gap-3 rounded-lg bg-ink-50 p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-xs uppercase tracking-wider text-slate-500">Name</dt><dd className="font-medium text-ink-900">{personal.firstName} {personal.lastName}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-slate-500">Email</dt><dd className="font-medium text-ink-900">{personal.email}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-slate-500">Service tier</dt><dd className="font-medium text-ink-900">{tierLabel}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-slate-500">Identity document</dt><dd className="font-medium text-ink-900">{uploadedUrl ? 'Received' : docSkipped ? 'Pending — you can email it later' : 'Not uploaded'}</dd></div>
              </dl>

              {paymentError && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{paymentError}</div>}

              {!paymentAttempted && (
                <p className="mt-4 text-xs text-slate-500">
                  Clicking below creates a secure Square payment link for {tierLabel.split(' - ')[1] || tierLabel} and moves
                  your case into CAA review once paid.
                </p>
              )}

              {paymentAttempted && !creatingPayment && !checkoutUrl && !paymentError && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Your application is saved. Online payment isn&apos;t configured for this deployment yet, so our team
                  will follow up directly to collect payment.
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setStep(3)} className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-ink-900 hover:bg-ink-50">
                  Back
                </button>
                <button
                  type="button"
                  onClick={submitPayment}
                  disabled={creatingPayment || !applicationId}
                  className="flex-1 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:bg-slate-400"
                >
                  {creatingPayment ? 'Preparing checkout...' : 'Proceed to secure payment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
