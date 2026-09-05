'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { applicationReference } from '../../lib/applicationReference';

type PersonalInfo = {
  firstName: string;
  middleName: string;
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

const STEP_LABELS = ['Personal info', 'Case details', 'Identity verification', 'Review & submit'];

const DRAFT_KEY = 'patsl-intake-draft';

const emptyPersonal: PersonalInfo = {
  firstName: '',
  middleName: '',
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

const inputClass = 'rounded-lg border border-white/10 bg-abyss-panel p-3 text-white placeholder:text-slate-500';

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
  const [intakeSubmitted, setIntakeSubmitted] = useState(false);

  const [resumeError, setResumeError] = useState('');
  const [resumingLink, setResumingLink] = useState(false);

  useEffect(() => {
    if (tierParam) {
      setCaseDetails((prev) => ({ ...prev, serviceTier: tierParam }));
    }
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    let resumedFromLocalDraft = false;
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        if (draft.personal) setPersonal(draft.personal);
        if (draft.caseDetails) setCaseDetails((prev) => ({ ...prev, ...draft.caseDetails, ...(tierParam ? { serviceTier: tierParam } : {}) }));
        if (draft.applicationId) { setApplicationId(draft.applicationId); resumedFromLocalDraft = true; }
        if (draft.step) setStep(draft.step);
      } catch {
        // ignore malformed draft
      }
    }

    // A staff-generated "Mode B" client intake link (?applicationId=...) with no
    // matching local draft yet — fetch the minimal prefill data staff already
    // entered (name/email/phone/tier) so the client isn't asked to re-type it.
    if (!resumedFromLocalDraft && !successReturn && returnedApplicationId) {
      setResumingLink(true);
      fetch(`/api/applications/resume?applicationId=${encodeURIComponent(returnedApplicationId)}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'This application link is no longer valid.');
          const app = data.application;
          setPersonal((prev) => ({ ...prev, firstName: app.first_name || '', middleName: app.middle_name || '', lastName: app.last_name || '', email: app.email || '', phone: app.phone || '' }));
          setCaseDetails((prev) => ({ ...prev, serviceTier: tierParam || app.service_tier || prev.serviceTier }));
          setApplicationId(app.id);
        })
        .catch((err) => setResumeError(err.message || 'This application link is no longer valid.'))
        .finally(() => setResumingLink(false));
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

  function submitIntake() {
    window.sessionStorage.removeItem(DRAFT_KEY);
    setIntakeSubmitted(true);
  }

  const tierLabel = useMemo(() => {
    const labels: Record<string, string> = {
      EXPRESS_SELF_SERVICE: 'Express Self-Service - $149',
      CAA_CONCIERGE: 'CAA Concierge - $180',
      B2B_PORTAL: 'B2B Wholesale - $99',
    };
    return labels[caseDetails.serviceTier] || caseDetails.serviceTier;
  }, [caseDetails.serviceTier]);

  if (successReturn || intakeSubmitted) {
    const completedApplicationId = successReturn ? returnedApplicationId : applicationId;
    const paymentCompleted = successReturn;
    return (
      <section className="relative overflow-hidden bg-abyss py-16 text-center md:py-24">
        <div className="bg-dot-grid absolute inset-0 opacity-40" />
        <div className="glass-card relative mx-auto max-w-lg border-mint-500/30 p-8 shadow-glow-mint">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mint-500 text-xl text-ink-950">✓</span>
          <h1 className="mt-4 text-2xl font-bold text-white">{paymentCompleted ? 'Payment received' : 'Intake submitted'}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {paymentCompleted
              ? 'Your case is now in CAA review. Save your reference ID to track progress any time.'
              : 'Thank you. Our team will review your intake and contact you about next steps, including payment.'}
          </p>
          {completedApplicationId && (
            <p className="mt-4 rounded-lg bg-abyss-panel px-4 py-3 font-mono text-sm text-white">{applicationReference(completedApplicationId)}</p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/status" className="btn-pill-primary">
              Track my case
            </Link>
            <Link href="/" className="btn-pill-ghost">
              Back to home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-abyss py-10 md:py-14">
      <div className="bg-dot-grid absolute inset-0 opacity-30" />
      <div className="container-page relative mx-auto max-w-3xl">
        <p className="label-mono text-[12px] font-semibold uppercase text-mint-400">Secure Intake</p>
        <h1 className="mt-2 text-3xl font-bold text-white">PATSL ITIN Application Portal</h1>
        <p className="mt-2 text-sm text-slate-400">
          Create your application record, verify identity, and choose a service tier. Payment is optional and can be arranged after review.
        </p>

        {resumingLink && (
          <div className="mt-4 rounded-lg border border-teal-500/30 bg-teal-500/10 p-3 text-sm text-teal-200">
            Loading the application your preparer started for you...
          </div>
        )}
        {resumeError && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-300">{resumeError}</div>
        )}

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
                    ? 'border-mint-500/60 bg-mint-500/10 text-mint-300'
                    : done
                    ? 'border-teal-400/30 bg-teal-500/10 text-teal-300'
                    : 'border-white/10 bg-abyss-panel text-slate-500'
                }`}
              >
                Step {stepNumber} &middot; {label}
              </li>
            );
          })}
        </ol>

        <div className="glass-card mt-8 p-8">
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canContinueStep1) setStep(2);
              }}
              className="grid gap-4 md:grid-cols-2"
            >
              <input required className={inputClass} placeholder="First name" value={personal.firstName} onChange={(e) => updatePersonal('firstName', e.target.value)} />
              <input className={inputClass} placeholder="Middle name (optional)" value={personal.middleName} onChange={(e) => updatePersonal('middleName', e.target.value)} />
              <input required className={inputClass} placeholder="Last name" value={personal.lastName} onChange={(e) => updatePersonal('lastName', e.target.value)} />
              <input required type="email" className={inputClass} placeholder="Email" value={personal.email} onChange={(e) => updatePersonal('email', e.target.value)} />
              <input className={inputClass} placeholder="Phone" value={personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} />
              <input type="date" className={inputClass} value={personal.dateOfBirth} onChange={(e) => updatePersonal('dateOfBirth', e.target.value)} />
              <input className={inputClass} placeholder="Country of citizenship" value={personal.countryOfCitizenship} onChange={(e) => updatePersonal('countryOfCitizenship', e.target.value)} />
              <button disabled={!canContinueStep1} className="btn-pill-primary disabled:opacity-40 md:col-span-2">
                Continue
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={submitStep2} className="grid gap-4 md:grid-cols-2">
              {intakeError && <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-300 md:col-span-2">{intakeError}</div>}
              <select className={`${inputClass} md:col-span-2`} value={caseDetails.exceptionType} onChange={(e) => updateCase('exceptionType', e.target.value)}>
                <option value="STANDARD_RETURN">Standard filing with tax return</option>
                <option value="EXCEPTION_1A_PARTNERSHIP">Exception 1(a) partnership or U.S. LLC</option>
                <option value="TAX_TREATY">Tax treaty claim</option>
              </select>
              <select className={`${inputClass} md:col-span-2`} value={caseDetails.serviceTier} onChange={(e) => updateCase('serviceTier', e.target.value)}>
                <option value="EXPRESS_SELF_SERVICE">Express Self-Service - $149</option>
                <option value="CAA_CONCIERGE">CAA Concierge - $180</option>
                <option value="B2B_PORTAL">B2B Wholesale - $99</option>
              </select>
              <textarea className={`${inputClass} md:col-span-2`} rows={3} placeholder="U.S. mailing address" value={caseDetails.mailingAddress} onChange={(e) => updateCase('mailingAddress', e.target.value)} />
              <textarea className={`${inputClass} md:col-span-2`} rows={3} placeholder="Foreign address" value={caseDetails.foreignAddress} onChange={(e) => updateCase('foreignAddress', e.target.value)} />
              <div className="flex gap-3 md:col-span-2">
                <button type="button" onClick={() => setStep(1)} className="btn-pill-ghost">
                  Back
                </button>
                <button disabled={creatingIntake} className="btn-pill-primary flex-1 disabled:opacity-40">
                  {creatingIntake ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div>
              {applicationId && (
                <p className="mb-4 rounded-lg bg-abyss-panel px-4 py-3 text-xs text-slate-400">
                  Application reference: <span className="font-mono font-semibold text-white">{applicationReference(applicationId)}</span> — save this to track your case later.
                </p>
              )}

              {uploadedUrl ? (
                <div className="rounded-lg border border-mint-500/30 bg-mint-500/10 p-4 text-sm text-mint-200">
                  Identity document received. You can continue to review &amp; payment.
                </div>
              ) : (
                <form onSubmit={uploadDocument} className="grid gap-4 md:grid-cols-2">
                  {docError && <div className="rounded-lg border border-gold-500/30 bg-gold-500/10 p-3 text-sm text-gold-300 md:col-span-2">{docError}</div>}
                  <select className={inputClass} value={docType} onChange={(e) => setDocType(e.target.value)}>
                    <option value="PASSPORT">Passport (bio page)</option>
                    <option value="NATIONAL_ID">National ID card</option>
                    <option value="BIRTH_CERTIFICATE">Birth certificate</option>
                  </select>
                  <input className={inputClass} placeholder="Document number" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
                  <input className={inputClass} placeholder="Issuing country" value={issuingCountry} onChange={(e) => setIssuingCountry(e.target.value)} />
                  <input type="date" className={inputClass} placeholder="Expiration date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
                  <div className="md:col-span-2">
                    <label className="label-mono block text-[10.5px] font-semibold uppercase text-slate-500">Upload a clear photo or scan (JPG, PNG, or PDF, up to 4MB)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="mt-2 block w-full text-sm text-slate-400"
                    />
                  </div>
                  <button disabled={!file || uploading} className="btn-pill-primary disabled:opacity-40 md:col-span-2">
                    {uploading ? 'Uploading...' : 'Upload document'}
                  </button>
                </form>
              )}

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-pill-ghost">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!uploadedUrl) setDocSkipped(true);
                    setStep(4);
                  }}
                  className="btn-pill-primary flex-1"
                >
                  {uploadedUrl ? 'Continue to review' : 'Skip for now & continue'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <dl className="grid gap-3 rounded-lg bg-abyss-panel p-4 text-sm sm:grid-cols-2">
                <div><dt className="label-mono text-[10px] uppercase text-slate-500">Name</dt><dd className="font-medium text-white">{[personal.firstName, personal.middleName, personal.lastName].filter(Boolean).join(' ')}</dd></div>
                <div><dt className="label-mono text-[10px] uppercase text-slate-500">Email</dt><dd className="font-medium text-white">{personal.email}</dd></div>
                <div><dt className="label-mono text-[10px] uppercase text-slate-500">Service tier</dt><dd className="font-medium text-white">{tierLabel}</dd></div>
                <div><dt className="label-mono text-[10px] uppercase text-slate-500">Identity document</dt><dd className="font-medium text-white">{uploadedUrl ? 'Received' : docSkipped ? 'Pending — you can email it later' : 'Not uploaded'}</dd></div>
              </dl>

              {paymentError && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-300">{paymentError}</div>}

              {!paymentAttempted && (
                <div className="mt-4 rounded-lg border border-mint-500/20 bg-mint-500/5 p-3 text-xs text-slate-300">
                  <p>Payment is optional. You can submit your intake now and our team will contact you about next steps, or pay securely now for {tierLabel.split(' - ')[1] || tierLabel}.</p>
                  <p className="mt-2 font-semibold text-mint-300">Secure Square checkout accepts cards and shows Apple Pay or other eligible wallet options automatically on supported devices.</p>
                </div>
              )}

              {paymentAttempted && !creatingPayment && !checkoutUrl && !paymentError && (
                <div className="mt-4 rounded-lg border border-gold-500/30 bg-gold-500/10 p-3 text-sm text-gold-300">
                  Your application is saved. Online payment isn&apos;t configured for this deployment yet, so our team
                  will follow up directly to collect payment.
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setStep(3)} className="btn-pill-ghost">
                  Back
                </button>
                <button
                  type="button"
                  onClick={submitIntake}
                  disabled={!applicationId}
                  className="btn-pill-ghost flex-1 disabled:opacity-40"
                >
                  Submit intake without payment
                </button>
                <button
                  type="button"
                  onClick={submitPayment}
                  disabled={creatingPayment || !applicationId}
                  className="btn-pill-primary flex-1 disabled:opacity-40"
                >
                  {creatingPayment ? 'Preparing checkout...' : 'Pay now (optional)'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
