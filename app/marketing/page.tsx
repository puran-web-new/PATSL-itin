import Link from 'next/link';
import type { Metadata } from 'next';

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
      <section className="bg-ink-950 py-16 text-white md:py-20">
        <div className="container-page">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">PATSL ITIN Services</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight">Secure document automation for ITIN workflows</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            Pick the tier that fits your case. Every plan follows the same IRS-compliant review order and includes
            case tracking.
          </p>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`flex flex-col rounded-2xl border p-6 shadow-card ${
                tier.featured ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'
              }`}
            >
              {tier.featured && (
                <span className="mb-3 inline-block w-fit rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-bold text-ink-900">{tier.name}</h2>
              <p className="mt-2 text-3xl font-bold text-brand-700">{tier.price}</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">{tier.description}</p>
              <ul className="mt-5 flex-1 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`/itin-intake?tier=${tier.id}`}
                className={`mt-6 rounded-lg px-4 py-3 text-center text-sm font-semibold ${
                  tier.featured ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border border-slate-300 text-ink-900 hover:bg-ink-50'
                }`}
              >
                Choose {tier.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-50 py-16 md:py-20">
        <div className="container-page max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">FAQ</p>
          <h2 className="mt-2 text-3xl font-bold text-ink-900">Common questions</h2>
          <div className="mt-8 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
                <h3 className="text-sm font-bold text-ink-900">{faq.q}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
