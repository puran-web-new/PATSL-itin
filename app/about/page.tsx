import Image from 'next/image';
import type { Metadata } from 'next';
import '../meridian.css';
import MeridianNav from '../../components/meridian/MeridianNav';
import MeridianFooter from '../../components/meridian/MeridianFooter';
import RimRing from '../../components/meridian/RimRing';

export const metadata: Metadata = {
  title: 'About',
  description: 'Meet Puran Ramratan, the IRS Certified Acceptance Agent behind the PATSL ITIN platform.',
};

const CREDENTIALS = [
  { label: 'IRS Certified Acceptance Agent', color: '#1de9c2' },
  { label: 'Electronic Return Originator', color: '#39e08a' },
  { label: 'NY Registered Preparer', color: '#1de9c2' },
];

export default function MeridianAboutPage() {
  return (
    <div className="mrd-root min-h-screen">
      <MeridianNav cta={{ label: 'Book Appointment', href: '/appointment' }} />

      <section className="relative px-6 pb-24 pt-16 sm:px-10">
        <div className="mx-auto grid max-w-[1100px] items-center gap-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="relative overflow-hidden rounded-[20px]" style={{ boxShadow: '0 20px 50px rgba(0,0,0,.5)', aspectRatio: '3 / 4' }}>
            <RimRing
              gradient="conic-gradient(from 0deg, transparent 0deg, transparent 240deg, #1de9c2 285deg, #39e08a 312deg, #1de9c2 340deg, transparent 360deg)"
              duration="6s"
              padding="1.6px"
              glow="drop-shadow(0 0 6px #1de9c2)"
            />
            <Image
              src="/meridian/founder-photo.jpg"
              alt="Puran Ramratan, IRS Certified Acceptance Agent and founder of PATSL"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-cover"
              style={{ objectPosition: '50% 12%' }}
              priority
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'linear-gradient(180deg, rgba(7,18,35,0) 55%, rgba(7,18,35,.55) 100%)' }}
            />
          </div>

          <div>
            <span className="mb-3 inline-flex text-[.78rem] uppercase tracking-[.16em] mrd-accent-green">About PATSL</span>
            <h1 className="mb-4 font-extrabold" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.6rem)' }}>Expertise rooted in real practice</h1>
            <p className="mrd-muted mb-4 text-[.95rem] leading-[1.75]">
              Led by Puran Ramratan, a credentialed tax professional and accountant with hands-on experience across
              IRS compliance, payroll, and document authentication — based in Queens, NY.
            </p>
            <p className="mrd-muted text-[.95rem] leading-[1.75]">
              As an IRS Certified Acceptance Agent, Puran personally verifies every applicant&rsquo;s identity documents
              in person, so no client ever has to mail an original passport to the IRS or chase down a certified copy
              from an embassy or consulate.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {CREDENTIALS.map((c) => (
                <span key={c.label} className="mrd-pill-outline" style={{ border: `1px solid ${c.color}4d`, color: c.color }}>
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-[1100px] rounded-[18px] p-8" style={{ background: 'linear-gradient(160deg, #0c2038, #081627)', border: '1px solid rgba(29,233,194,.12)' }}>
          <span className="mb-2.5 block text-[.75rem] font-bold uppercase tracking-[.08em] mrd-accent-green">The PATSL network</span>
          <p className="mb-5 max-w-[80ch] text-[.92rem] leading-[1.7]" style={{ color: '#c7dae6' }}>
            Puran Accounting &amp; Tax Solution Lab is the accounting practice behind PATSL. PATSL Developer LLC builds
            the technology behind this platform, and the Nexus CAA Training Academy trains the next generation of
            Certified Acceptance Agents in forensic document verification.
          </p>
          <div className="flex flex-wrap items-center gap-8">
            <a href="https://www.puranaccounting.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5" style={{ color: '#eaf6f6' }}>
              <Image src="/meridian/puran-icon.png" alt="Puran Accounting &amp; Tax Solution Lab" width={34} height={34} className="rounded-md object-contain" />
              <span className="text-[.85rem] font-semibold">Puran Accounting &amp; Tax Solution Lab</span>
            </a>
            <div className="flex items-center gap-2.5">
              <Image src="/meridian/patsl-developer-logo.png" alt="PATSL Developer LLC" width={120} height={38} className="h-[34px] w-auto rounded-md object-contain" />
            </div>
            <a href="https://www.patsl.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5" style={{ color: '#eaf6f6' }}>
              <Image src="/meridian/nexus-seal.png" alt="Nexus CAA Training Academy" width={34} height={34} className="object-contain" />
              <span className="text-[.85rem] font-semibold">Nexus CAA Training Academy</span>
            </a>
          </div>
        </div>
      </section>

      <MeridianFooter />
    </div>
  );
}
