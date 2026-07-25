import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">PATSL Developer LLC</p>
          <h1 className="text-5xl font-bold tracking-tight">Where Accuracy Meets Integrity</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            A secure ITIN intake, payment, review, and IRS package automation platform for professional document preparation workflows.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link className="rounded-lg bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400" href="/itin-intake">
            Start Client Intake
          </Link>
          <Link className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:bg-slate-900" href="/admin">
            Open Admin Console
          </Link>
          <Link className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:bg-slate-900" href="/marketing">
            View Service Tiers
          </Link>
        </div>
      </section>
    </main>
  );
}
