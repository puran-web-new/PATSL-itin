import Link from 'next/link';

const steps = [
  {
    title: 'Apply online',
    body: 'Complete a guided intake covering your identity, filing reason, and mailing details in about ten minutes.',
  },
  {
    title: 'Upload documents',
    body: 'Securely upload your passport or national ID for Certified Acceptance Agent review — no notary required.',
  },
  {
    title: 'Pay & submit',
    body: 'Choose a service tier, pay securely through Square, and your case moves straight into CAA review.',
  },
  {
    title: 'Receive your IRS package',
    body: 'We compile your Form W-7, Certificate of Accuracy, and return in the correct IRS mailing order.',
  },
];

const trustPoints = [
  'Certified Acceptance Agent (CAA) identity verification — no original documents mailed to the IRS.',
  'Bank-grade data handling with automatic 90-day retention scrubbing on identity records.',
  'Transparent, flat-fee pricing with no hidden filing charges.',
  'Case status visible any time from the Track My Case page.',
];

const credentials = [
  { icon: 'IRS', label: 'Certified Acceptance Agent' },
  { icon: 'ERO', label: 'Electronic Return Originator' },
  { icon: 'IRS', label: 'Authorized Tax Preparer' },
  { icon: 'NY', label: 'Registered NY Tax Preparer' },
  { icon: 'ADP', label: 'Accountant Connect Partner' },
];

const caseSteps = [
  { label: 'Application received', done: true },
  { label: 'Identity documents', done: true },
  { label: 'Payment', done: true },
  { label: 'CAA review', done: false, status: 'In progress' },
  { label: 'IRS package mailed', done: false, status: 'Pending' },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_15%_20%,#0c3040_0%,theme(colors.ink.950)_55%)] text-white">
        <div className="container-page grid gap-10 py-20 md:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-teal-200">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> CAA-reviewed &middot; IRS-order packaging
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">Where accuracy meets integrity</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              A secure ITIN intake, payment, identity review, and IRS package automation platform — from a
              credentialed Certified Acceptance Agent practice.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-3 font-bold text-ink-950 shadow-[0_6px_16px_rgba(20,184,166,0.3)] hover:from-teal-400 hover:to-teal-500"
                href="/itin-intake"
              >
                Start Client Intake &rarr;
              </Link>
              <Link className="rounded-lg border border-white/15 px-5 py-3 font-semibold text-slate-200 hover:bg-white/5" href="/marketing">
                View Service Tiers
              </Link>
              <Link className="rounded-lg border border-white/15 px-5 py-3 font-semibold text-slate-200 hover:bg-white/5" href="/status">
                Track My Case
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-gold-500/35 bg-gold-500/10 px-3 py-1.5 text-[10.5px] font-bold text-gold-400">
                IRS Certified Acceptance Agent
              </span>
              <span className="rounded-full border border-gold-500/35 bg-gold-500/10 px-3 py-1.5 text-[10.5px] font-bold text-gold-400">
                Electronic Return Originator
              </span>
              <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-[10.5px] font-bold text-teal-300">
                NY State Registered Preparer
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d2836] to-[#0a2130] p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] lg:rotate-1">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-200">Live case preview</p>
            <div className="mb-4 flex items-center gap-3.5">
              <div
                className="flex h-16 w-16 flex-none items-center justify-center rounded-full"
                style={{ background: 'conic-gradient(#14b8a6 68%, rgba(255,255,255,0.08) 0)' }}
              >
                <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#0a2431] text-sm font-extrabold text-white">
                  68%
                </div>
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-100">Maria Gonzalez — ITIN Case</p>
                <p className="text-[10.5px] text-slate-500">CAA Concierge &middot; Updated 2h ago</p>
              </div>
            </div>
            <div className="divide-y divide-white/10 border-t border-white/10">
              {caseSteps.map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2 text-[11px] text-slate-300">
                  <span>{s.label}</span>
                  {s.done ? (
                    <span className="font-bold text-teal-300">&#10003; Done</span>
                  ) : (
                    <span className={s.status === 'In progress' ? 'font-semibold text-gold-400' : 'text-slate-500'}>{s.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-600">How it works</p>
        <h2 className="mt-2 text-3xl font-bold text-ink-900">From application to IRS package in four steps</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-transform hover:-translate-y-1">
              <span className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-xs font-extrabold text-teal-700">
                {index + 1}
              </span>
              <h3 className="text-base font-bold text-ink-900">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-50">
        <div className="container-page py-16 md:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-600">Credentials on file</p>
          <h2 className="mt-2 text-3xl font-bold text-ink-900">Verified professional standing</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {credentials.map((c) => (
              <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-card">
                <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/15 text-[11px] font-extrabold text-gold-600">
                  {c.icon}
                </span>
                <p className="text-[11px] font-bold leading-tight text-ink-900">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-600">Why clients choose PATSL</p>
            <h2 className="mt-2 text-3xl font-bold text-ink-900">Built for compliance, designed for speed</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Every case follows the IRS-required review order: Form W-7, Certificate of Accuracy, then the
              associated tax return — verified by our team before anything is mailed.
            </p>
          </div>
          <ul className="space-y-4">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-card">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-ink-950">
                  ✓
                </span>
                <span className="text-sm leading-6 text-slate-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ink-50">
        <div className="container-page grid gap-8 py-16 md:grid-cols-[1fr_1.4fr] md:items-center md:py-20">
          <div className="flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-800 to-ink-900 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Founder photo
          </div>
          <div>
            <p className="mb-1 text-sm font-bold uppercase tracking-[0.2em] text-teal-600">Founder authority</p>
            <h3 className="text-xl font-bold text-ink-900">Expertise rooted in real practice</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Led by Puran Ramratan, a credentialed tax professional and accountant with hands-on experience
              across IRS compliance, payroll, and document authentication — based in Queens, NY.
            </p>
          </div>
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
          className="mt-8 inline-block rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3.5 font-bold text-ink-950 shadow-card hover:from-teal-400 hover:to-teal-500"
        >
          Start Client Intake
        </Link>
      </section>
    </>
  );
}
