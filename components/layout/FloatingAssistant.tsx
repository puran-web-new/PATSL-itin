'use client';

import { useState } from 'react';

// Fixed bottom-right assistant pill, styled per the cyber-forensic design
// system: mint/cyan gradient pill with a glowing border, expanding into a
// small glass-card contact panel. It intentionally does not claim to be an
// AI chat — it surfaces the fastest real ways to reach PATSL. Firm contact
// details are passed in as props from the (server) root layout, since env
// vars aren't available inside a client component.
export default function FloatingAssistant({ phone, email }: { phone?: string; email?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="glass-card w-72 p-5 text-sm text-slate-300 shadow-glow-cyan">
          <p className="label-mono text-[10px] font-bold uppercase text-mint-400">PATSL Assistant</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Need a hand with your ITIN case? Reach the team directly:
          </p>
          <div className="mt-4 space-y-2">
            {phone && (
              <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white hover:border-mint-500/40">
                📞 {phone}
              </a>
            )}
            <a href={`mailto:${email || 'info@puranaccounting.com'}`} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white hover:border-mint-500/40">
              ✉️ {email || 'info@puranaccounting.com'}
            </a>
            <a href="/status" className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white hover:border-mint-500/40">
              📄 Track my case
            </a>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open PATSL assistant"
        className="btn-pill-primary bg-gradient-to-r from-mint-500 to-teal-400 px-5 py-3 text-xs"
      >
        <span className="status-dot bg-ink-950" />
        {open ? 'Close' : 'PATSL Assistant'}
      </button>
    </div>
  );
}
