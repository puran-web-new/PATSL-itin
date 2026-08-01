'use client';

import { useState } from 'react';

export default function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-8 space-y-3">
      {faqs.map((faq, index) => {
        const open = openIndex === index;
        return (
          <div key={faq.q} className={`glass-card transition-colors ${open ? 'border-mint-500/30' : ''}`}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-3 p-5 text-left"
            >
              <h3 className="text-sm font-bold text-white">{faq.q}</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`h-4 w-4 flex-none text-mint-400 transition-transform ${open ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {open && <p className="px-5 pb-5 text-sm leading-6 text-slate-400">{faq.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
