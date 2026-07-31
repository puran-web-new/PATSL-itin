import Link from 'next/link';

const steps = [
  {
    title: '1. Apply online',
    body: 'Complete a guided intake covering your identity, filing reason, and mailing details in about ten minutes.',
  },
  {
    title: '2. Upload documents',
    body: 'Securely upload your passport or national ID for Certified Acceptance Agent review — no notary required.',
  },
  {
    title: '3. Pay & submit',
    body: 'Choose a service tier, pay securely through Square, and your case moves straight into CAA review.',
  },
  {
    title: '4. Receive your IRS package',
    body: 'We compile your Form W-7, Certificate of Accuracy, and return in the correct IRS mailing order.',
  },
];

const trustPoints = [
  'Certified Acceptance Agent (CAA) identity verification — no original documents mailed to the IRS.',
  'Bank-grade data handling with automatic 90-day retention scrubbing on identity records.',
  'Transparent, flat-fee pricing with no hidden filing charges.',
  'Case status visible any time from the Track My Case page.',
];

export default function HomePage() {
  return (
    <>
      <section className="bg-ink-950 text-white">
        <div className="container-page flex flex-col gap-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-brand-300">PATSL Developer LLC</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Where Accuracy Meets Integrity</h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              A secure ITIN intake, payment, identity review, and IRS package automation platform for professional
              document preparation workflows.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link className="rounded-lg bg-brand-500 px-5 py-3 font-semibold text-white hover:bg-brand-400" href="/itin-intake">
              Start Client Intake
            </Link>
            <Link className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:bg-slate-900" href="/marketing">
              View Service Tiers
            </Link>
            <Link className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:bg-slate-900" href="/status">
              Track My Case
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">How it works</p>
        <h2 className="mt-2 text-3xl font-bold text-ink-900">From application to IRS package in four steps</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <h3 className="text-base font-bold text-ink-900">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-50">
        <div className="container-page grid gap-10 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Why clients choose PATSL</p>
            <h2 className="mt-2 text-3xl font-bold text-ink-900">Built for compliance, designed for speed</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Every case follows the IRS-required review order: Form W-7, Certificate of Accuracy, then the
              associated tax return — verified by our team before anything is mailed.
            </p>
          </div>
          <ul className="space-y-4">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-card">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  ✓
                </span>
                <span className="text-sm leading-6 text-slate-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-16 text-center md:py-20">
        <h2 className="text-3xl font-bold text-ink-900">Ready to get your ITIN moving?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Start your secure intake now — it takes about ten minutes and you can save your case reference to
          finish later.
        </p>
        <Link
          href="/itin-intake"
          className="mt-8 inline-block rounded-lg bg-brand-600 px-6 py-3.5 font-semibold text-white shadow-card hover:bg-brand-700"
        >
          Start Client Intake
        </Link>
      </section>
    </>
  );
}
