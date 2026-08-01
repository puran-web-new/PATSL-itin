import Link from 'next/link';
import type { Metadata } from 'next';
import FaqAccordion from '../../components/marketing/FaqAccordion';

export const metadata: Metadata = {
  title: 'Services & Pricing',
  description: 'Compare PATSL ITIN service tiers and pricing for self-service, CAA concierge, and partner filings.',
};

const tiers = [
  {
    id: 'EXPRESS_SELF_SERVICE',
    name: 'Express Self-Service',
    price: '$149',
    description: 'Guided W-7 intake and draft package generation for self-service clients.',
    features: ['Guided online intake', 'Draft W-7 package for self-filing', 'Email support'],
  },
  {
    id: 'CAA_CONCIERGE',
    name: 'CAA Concierge',
    price: '$349',
    description: 'Document review, payment workflow, admin verification queue, and IRS-ready package generation.',
    features: [
      'Certified Acceptance Agent identity review',
      'Full document verification queue',
      'IRS-ready mailing package',
      'Priority case tracking',
    ],
    featured: true,
  },
  {
    id: 'B2B_PORTAL',
    name: 'B2B Wholesale Portal',
    price: '$99',
    description: 'Partner intake flow for law firms, CPAs, and formation partners.',
    features: ['Bulk-friendly intake', 'Partner billing', 'Volume pricing available'],
  },
];

const faqs = [
  {
    q: 'Do I need to mail my passport to the IRS?',
    a: 'No. As a Certified Acceptance Agent, PATSL can verify your identity documents directly, so your originals never leave your hands.',
  },
  {
    q: 'How long does processing take?',
    a: 'Most CAA Concierge cases move to IRS-ready status within 3-5 business days of document verification and payment.',
  },
  {
    q: 'Can I check my case status?',
    a: 'Yes — use the Track My Case page with your application reference to see real-time status updates.',
  },
];

export default function MarketingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-abyss py-16 text-white md:py-20">
        <div className="bg-dot-grid absolute inset-0 opacity-50" />
        <div className="container-page relative">
          <p className="label-mono text-[12px] font-semibold uppercase text-mint-400">PATSL ITIN Services</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight">Secure document automation for ITIN workflows</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
            Pick the tier that fits your case. Every plan follows the same IRS-compliant review order and includes
            case tracking.
          </p>
        </div>
      </section>

      <section className="bg-abyss py-16 md:py-20">
        <div className="container-page grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`glass-card flex flex-col p-6 ${tier.featured ? 'border-mint-500/50 shadow-glow-mint' : ''}`}
            >
              {tier.featured && (
                <span className="mb-3 inline-block w-fit rounded-full bg-mint-500 px-3 py-1 text-xs font-bold text-ink-950">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-bold text-white">{tier.name}</h2>
              <p className="mt-2 text-3xl font-bold text-mint-400">{tier.price}</p>
              <p className="mt-4 text-sm leading-6 text-slate-400">{tier.description}</p>
              <ul className="mt-5 flex-1 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-teal-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`/itin-intake?tier=${tier.id}`}
                className={`mt-6 text-center ${tier.featured ? 'btn-pill-primary' : 'btn-pill-ghost'}`}
              >
                Choose {tier.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-abyss-raised py-16 md:py-20">
        <div className="bg-dot-grid absolute inset-0 opacity-30" />
        <div className="container-page relative max-w-3xl">
          <p className="label-mono text-[12px] font-semibold uppercase text-mint-400">FAQ</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Common questions</h2>
          <FaqAccordion faqs={faqs} />
        </div>
      </section>
    </>
  );
}
