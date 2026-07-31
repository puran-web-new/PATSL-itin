'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-bold text-ink-900">We hit an unexpected error</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        Your data was not lost. Try again, or return to the homepage. If this keeps happening, contact PATSL support.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={() => reset()} className="rounded-lg bg-ink-900 px-5 py-3 text-sm font-semibold text-white hover:bg-ink-800">
          Try again
        </button>
        <Link href="/" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-ink-50">
          Back to home
        </Link>
      </div>
    </section>
  );
}
