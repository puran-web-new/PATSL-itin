'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
  expired: 'That sign-in link has expired. Request a new one below.',
  'not-found': "We couldn't find an account for that link. Request a new one below.",
};

export default function PortalSignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center bg-abyss text-sm text-slate-400">Loading sign-in...</div>}>
      <PortalSignInInner />
    </Suspense>
  );
}

function PortalSignInInner() {
  const searchParams = useSearchParams();
  const linkError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/portal/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Something went wrong. Try again.');
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-abyss px-6 py-16">
      <div className="bg-dot-grid absolute inset-0 opacity-40" />
      <div className="glow-blob absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-mint-500/15" />
      <div className="glass-card relative w-full max-w-sm p-8 text-center shadow-glow-mint">
        <p className="label-mono text-[11px] font-semibold uppercase text-mint-400">Client portal</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Sign in to your case</h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter the email on your application and we'll send you a secure sign-in link — no password needed.
        </p>

        {linkError && !sent && (
          <div className="mt-4 rounded-lg border border-gold-500/30 bg-gold-500/10 p-3 text-left text-xs text-gold-300">
            {ERROR_MESSAGES[linkError] || 'That link is no longer valid. Request a new one below.'}
          </div>
        )}

        {sent ? (
          <div className="mt-6 rounded-lg border border-mint-500/30 bg-mint-500/10 p-4 text-sm text-mint-200">
            Check your email — if that address has an application on file, a sign-in link is on its way. It expires
            in 15 minutes.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              autoFocus
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-abyss-panel p-3 text-sm text-white placeholder:text-slate-600"
            />
            {error && <p className="text-left text-xs text-red-400">{error}</p>}
            <button disabled={loading || !email} className="btn-pill-primary w-full disabled:opacity-50">
              {loading ? 'Sending...' : 'Send me a sign-in link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-xs text-slate-500">
          Don't have an application yet? <a href="/itin-intake" className="font-semibold text-mint-300 hover:underline">Start one here</a>.
        </p>
      </div>
    </section>
  );
}
