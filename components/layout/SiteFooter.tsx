import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t border-ink-800/10 bg-ink-950 text-slate-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-ink-900">P</span>
            <span className="text-sm font-bold tracking-wide text-white">PATSL Developer LLC</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
            Secure ITIN intake, identity verification, payment, and IRS package preparation for individuals,
            partners, and referring firms. Prepared under IRS Certified Acceptance Agent procedures.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Platform</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/marketing" className="hover:text-white">Services &amp; Pricing</Link></li>
            <li><Link href="/itin-intake" className="hover:text-white">Start Application</Link></li>
            <li><Link href="/status" className="hover:text-white">Track My Case</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Staff</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/admin" className="hover:text-white">Admin Console</Link></li>
          </ul>
          <p className="mt-6 text-xs leading-5 text-slate-500">
            PATSL is not affiliated with, or endorsed by, the Internal Revenue Service. All submissions are
            reviewed by a Certified Acceptance Agent prior to filing.
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 py-6">
        <p className="container-page text-xs text-slate-500">
          &copy; {new Date().getFullYear()} PATSL Developer LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
