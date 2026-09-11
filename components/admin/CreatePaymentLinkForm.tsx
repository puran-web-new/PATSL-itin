'use client';

import { FormEvent, useState } from 'react';

export default function CreatePaymentLinkForm({ applicationId, reference, token, onCreated }: { applicationId: string; reference: string; token: string; onCreated: () => Promise<void> }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('PATSL ITIN service fee');
  const [showDetails, setShowDetails] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/payments/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ applicationId, amount, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to create payment link.');
      setMessage(data.emailSent ? 'Payment link created and emailed to the client.' : 'Payment link created, but the client email was not sent.');
      setAmount('');
      await onCreated();
    } catch (err: any) {
      setMessage(err.message || 'Unable to create payment link.');
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-2 border-t border-white/10 pt-3">
      <p className="text-[10.5px] font-semibold text-slate-400">Custom payment for {reference}</p>
      <label className="block">
        <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Amount (USD)</span>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" max="10000" step="0.01" inputMode="decimal" type="number" placeholder="0.00" aria-label="Custom payment amount in USD" className="w-full rounded-lg border border-white/10 bg-abyss-panel p-2.5 text-base text-white" />
      </label>
      <button type="button" onClick={() => setShowDetails((value) => !value)} className="text-left text-[10.5px] font-semibold text-mint-300 hover:underline">
        {showDetails ? 'Hide payment description' : 'Add payment description'}
      </button>
      {showDetails && <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={120} placeholder="Payment description" aria-label="Payment description" className="w-full rounded-lg border border-white/10 bg-abyss-panel p-2.5 text-base text-white" />}
      <button disabled={sending || !amount} className="btn-pill-primary w-full text-xs disabled:opacity-40">{sending ? 'Sending…' : 'Create & email payment link'}</button>
      <p className="text-[10px] text-slate-500">Enter any custom amount from $1.00 to $10,000.00.</p>
      {message && <p className="text-[10.5px] text-slate-400">{message}</p>}
    </form>
  );
}
