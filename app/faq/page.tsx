import type { Metadata } from 'next';
import '../meridian.css';
import MeridianNav from '../../components/meridian/MeridianNav';
import MeridianFooter from '../../components/meridian/MeridianFooter';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers to common questions about the PATSL ITIN application and CAA verification process.',
};

const FAQS = [
  {
    q: 'Do I need to mail my passport to the IRS?',
    a: 'No. As a Certified Acceptance Agent, PATSL verifies your identity documents in person at our office, so your originals never get mailed anywhere.',
  },
  {
    q: 'Do I have to visit an office in person?',
    a: 'Yes — one short visit to our CAA office is required so we can verify your original passport or national ID in person. This is the only in-person step; everything before and after (intake, payment, IRS package prep, and mailing) is handled for you. You can book a time on the Appointment page.',
  },
  {
    q: 'How long does processing take?',
    a: 'Most CAA Concierge cases move to IRS-ready status within 3-5 business days of your verification appointment and payment.',
  },
  {
    q: 'Can I check my case status?',
    a: 'Yes — use the Track My Case page with your application reference to see real-time status updates.',
  },
];

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mrd-chevron mrd-accent-teal flex-none">
      <polyline points="6,9 12,15 18,9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MeridianFaqPage() {
  return (
    <div className="mrd-root min-h-screen">
      <MeridianNav cta={{ label: 'Book Appointment', href: '/appointment' }} />

      <section className="relative px-6 pb-24 pt-16 sm:px-10">
        <div className="mx-auto max-w-[760px]">
          <span className="mb-2.5 inline-flex text-[.78rem] uppercase tracking-[.16em] mrd-accent-green">FAQ</span>
          <h1 className="mb-8 font-extrabold" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.6rem)' }}>Common questions</h1>

          <div className="flex flex-col gap-3.5">
            {FAQS.map((faq) => (
              <details key={faq.q} className="mrd-faq mrd-card overflow-hidden">
                <summary className="flex items-center justify-between gap-3 px-6 py-5 text-[.95rem] font-semibold">
                  {faq.q}
                  <ChevronIcon />
                </summary>
                <p className="mrd-muted px-6 pb-5 text-[.88rem] leading-[1.6]">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <MeridianFooter />
    </div>
  );
}
