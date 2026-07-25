'use client';

import { FormEvent, useState } from 'react';

type IntakeState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  countryOfCitizenship: string;
  mailingAddress: string;
  foreignAddress: string;
  exceptionType: string;
  serviceTier: string;
};

const initialState: IntakeState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  countryOfCitizenship: '',
  mailingAddress: '',
  foreignAddress: '',
  exceptionType: 'STANDARD_RETURN',
  serviceTier: 'CAA_CONCIERGE',
};

export default function ITINIntakePage() {
  const [form, setForm] = useState(initialState);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: keyof IntakeState, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCheckoutUrl(null);

    try {
      const intakeRes = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const intake = await intakeRes.json();
      if (!intakeRes.ok) throw new Error(intake.error || 'Intake creation failed.');
      setApplicationId(intake.applicationId);

      const paymentRes = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: intake.applicationId, serviceTier: form.serviceTier }),
      });
      const payment = await paymentRes.json();
      if (!paymentRes.ok) throw new Error(payment.error || 'Payment link creation failed.');
      setCheckoutUrl(payment.checkoutUrl);
    } catch (err: any) {
      setError(err.message || 'Unable to submit intake.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Secure Intake</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">PATSL ITIN Application Portal</h1>
        <p className="mt-2 text-sm text-slate-600">Create the application record, assign a service tier, and prepare the case for payment and admin review.</p>

        {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}
        {applicationId && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Application created: <span className="font-mono">{applicationId}</span>
            {checkoutUrl ? (
              <a className="ml-3 font-semibold underline" href={checkoutUrl}>Continue to Square checkout</a>
            ) : (
              <p className="mt-2">Payment link is pending because Square environment variables are not configured yet.</p>
            )}
          </div>
        )}

        <form onSubmit={submit} className="mt-8 grid gap-4 md:grid-cols-2">
          <input required className="rounded-lg border border-slate-300 p-3" placeholder="First name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
          <input required className="rounded-lg border border-slate-300 p-3" placeholder="Last name" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
          <input required type="email" className="rounded-lg border border-slate-300 p-3" placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} />
          <input className="rounded-lg border border-slate-300 p-3" placeholder="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          <input type="date" className="rounded-lg border border-slate-300 p-3" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
          <input className="rounded-lg border border-slate-300 p-3" placeholder="Country of citizenship" value={form.countryOfCitizenship} onChange={(e) => update('countryOfCitizenship', e.target.value)} />
          <select className="rounded-lg border border-slate-300 p-3" value={form.exceptionType} onChange={(e) => update('exceptionType', e.target.value)}>
            <option value="STANDARD_RETURN">Standard filing with tax return</option>
            <option value="EXCEPTION_1A_PARTNERSHIP">Exception 1(a) partnership or U.S. LLC</option>
            <option value="TAX_TREATY">Tax treaty claim</option>
          </select>
          <select className="rounded-lg border border-slate-300 p-3" value={form.serviceTier} onChange={(e) => update('serviceTier', e.target.value)}>
            <option value="EXPRESS_SELF_SERVICE">Express Self-Service - $149</option>
            <option value="CAA_CONCIERGE">CAA Concierge - $349</option>
            <option value="B2B_PORTAL">B2B Wholesale - $99</option>
          </select>
          <textarea className="rounded-lg border border-slate-300 p-3 md:col-span-2" rows={3} placeholder="U.S. mailing address" value={form.mailingAddress} onChange={(e) => update('mailingAddress', e.target.value)} />
          <textarea className="rounded-lg border border-slate-300 p-3 md:col-span-2" rows={3} placeholder="Foreign address" value={form.foreignAddress} onChange={(e) => update('foreignAddress', e.target.value)} />
          <button disabled={loading} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400 md:col-span-2">
            {loading ? 'Creating intake...' : 'Create intake and payment link'}
          </button>
        </form>
      </div>
    </main>
  );
}
