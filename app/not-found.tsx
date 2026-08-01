import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">404</p>
      <h1 className="mt-3 text-3xl font-bold text-ink-900">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        The page you&apos;re looking for may have moved. Head back home or jump straight into your application.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-lg bg-ink-900 px-5 py-3 text-sm font-semibold text-white hover:bg-ink-800">
          Back to home
        </Link>
        <Link href="/itin-intake" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-ink-50">
          Start an application
        </Link>
      </div>
    </section>
  );
}
