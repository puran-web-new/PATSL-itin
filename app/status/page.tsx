'use client';

import { FormEvent, useState } from 'react';

type StatusResult = {
  id: string;
  status: string;
  service_tier: string;
  created_at: string;
  updated_at: string;
  payment_status: string | null;
  has_documents: boolean;
};

const STEP_ORDER = ['INTAKE_STARTED', 'DOCUMENTS_RECEIVED', 'PAYMENT_PENDING', 'CAA_REVIEW', 'SUBMITTED_IRS'];

const STEP_LABELS: Record<string, string> = {
  INTAKE_STARTED: 'Application received',
  DOCUMENTS_RECEIVED: 'Identity documents received',
  PAYMENT_PENDING: 'Payment processing',
  CAA_REVIEW: 'CAA review in progress',
  SUBMITTED_IRS: 'IRS package ready / mailed',
  ARCHIVED_PII_SCRUBBED: 'Case closed & archived',
};

function friendlyStatus(status: string) {
  return STEP_LABELS[status] || status.replace(/_/g, ' ').toLowerCase();
}

export default function StatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [lastName, setLastName] = useState('');
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookup(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const params = new URLSearchParams({ applicationId: applicationId.trim(), lastName: lastName.trim() });
      const res = await fetch(`/api/applications/status?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lookup failed.');
      setResult(data.application);
    } catch (err: any) {
      setError(err.message || 'Unable to find that application.');
    } finally {
      setLoading(false);
    }
  }

  const activeIndex = result ? STEP_ORDER.indexOf(result.status) : -1;
  const archived = result?.status === 'ARCHIVED_PII_SCRUBBED';

  return (
    <section className="container-page py-14 md:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">Track My Case</p>
        <h1 className="mt-2 text-3xl font-bold text-ink-900">Check your application status</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter the application reference you received at intake along with your last name.
        </p>

        <form onSubmit={lookup} className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:grid-cols-2">
          <input
            required
            className="rounded-lg border border-slate-300 p-3 sm:col-span-2"
            placeholder="Application reference ID"
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
          />
          <input
            required
            className="rounded-lg border border-slate-300 p-3 sm:col-span-2"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <button
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-3 font-bold text-ink-950 hover:from-teal-400 hover:to-teal-500 disabled:from-slate-400 disabled:to-slate-400 disabled:text-white sm:col-span-2"
          >
            {loading ? 'Checking...' : 'Check status'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>
        )}

        {result && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reference</p>
                <p className="font-mono text-sm text-ink-900">{result.id}</p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                {friendlyStatus(result.status)}
              </span>
            </div>

            {!archived ? (
              <ol className="mt-6 space-y-4">
                {STEP_ORDER.map((step, index) => {
                  const done = activeIndex >= 0 && index <= activeIndex;
                  return (
                    <li key={step} className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-bold ${
                          done ? 'bg-teal-500 text-ink-950' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {done ? '✓' : index + 1}
                      </span>
                      <span className={`text-sm ${done ? 'font-semibold text-ink-900' : 'text-slate-500'}`}>
                        {STEP_LABELS[step]}
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-6 text-sm text-slate-600">
                This case has been archived and identity documents have been scrubbed per our 90-day retention policy.
              </p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">Payment</dt>
                <dd className="mt-1 font-medium text-ink-900">{result.payment_status || 'Pending'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">Documents</dt>
                <dd className="mt-1 font-medium text-ink-900">{result.has_documents ? 'Received' : 'Not yet uploaded'}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
