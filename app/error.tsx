'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center bg-abyss py-20 text-center">
      <p className="label-mono text-[12px] font-semibold uppercase text-red-400">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-bold text-white">We hit an unexpected error</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
        Your data was not lost. Try again, or return to the homepage. If this keeps happening, contact PATSL support.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={() => reset()} className="btn-pill-primary">
          Try again
        </button>
        <Link href="/" className="btn-pill-ghost">
          Back to home
        </Link>
      </div>
    </section>
  );
}
