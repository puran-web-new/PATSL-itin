import Link from 'next/link';
import type { Metadata } from 'next';
import '../meridian.css';
import MeridianNav from '../../components/meridian/MeridianNav';
import MeridianFooter from '../../components/meridian/MeridianFooter';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Compare PATSL ITIN service tiers and pricing for self-service, CAA concierge, and partner filings.',
};

const TIERS = [
  {
    id: 'EXPRESS_SELF_SERVICE',
    name: 'Express Self-Service',
    price: '$149',
    description: 'Includes your required in-person CAA verification appointment — you then receive a ready-to-file draft package to review and mail yourself.',
    features: [
      'In-person CAA identity verification (required for every tier)',
      'Guided online intake',
      'Draft W-7 package you file yourself',
      'Email support',
    ],
    featured: false,
  },
  {
    id: 'CAA_CONCIERGE',
    name: 'CAA Concierge',
    price: '$180',
    wasPrice: '$349',
    note: 'Introductory CAA rate — save $169',
    description: 'Full-service handling: in-person CAA verification, complete document review, and we prepare and mail your IRS package for you.',
    features: [
      'In-person Certified Acceptance Agent identity review',
      'Full document verification queue',
      'We prepare & mail your IRS-ready package',
      'Priority case tracking',
    ],
    featured: true,
  },
  {
    id: 'B2B_PORTAL',
    name: 'B2B Wholesale Portal',
    price: '$99',
    description: 'Partner intake flow for law firms, CPAs, and formation partners — each applicant still completes their own CAA verification visit.',
    features: ['Bulk-friendly intake', 'Partner billing', 'Volume pricing available'],
    featured: false,
  },
];

export default function MeridianPricingPage() {
  return (
    <div className="mrd-root min-h-screen">
      <MeridianNav cta={{ label: 'Book Appointment', href: '/appointment' }} />

      <section className="relative px-6 pb-24 pt-16 sm:px-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <span className="mb-3 inline-flex w-full justify-center text-[.78rem] uppercase tracking-[.16em] mrd-accent-green">
              PATSL ITIN Services
            </span>
            <h1 className="mb-3 font-extrabold" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.6rem)' }}>
              Secure document automation for ITIN workflows
            </h1>
            <p className="mrd-muted text-[.95rem] leading-[1.6]">
              Pick the tier that fits your case. Every plan follows the same IRS-compliant review order, includes an
              in-person CAA verification appointment, and full case tracking.
            </p>
          </div>

          <div className="grid items-stretch gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))' }}>
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className={tier.featured ? 'relative flex flex-col gap-1 rounded-[18px] p-8' : 'mrd-card flex flex-col gap-1 p-8'}
                style={
                  tier.featured
                    ? { background: 'linear-gradient(160deg, #0c2038, #081627)', border: '1.5px solid #1de9c2', boxShadow: '0 0 30px rgba(29,233,194,.25)' }
                    : undefined
                }
              >
                {/* Fixed-height badge slot on every card (even non-featured ones) so the
                    title/price/feature rows line up across all 3 cards instead of the
                    featured card's content sitting lower than its neighbors. */}
                <div className="mb-2 flex h-7 items-center">
                  {tier.featured && (
                    <span className="w-fit rounded-full px-3 py-1.5 text-[.7rem] font-extrabold" style={{ background: 'linear-gradient(135deg,#1de9c2,#39e08a)', color: '#04241c' }}>
                      Most popular
                    </span>
                  )}
                </div>
                <h3 className="text-[1.1rem] font-bold">{tier.name}</h3>
                {tier.wasPrice ? (
                  <div className="mt-1 flex items-baseline gap-2.5">
                    <span className="text-[1rem] font-semibold text-[#5b7285] line-through">{tier.wasPrice}</span>
                    <span className="mrd-gradient-text text-[1.8rem] font-extrabold">{tier.price}</span>
                  </div>
                ) : (
                  <p className="mrd-gradient-text mt-1 text-[1.8rem] font-extrabold">{tier.price}</p>
                )}
                {tier.note && <p className="mt-0.5 text-[.8rem] font-semibold mrd-accent-green">{tier.note}</p>}
                <p className="mrd-muted mt-2.5 text-[.88rem] leading-[1.6]">{tier.description}</p>
                <div className="mt-2.5 flex flex-1 flex-col gap-2">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-[.85rem]">
                      <span className="mt-1.5 h-[5px] w-[5px] flex-none rounded-full" style={{ background: '#1de9c2' }} />
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  href={`/itin-intake?tier=${tier.id}`}
                  className={tier.featured ? 'mrd-btn-primary mt-5 w-full' : 'mrd-btn-ghost mt-5 w-full'}
                  style={tier.featured ? { padding: '.85rem 1.2rem', boxShadow: '0 0 20px rgba(29,233,194,.35)' } : { padding: '.8rem 1.2rem' }}
                >
                  Choose {tier.name}
                </Link>
              </div>
            ))}
          </div>

          <div className="mrd-card mt-7 p-8">
            <span className="mb-2.5 block text-[.75rem] font-bold uppercase tracking-[.08em] mrd-accent-green">
              Why the CAA Concierge rate is discounted — and why PATSL is different
            </span>
            <p className="max-w-[80ch] text-[.92rem] leading-[1.7]" style={{ color: '#c7dae6' }}>
              Most ITIN applications require mailing your original passport to the IRS — or paying for a certified copy
              from your embassy or consulate first, which costs extra time and money. As an IRS-authorized Certified
              Acceptance Agent, PATSL verifies your identity documents in person at our office: no original documents
              in the mail, no embassy or consulate appointment, no certified-copy fees. Your only in-person step is a
              short verification appointment with us — after that, we submit your Form W-7 to the IRS on your behalf
              with a simple reviewed copy, handled with full professionalism and compliance. And unlike many preparers,
              we never require you to file back taxes before your ITIN application can move forward. Eliminating that
              overhead is exactly why we can pass the $180 introductory rate on to you.
            </p>
          </div>

          <p className="mrd-muted mt-8 text-center text-[.85rem]">
            Have more questions?{' '}
            <Link href="/faq" className="font-semibold mrd-accent-teal hover:underline">
              Read the FAQ
            </Link>
          </p>
        </div>
      </section>

      <MeridianFooter />
    </div>
  );
}
