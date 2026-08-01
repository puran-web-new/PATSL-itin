import Link from 'next/link';
import { getFirmProfile } from '../../lib/firmProfile';
import GoldCrest from './GoldCrest';

export default function SiteFooter() {
  const firm = getFirmProfile();

  return (
    <footer className="border-t border-teal-500/10 bg-abyss text-slate-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <GoldCrest className="h-9 w-9" />
            <span className="text-sm font-bold tracking-wide text-white">{firm.businessName || 'PATSL Developer LLC'}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
            Secure ITIN intake, identity verification, payment, and IRS package preparation for individuals,
            partners, and referring firms. Prepared under IRS Certified Acceptance Agent procedures.
          </p>
        </div>

        <div>
          <p className="label-mono text-[11px] font-bold uppercase text-mint-400">Platform</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/marketing" className="hover:text-white">Services &amp; Pricing</Link></li>
            <li><Link href="/itin-intake" className="hover:text-white">Start Application</Link></li>
            <li><Link href="/status" className="hover:text-white">Track My Case</Link></li>
          </ul>
        </div>

        <div>
          <p className="label-mono text-[11px] font-bold uppercase text-mint-400">Staff</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/admin" className="hover:text-white">Admin Console</Link></li>
          </ul>
        </div>

        <div>
          <p className="label-mono text-[11px] font-bold uppercase text-mint-400">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            {firm.address && <li>{firm.address}</li>}
            {firm.phone && <li>{firm.phone}</li>}
            {firm.email && <li>{firm.email}</li>}
            {!firm.address && !firm.phone && !firm.email && <li className="text-slate-500">Queens, NY</li>}
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
