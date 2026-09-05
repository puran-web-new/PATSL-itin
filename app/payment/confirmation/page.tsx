import Link from 'next/link';

export default function PaymentConfirmationPage() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-abyss py-16 text-center md:py-24">
      <div className="bg-dot-grid absolute inset-0 opacity-40" />
      <div className="glass-card relative mx-auto max-w-lg border-mint-500/30 p-8 shadow-glow-mint">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mint-500 text-xl text-ink-950">✓</span>
        <p className="label-mono mt-5 text-[11px] font-semibold uppercase text-mint-400">Payment received</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Thank you for your payment</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Your payment is being confirmed and your PATSL case will move into review. Keep your payment confirmation for your records.
        </p>
        <div className="mt-6 rounded-lg border border-white/10 bg-abyss-panel p-4 text-left text-xs text-slate-300">
          <p className="font-semibold text-white">What happens next</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-slate-400">
            <li>We confirm the payment and review your application.</li>
            <li>We email your receipt and case update when email delivery is configured.</li>
            <li>Your final client package is delivered through the secure client portal.</li>
          </ol>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/portal/sign-in" className="btn-pill-primary">Open client portal</Link>
          <Link href="/status" className="btn-pill-ghost">Track my case</Link>
        </div>
      </div>
    </section>
  );
}
