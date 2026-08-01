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

const stats = [
  { value: '4', label: 'Core case stages' },
  { value: '7-11', label: 'Week IRS turnaround' },
  { value: '90-day', label: 'PII retention window' },
  { value: '100%', label: 'CAA-reviewed cases' },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-abyss text-white">
        <div className="bg-dot-grid absolute inset-0 opacity-60" />
        <div className="glow-blob absolute -left-24 top-10 h-72 w-72 rounded-full bg-mint-500/25" />
        <div className="glow-blob absolute -right-16 top-40 h-80 w-80 rounded-full bg-teal-400/20" />
        <div className="container-page relative grid gap-10 py-20 md:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-mint-500/30 bg-mint-500/10 px-3 py-1.5 label-mono text-[11px] font-bold uppercase text-mint-300">
              <span className="status-dot" /> CAA-reviewed &middot; IRS-order packaging
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">Where accuracy meets integrity</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 md:text-lg">
              A secure ITIN intake, payment, identity review, and IRS package automation platform — from a
              credentialed Certified Acceptance Agent practice.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="btn-pill-primary" href="/itin-intake">
                Start Client Intake &rarr;
              </Link>
              <Link className="btn-pill-ghost" href="/marketing">
                View Service Tiers
              </Link>
              <Link className="btn-pill-ghost" href="/status">
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

            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4 sm:divide-x sm:divide-white/10">
              {stats.map((s) => (
                <div key={s.label} className="sm:pl-6 first:sm:pl-0">
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="label-mono mt-1 text-[9.5px] uppercase text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card animate-float-glow p-6 shadow-glow-cyan lg:rotate-1">
            <p className="label-mono mb-4 text-[10px] font-bold uppercase text-mint-400">Live case preview</p>
            <div className="mb-4 flex items-center gap-3.5">
              <div
                className="flex h-16 w-16 flex-none items-center justify-center rounded-full"
                style={{ background: 'conic-gradient(#10b981 68%, rgba(255,255,255,0.08) 0)' }}
              >
                <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-abyss text-sm font-extrabold text-white">
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
                    <span className="font-bold text-mint-400">&#10003; Done</span>
                  ) : (
                    <span className={s.status === 'In progress' ? 'font-semibold text-gold-400' : 'text-slate-500'}>{s.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-abyss py-16 md:py-20">
        <div className="container-page">
          <p className="label-mono text-[12px] font-bold uppercase text-mint-400">How it works</p>
          <h2 className="mt-2 text-3xl font-bold text-white">From application to IRS package in four steps</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="glass-card p-6 transition-transform hover:-translate-y-1 hover:shadow-glow-mint">
                <span className="label-mono mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-mint-500/10 text-xs font-extrabold text-mint-400">
                  {index + 1}
                </span>
                <h3 className="text-base font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-abyss-raised py-16 md:py-20">
        <div className="bg-dot-grid absolute inset-0 opacity-40" />
        <div className="container-page relative">
          <p className="label-mono text-[12px] font-bold uppercase text-mint-400">Credentials on file</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Verified professional standing</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {credentials.map((c) => (
              <div key={c.label} className="glass-card p-4 text-center">
                <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/15 text-[11px] font-extrabold text-gold-400">
                  {c.icon}
                </span>
                <p className="text-[11px] font-bold leading-tight text-white">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-abyss py-16 md:py-20">
        <div className="container-page grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="label-mono text-[12px] font-bold uppercase text-mint-400">Why clients choose PATSL</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Built for compliance, designed for speed</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Every case follows the IRS-required review order: Form W-7, Certificate of Accuracy, then the
              associated tax return — verified by our team before anything is mailed.
            </p>
          </div>
          <ul className="space-y-4">
            {trustPoints.map((point) => (
              <li key={point} className="glass-card flex items-start gap-3 p-4">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-mint-500 text-xs font-bold text-ink-950">
                  ✓
                </span>
                <span className="text-sm leading-6 text-slate-300">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden bg-abyss-raised py-16 md:py-20">
        <div className="glow-blob absolute right-0 top-0 h-72 w-72 rounded-full bg-teal-400/15" />
        <div className="container-page relative grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-center">
          <div className="flex h-44 items-center justify-center rounded-2xl border border-gold-500/20 bg-gradient-to-br from-abyss to-ink-800 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Founder photo
          </div>
          <div>
            <p className="label-mono mb-1 text-[12px] font-bold uppercase text-mint-400">Founder authority</p>
            <h3 className="text-xl font-bold text-white">Expertise rooted in real practice</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Led by Puran Ramratan, a credentialed tax professional and accountant with hands-on experience
              across IRS compliance, payroll, and document authentication — based in Queens, NY.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-abyss py-16 text-center md:py-20">
        <div className="bg-dot-grid absolute inset-0 opacity-40" />
        <div className="container-page relative">
          <h2 className="text-3xl font-bold text-white">Ready to get your ITIN moving?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Start your secure intake now — it takes about ten minutes and you can save your case reference to
            finish later.
          </p>
          <Link href="/itin-intake" className="btn-pill-primary mt-8 inline-flex">
            Start Client Intake
          </Link>
        </div>
      </section>
    </>
  );
}
