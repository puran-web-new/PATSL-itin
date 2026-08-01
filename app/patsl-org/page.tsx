import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PATSL Network — Nexus CAA Training Academy',
  description: 'Access the Nexus CAA Forensic Training Academy at patsl.org, PATSL Developer LLC’s sister site for document-authentication training and CAA compliance resources.',
};

export default function PatslOrgPage() {
  return (
    <section className="container-page py-10 md:py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">PATSL Network</p>
          <h1 className="mt-1 text-xl font-bold text-ink-900">Nexus CAA Forensic Training Academy</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Document-authentication training, IRS Form W-7 diligence, and CAA readiness resources — hosted at{' '}
            <span className="font-mono text-ink-900">patsl.org</span>, a sister site under the same PATSL practice.
          </p>
        </div>
        <a
          href="https://www.patsl.org"
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-3 text-sm font-bold text-ink-950 hover:from-teal-400 hover:to-teal-500"
        >
          Open patsl.org in a new tab &rarr;
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-card">
        <div className="border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">
          Some sites block being displayed inside another page for security reasons — if the preview below stays
          blank, use the &ldquo;Open in a new tab&rdquo; button above instead.
        </div>
        <iframe
          src="https://www.patsl.org"
          title="Nexus CAA Training Academy (patsl.org)"
          className="h-[70vh] w-full"
          loading="lazy"
        />
      </div>
    </section>
  );
}
