'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StartApplicationButton({ token }: { token: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceTier, setServiceTier] = useState('CAA_CONCIERGE');
  const [creating, setCreating] = useState<'SELF' | 'LINK' | null>(null);
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const valid = firstName.trim() && lastName.trim() && email.trim();

  async function createDraft(): Promise<string> {
    const res = await fetch('/api/admin/applications/create-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ firstName, lastName, email, phone, serviceTier }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create application.');
    return data.applicationId;
  }

  async function handleFillMyself() {
    setCreating('SELF');
    setError('');
    try {
      const applicationId = await createDraft();
      router.push(`/admin/applications/${applicationId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create application.');
      setCreating(null);
    }
  }

  async function handleGenerateLink() {
    setCreating('LINK');
    setError('');
    try {
      const applicationId = await createDraft();
      setGeneratedLink(`${window.location.origin}/itin-intake?applicationId=${applicationId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create application.');
    } finally {
      setCreating(null);
    }
  }

  function reset() {
    setOpen(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setServiceTier('CAA_CONCIERGE');
    setGeneratedLink('');
    setError('');
    setCopied(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-gradient-to-r from-mint-500 to-teal-400 px-4 py-2.5 text-xs font-bold text-ink-950 hover:from-mint-400 hover:to-teal-300"
      >
        + Start new application
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-abyss-panel p-6 shadow-xl">
            {!generatedLink ? (
              <>
                <h2 className="text-sm font-bold text-white">Start a new application</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the client's basic contact info, then choose how to continue: fill the full case yourself
                  (walk-in), or generate a secure link for the client to complete their own intake remotely.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <input className="col-span-1 rounded-lg border border-white/10 bg-abyss-panel p-2.5 text-xs text-white placeholder:text-slate-500" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  <input className="col-span-1 rounded-lg border border-white/10 bg-abyss-panel p-2.5 text-xs text-white placeholder:text-slate-500" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  <input className="col-span-2 rounded-lg border border-white/10 bg-abyss-panel p-2.5 text-xs text-white placeholder:text-slate-500" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input className="col-span-2 rounded-lg border border-white/10 bg-abyss-panel p-2.5 text-xs text-white placeholder:text-slate-500" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <select className="col-span-2 rounded-lg border border-white/10 bg-abyss-panel p-2.5 text-xs text-white" value={serviceTier} onChange={(e) => setServiceTier(e.target.value)}>
                    <option value="EXPRESS_SELF_SERVICE">Express Self-Service — $149</option>
                    <option value="CAA_CONCIERGE">CAA Concierge — $180</option>
                    <option value="B2B_PORTAL">B2B Wholesale — $99</option>
                    <option value="SUPERIOR_STAFFING">Superior Staffing Employees Only — $150</option>
                  </select>
                </div>
                {error && <p className="mt-3 text-xs font-medium text-red-400">{error}</p>}
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <button
                    disabled={!valid || !!creating}
                    onClick={handleFillMyself}
                    className="btn-pill-ghost text-white disabled:opacity-40"
                  >
                    {creating === 'SELF' ? 'Creating...' : 'Fill it myself'}
                  </button>
                  <button
                    disabled={!valid || !!creating}
                    onClick={handleGenerateLink}
                    className="rounded-lg bg-gradient-to-r from-mint-500 to-teal-400 px-4 py-2.5 text-xs font-bold text-ink-950 hover:from-mint-400 hover:to-teal-300 disabled:opacity-40"
                  >
                    {creating === 'LINK' ? 'Creating...' : 'Generate client link'}
                  </button>
                </div>
                <button type="button" onClick={reset} className="mt-3 w-full text-center text-[11px] text-slate-400 hover:text-slate-400">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h2 className="text-sm font-bold text-white">Client intake link ready</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Send this link to {firstName} — it opens the intake wizard pre-filled with their name and email,
                  ready to complete the rest themselves.
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-abyss-panel p-2.5">
                  <input readOnly value={generatedLink} className="flex-1 truncate bg-transparent text-xs text-white" onFocus={(e) => e.target.select()} />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink);
                      setCopied(true);
                    }}
                    className="rounded-md bg-mint-500 px-3 py-1.5 text-[11px] font-bold text-ink-950"
                  >
                    {copied ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
                <button type="button" onClick={reset} className="mt-5 w-full rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/5">
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
