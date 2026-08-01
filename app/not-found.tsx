import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center bg-abyss py-20 text-center">
      <p className="label-mono text-[12px] font-semibold uppercase text-mint-400">404</p>
      <h1 className="mt-3 text-3xl font-bold text-white">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
        The page you&apos;re looking for may have moved. Head back home or jump straight into your application.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-pill-primary">
          Back to home
        </Link>
        <Link href="/itin-intake" className="btn-pill-ghost">
          Start an application
        </Link>
      </div>
    </section>
  );
}
