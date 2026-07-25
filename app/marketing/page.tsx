const tiers = [
  ['Express Self-Service', '$149', 'Guided W-7 intake and draft package generation for self-service clients.'],
  ['CAA Concierge', '$349', 'Document review, payment workflow, admin verification queue, and IRS-ready package generation.'],
  ['B2B Wholesale Portal', '$99', 'Partner intake flow for law firms, CPAs, and formation partners.'],
];

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">PATSL ITIN Services</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950">Secure document automation for ITIN workflows</h1>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {tiers.map(([name, price, description]) => (
            <div key={name} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">{name}</h2>
              <p className="mt-2 text-3xl font-bold text-blue-700">{price}</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
