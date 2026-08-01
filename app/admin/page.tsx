'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSignInPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = window.sessionStorage.getItem('patsl-admin-token');
    if (saved) router.replace('/admin/dashboard');
  }, [router]);

  async function signIn() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/applications', { headers: { 'x-admin-token': token } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid token.');
      window.sessionStorage.setItem('patsl-admin-token', token);
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-ink-950 px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Staff access</p>
        <h1 className="mt-2 text-2xl font-bold text-white">PATSL Admin Console</h1>
        <p className="mt-2 text-sm text-slate-400">Enter your admin access token to open the control center.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            signIn();
          }}
          className="mt-6 space-y-3"
        >
          <input
            autoFocus
            type="password"
            placeholder="Admin access token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-abyss-panel p-3 text-sm text-white"
          />
          {error && <p className="text-left text-xs text-red-400">{error}</p>}
          <button disabled={loading || !token} className="btn-pill-primary w-full disabled:opacity-40">
            {loading ? 'Verifying...' : 'Sign in'}
          </button>
        </form>
      </div>
    </section>
  );
}
