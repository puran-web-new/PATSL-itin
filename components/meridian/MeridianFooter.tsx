import Link from 'next/link';
import Image from 'next/image';

export default function MeridianFooter({ full = false }: { full?: boolean }) {
  if (!full) {
    return (
      <footer className="border-t border-white/[0.08] px-6 py-10 text-center sm:px-10">
        <p className="mrd-muted text-[13px]">
          PATSL is not affiliated with, or endorsed by, the Internal Revenue Service. &copy; {new Date().getFullYear()} PATSL
          Developer LLC. All rights reserved.
        </p>
      </footer>
    );
  }

  return (
    <footer className="flex flex-wrap gap-8 border-t border-white/[0.08] px-6 pb-8 pt-14 sm:px-10">
      <div className="flex items-center gap-2">
        <Image src="/meridian/patsl-crest.png" alt="PATSL crest" width={34} height={34} className="mrd-gold-filter object-contain" />
        <Image src="/meridian/patsl-wordmark.png" alt="PATSL — ITIN Nexus Suite" width={150} height={28} className="mrd-gold-filter h-7 w-auto object-contain" />
      </div>

      <div className="flex flex-1 flex-wrap gap-16">
        <div>
          <h4 className="mrd-muted mb-4 text-[.82rem] uppercase tracking-[.08em]">Platform</h4>
          <div className="flex flex-col gap-2 text-[.9rem]">
            <Link href="/" className="text-[#eaf6f6]/80 hover:text-[#1de9c2] hover:opacity-100">Home</Link>
            <Link href="/marketing" className="text-[#eaf6f6]/80 hover:text-[#1de9c2] hover:opacity-100">Services &amp; Pricing</Link>
            <Link href="/appointment" className="text-[#eaf6f6]/80 hover:text-[#1de9c2] hover:opacity-100">Book Appointment</Link>
            <Link href="/about" className="text-[#eaf6f6]/80 hover:text-[#1de9c2] hover:opacity-100">About</Link>
            <Link href="/faq" className="text-[#eaf6f6]/80 hover:text-[#1de9c2] hover:opacity-100">FAQ</Link>
            <Link href="/itin-intake" className="text-[#eaf6f6]/80 hover:text-[#1de9c2] hover:opacity-100">Start Application</Link>
            <Link href="/status" className="text-[#eaf6f6]/80 hover:text-[#1de9c2] hover:opacity-100">Track My Case</Link>
          </div>
        </div>

        <div>
          <h4 className="mrd-muted mb-4 text-[.82rem] uppercase tracking-[.08em]">Contact</h4>
          <span className="block text-[.9rem] text-[#eaf6f6]/80">Queens, NY</span>
        </div>

        <div>
          <h4 className="mrd-muted mb-4 text-[.82rem] uppercase tracking-[.08em]">Network</h4>
          <div className="flex flex-wrap items-center gap-3.5">
            <Link href="/about" aria-label="PATSL Developer LLC" className="transition-transform hover:-translate-y-1">
              <Image src="/meridian/patsl-developer-logo.png" alt="PATSL Developer LLC" width={140} height={44} className="h-11 w-auto rounded-lg object-contain" />
            </Link>
            <a href="https://www.patsl.org" target="_blank" rel="noopener noreferrer" aria-label="Nexus CAA Training Academy" className="transition-transform hover:-translate-y-1">
              <Image src="/meridian/nexus-seal.png" alt="Nexus CAA Training Academy" width={44} height={44} className="h-11 w-11 object-contain" />
            </a>
            <a href="https://www.puranaccounting.com" target="_blank" rel="noopener noreferrer" aria-label="Puran Accounting &amp; Tax Solution Lab" className="transition-transform hover:-translate-y-1">
              <Image src="/meridian/puran-icon.png" alt="Puran Accounting &amp; Tax Solution Lab" width={44} height={44} className="h-11 w-11 rounded-lg object-contain" />
            </a>
          </div>
        </div>
      </div>

      <p className="mrd-muted w-full pt-6 text-center text-[.8rem]">
        PATSL is not affiliated with, or endorsed by, the Internal Revenue Service. All submissions are reviewed by a Certified
        Acceptance Agent prior to filing. &copy; {new Date().getFullYear()} PATSL Developer LLC. All rights reserved.
      </p>
    </footer>
  );
}
