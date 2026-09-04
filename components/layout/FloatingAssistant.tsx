'use client';

import { useEffect, useRef, useState } from 'react';

type Message = { from: 'bot' | 'user'; text: string };

const QUICK_QUESTIONS: { q: string; a: string }[] = [
  {
    q: 'How long does processing take?',
    a: 'Most CAA Concierge cases move to IRS-ready status within 3-5 business days of document verification and payment. The IRS itself typically takes 7-11 weeks to issue the ITIN once your package is mailed (longer Jan-Apr).',
  },
  {
    q: 'What documents do I need?',
    a: 'A valid passport is the fastest path (it alone proves identity and foreign status). Without one, you can combine two documents such as a national ID and a U.S. visa. Our CAA verifies the original in person or via secure upload — you never mail your passport to the IRS.',
  },
  {
    q: 'How much does it cost?',
    a: 'Express Self-Service is $149, CAA Concierge is $180 introductory pricing, and our B2B Wholesale Portal for partner firms is $99 per case. Full details are on the Services & Pricing page.',
  },
  {
    q: 'How do I check my case status?',
    a: 'Use the Track My Case page with your application reference ID and last name for a live status update — no login required.',
  },
  {
    q: 'Do I need to mail my passport to the IRS?',
    a: "No. As a Certified Acceptance Agent, PATSL verifies your identity documents directly, so your originals never leave your hands or get mailed anywhere.",
  },
];

export default function FloatingAssistant({ phone, email }: { phone?: string; email?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: "Hi, I'm the PATSL Assistant. Tap a question below for an instant answer, or reach the team directly." },
  ]);
  const [asked, setAsked] = useState<Set<string>>(new Set());
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  function ask(item: { q: string; a: string }) {
    setMessages((prev) => [...prev, { from: 'user', text: item.q }]);
    setAsked((prev) => new Set(prev).add(item.q));
    setTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'bot', text: item.a }]);
      setTyping(false);
    }, 550);
  }

  const remaining = QUICK_QUESTIONS.filter((item) => !asked.has(item.q));

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="glass-card flex w-80 flex-col overflow-hidden shadow-glow-cyan">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="label-mono text-[10px] font-bold uppercase text-mint-400">PATSL Assistant</p>
              <p className="flex items-center gap-1.5 text-[10.5px] text-slate-500">
                <span className="status-dot" /> Automated · instant answers
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="text-slate-500 hover:text-white">
              &#10005;
            </button>
          </div>

          <div ref={scrollRef} className="max-h-64 space-y-2.5 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-5 ${
                    m.from === 'user' ? 'bg-mint-500 text-ink-950' : 'border border-white/10 bg-abyss-panel text-slate-300'
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <p className="flex items-center gap-1 rounded-xl border border-white/10 bg-abyss-panel px-3 py-2 text-xs text-slate-500">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint-400" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint-400 [animation-delay:300ms]" />
                </p>
              </div>
            )}
          </div>

          {remaining.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-3 py-3">
              {remaining.map((item) => (
                <button
                  key={item.q}
                  onClick={() => ask(item)}
                  className="rounded-full border border-mint-500/30 bg-mint-500/5 px-2.5 py-1.5 text-[10.5px] font-medium text-mint-300 transition-colors hover:bg-mint-500/15"
                >
                  {item.q}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1.5 border-t border-white/10 px-4 py-3">
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
        className="btn-pill-primary animate-float-glow bg-gradient-to-r from-mint-500 to-teal-400 px-5 py-3 text-xs"
      >
        <span className="status-dot bg-ink-950" />
        {open ? 'Close' : 'PATSL Assistant'}
      </button>
    </div>
  );
}
