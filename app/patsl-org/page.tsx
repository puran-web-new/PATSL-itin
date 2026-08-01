import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PATSL Network — Nexus CAA Training Academy',
  description: 'Access the Nexus CAA Forensic Training Academy at patsl.org, PATSL Developer LLC’s sister site for document-authentication training and CAA compliance resources.',
};

export default function PatslOrgPage() {
  return (
    <section className="bg-abyss py-10 md:py-14">
      <div className="container-page">
        <div className="glass-card mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="label-mono text-[11px] font-semibold uppercase text-mint-400">PATSL Network</p>
            <h1 className="mt-1 text-xl font-bold text-white">Nexus CAA Forensic Training Academy</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              Document-authentication training, IRS Form W-7 diligence, and CAA readiness resources — hosted at{' '}
              <span className="font-mono text-slate-200">patsl.org</span>, a sister site under the same PATSL practice.
            </p>
          </div>
          <a href="https://www.patsl.org" target="_blank" rel="noopener noreferrer" className="btn-pill-primary whitespace-nowrap">
            Open patsl.org in a new tab &rarr;
          </a>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="border-b border-white/10 bg-abyss-panel px-4 py-2 text-xs text-slate-500">
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
      </div>
    </section>
  );
}
