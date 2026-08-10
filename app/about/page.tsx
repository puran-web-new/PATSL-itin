import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import '../meridian.css';
import MeridianNav from '../../components/meridian/MeridianNav';
import MeridianFooter from '../../components/meridian/MeridianFooter';
import RimRing from '../../components/meridian/RimRing';

export const metadata: Metadata = {
  title: 'About',
  description: 'Meet Puran Ramratan, the IRS Certified Acceptance Agent behind the PATSL ITIN platform.',
};

type IconKey = 'irs' | 'efile' | 'state' | 'adp' | 'grad' | 'cert';

const CREDENTIALS: { label: string; color: string; href: string; icon: IconKey }[] = [
  {
    label: 'IRS Certified Acceptance Agent',
    color: '#1de9c2',
    href: 'https://www.irs.gov/tax-professionals/acceptance-agents-for-form-w-7-application-for-irs-individual-taxpayer-identification-number',
    icon: 'irs',
  },
  {
    label: 'IRS Tax Preparer',
    color: '#39e08a',
    href: 'https://www.irs.gov/tax-professionals/choosing-a-tax-professional',
    icon: 'irs',
  },
  {
    label: 'Electronic Return Originator',
    color: '#1de9c2',
    href: 'https://www.irs.gov/e-file-providers/become-an-authorized-e-file-provider-of-individual-or-business-tax-returns',
    icon: 'efile',
  },
  {
    label: 'NY Registered Tax Preparer',
    color: '#39e08a',
    href: 'https://www.tax.ny.gov/tp/reg/default.htm',
    icon: 'state',
  },
  {
    label: 'ADP Certified — US Tax & Payroll Essentials',
    color: '#1de9c2',
    href: 'https://www.adp.com/',
    icon: 'adp',
  },
  {
    label: 'ADP Certified Accountant Connect Partner',
    color: '#39e08a',
    href: 'https://www.adp.com/accountant/',
    icon: 'adp',
  },
];

const EDUCATION: { title: string; place: string; color: string; href?: string }[] = [
  { title: 'B.Sc., Accountancy', place: 'University of Guyana', color: '#1de9c2', href: 'https://www.uog.edu.gy/' },
  {
    title: 'A.S., Accounting',
    place: 'Borough of Manhattan Community College (CUNY), New York',
    color: '#39e08a',
    href: 'https://www.bmcc.cuny.edu/',
  },
  {
    title: 'Financial Analysis',
    place: 'Corporate Finance Institute (CFI), Canada',
    color: '#1de9c2',
    href: 'https://corporatefinanceinstitute.com/',
  },
  { title: 'Banking & Finance Qualifications', place: 'Additional coursework completed in India', color: '#39e08a' },
];

function CredentialIcon({ icon, color }: { icon: IconKey; color: string }) {
  const common = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (icon) {
    case 'irs':
      return (
        <svg {...common}>
          <path d="M12 3 4 6.5V11c0 4.9 3.2 8.9 8 10 4.8-1.1 8-5.1 8-10V6.5L12 3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'efile':
      return (
        <svg {...common}>
          <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
          <path d="m4 6.5 8 6 8-6" />
        </svg>
      );
    case 'state':
      return (
        <svg {...common}>
          <path d="M12 3 3 8v1h18V8L12 3Z" />
          <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18" />
        </svg>
      );
    case 'adp':
      return (
        <svg {...common}>
          <circle cx="12" cy="8.5" r="4.5" />
          <path d="M7.5 14 6 21l6-3.2L18 21l-1.5-7" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="8.5" r="4.5" />
          <path d="M7.5 14 6 21l6-3.2L18 21l-1.5-7" />
        </svg>
      );
  }
}

function GradCapIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
      <path d="M22 10v6" />
    </svg>
  );
}

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
              Led by Puran Ramratan, a credentialed tax, accounting, and financial services professional with
              hands-on experience across IRS compliance, payroll, financial analysis, and document authentication
              — based in Queens, NY.
            </p>
            <p className="mrd-muted mb-4 text-[.95rem] leading-[1.75]">
              As an IRS Certified Acceptance Agent, Puran personally verifies every applicant&rsquo;s identity documents
              in person, so no client ever has to mail an original passport to the IRS or chase down a certified copy
              from an embassy or consulate.
            </p>
            <p className="mrd-muted text-[.95rem] leading-[1.75]">
              His background spans multiple disciplines and countries: an accountancy degree from the University of
              Guyana, an accounting degree from a CUNY college in New York, financial analysis training from Canada&rsquo;s
              Corporate Finance Institute, and additional banking and finance qualifications earned in India — on top
              of IRS and ADP-certified credentials in US tax and payroll practice.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {CREDENTIALS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mrd-pill-outline inline-flex items-center gap-1.5 transition-transform hover:-translate-y-0.5"
                  style={{ border: `1px solid ${c.color}4d`, color: c.color }}
                >
                  <CredentialIcon icon={c.icon} color={c.color} />
                  {c.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-[1100px]">
          <span className="mb-4 block text-[.75rem] font-bold uppercase tracking-[.08em] mrd-accent-green">Education & Additional Qualifications</span>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {EDUCATION.map((e) => {
              const inner = (
                <>
                  <span className="mrd-check flex-none" style={{ border: `1.5px solid ${e.color}` }}>
                    <GradCapIcon color={e.color} />
                  </span>
                  <span className="text-[.88rem] leading-[1.5]">
                    <span className="block font-semibold">{e.title}</span>
                    <span className="mrd-muted block text-[.8rem]">{e.place}</span>
                  </span>
                </>
              );
              return e.href ? (
                <a
                  key={e.title}
                  href={e.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mrd-card flex items-start gap-3 px-5 py-4 transition-transform hover:-translate-y-0.5"
                >
                  {inner}
                </a>
              ) : (
                <div key={e.title} className="mrd-card flex items-start gap-3 px-5 py-4">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-[1100px] rounded-[18px] p-8" style={{ background: 'linear-gradient(160deg, #0c2038, #081627)', border: '1px solid rgba(29,233,194,.12)' }}>
          <span className="mb-2.5 block text-[.75rem] font-bold uppercase tracking-[.08em] mrd-accent-green">The PATSL network</span>
          <p className="mb-5 max-w-[80ch] text-[.92rem] leading-[1.7]" style={{ color: '#c7dae6' }}>
            Puran Accounting & Tax Solution Lab is the accounting practice behind PATSL. PATSL Developer LLC builds
            the technology behind this platform, and the Nexus CAA Training Academy trains the next generation of
            Certified Acceptance Agents in forensic document verification.
          </p>
          <div className="flex flex-wrap items-center gap-8">
            <a href="https://www.puranaccounting.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5" style={{ color: '#eaf6f6' }}>
              <Image src="/meridian/puran-icon.png" alt="Puran Accounting & Tax Solution Lab" width={34} height={34} className="rounded-md object-contain" />
              <span className="text-[.85rem] font-semibold">Puran Accounting & Tax Solution Lab</span>
            </a>
            <Link href="/" className="flex items-center gap-2.5" style={{ color: '#eaf6f6' }}>
              <Image src="/meridian/patsl-developer-logo.png" alt="PATSL Developer LLC" width={34} height={34} className="rounded-md object-contain" />
              <span className="text-[.85rem] font-semibold">PATSL Developer LLC</span>
            </Link>
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
