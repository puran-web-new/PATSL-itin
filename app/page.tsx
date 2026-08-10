import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import './meridian.css';
import MeridianNav from '../components/meridian/MeridianNav';
import MeridianFooter from '../components/meridian/MeridianFooter';
import HeroBackdrop from '../components/meridian/HeroBackdrop';
import RimRing from '../components/meridian/RimRing';
import RevealOnScroll from '../components/meridian/RevealOnScroll';

const STATS = [
  { value: '100%', label: 'CAA-reviewed cases' },
  { value: '7-11', label: 'Week IRS turnaround' },
  { value: '90-day', label: 'PII retention window' },
  { value: '$180', label: 'Introductory CAA rate' },
];

const SHOWCASE = [
  { id: 'client-intake', label: 'Client Intake', photo: '/meridian/showcase-client-intake.jpg' },
  { id: 'document-review', label: 'Document Review', photo: '/meridian/showcase-document-review.jpg' },
  { id: 'irs-package', label: 'IRS Package', photo: '/meridian/showcase-irs-package.jpg' },
];

const STEPS = [
  { color: '#1de9c2', duration: '5s', reverse: false, title: 'Apply online', body: 'Complete a guided intake covering your identity, filing reason, and mailing details in about ten minutes.' },
  { color: '#39e08a', duration: '5.6s', reverse: true, title: 'Upload documents', body: 'Securely upload a copy of your passport or national ID so we can pre-verify it before your appointment.' },
  { color: '#39e08a', duration: '5.3s', reverse: false, title: 'Visit for verification', body: 'Book an appointment and bring your original ID to our CAA office — a quick in-person check, no embassy or consulate visit needed.' },
  { color: '#1de9c2', duration: '4.4s', reverse: false, title: 'Pay & submit', body: 'Choose a service tier, pay securely through Square, and your case moves straight into CAA review.' },
  { color: '#39e08a', duration: '6.2s', reverse: true, title: 'Receive your IRS package', body: 'We compile your Form W-7, Certificate of Accuracy, and return in the correct IRS mailing order.' },
];

const CREDENTIALS = [
  { label: 'IRS Certified Acceptance Agent', color: '#1de9c2' },
  { label: 'Electronic Return Originator', color: '#39e08a' },
  { label: 'Authorized Tax Preparer', color: '#1de9c2' },
  { label: 'NY Registered Preparer', color: '#39e08a' },
  { label: 'Accountant Connect Partner', color: '#1de9c2' },
];

const TRUST_POINTS = [
  { color: '#1de9c2', text: 'In-person CAA identity verification at our office — your original passport never has to be mailed to the IRS.' },
  { color: '#39e08a', text: 'Bank-grade data handling with automatic 90-day retention scrubbing on identity records.' },
  { color: '#1de9c2', text: 'Transparent, flat-fee pricing with no hidden filing charges.' },
  { color: '#39e08a', text: 'Case status visible any time from the Track My Case page.' },
];

function StepRingBadge({ index, color, duration, reverse }: { index: number; color: string; duration: string; reverse: boolean }) {
  const other = color === '#1de9c2' ? '#39e08a' : '#1de9c2';
  return (
    <div className="mrd-badge-icon relative mb-4 flex h-11 w-11 items-center justify-center text-[.95rem] font-bold" style={{ color }}>
      <RimRing
        gradient={`conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${color} 305deg, ${other} 325deg, ${color} 345deg, transparent 360deg)`}
        duration={duration}
        reverse={reverse}
      />
      <span className="relative z-[1]">{index}</span>
    </div>
  );
}

export default function MeridianHomePage() {
  return (
    <div className="mrd-root">
      <section className="relative min-h-screen overflow-visible" style={{ background: 'radial-gradient(120% 120% at 15% 10%, #0b2036 0%, #071223 60%)' }}>
        <HeroBackdrop />

        <MeridianNav large cta={{ label: 'Start Application', href: '/itin-intake' }} />

        <div className="relative z-[5] grid gap-10 px-6 pt-16 sm:px-10 lg:grid-cols-[1fr_minmax(340px,580px)] lg:items-start lg:pt-20">
          <div className="max-w-xl">
            <span className="mb-4 inline-flex items-center gap-2 text-[.78rem] uppercase tracking-[.16em] mrd-accent-green" style={{ animation: 'mrd-fade-up 0.7s ease-out both' }}>
              <span className="h-px w-6" style={{ background: '#39e08a' }} />
              CAA-Reviewed &middot; IRS-Order Packaging
            </span>
            <h1
              className="mb-4 font-extrabold leading-[1.1]"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', animation: 'mrd-fade-up 0.7s ease-out 0.08s both' }}
            >
              Where accuracy meets <span className="mrd-gradient-text">integrity</span>.
            </h1>
            <p className="mrd-muted mb-8 max-w-[480px] text-[1.02rem] leading-[1.7]" style={{ animation: 'mrd-fade-up 0.7s ease-out 0.16s both' }}>
              A secure ITIN intake, payment, identity review, and IRS package automation platform — from a credentialed
              Certified Acceptance Agent practice.
            </p>
            <div className="flex flex-wrap gap-4" style={{ animation: 'mrd-fade-up 0.7s ease-out 0.24s both' }}>
              <Link href="/itin-intake" className="mrd-btn-primary" style={{ padding: '.9rem 1.8rem', boxShadow: '0 0 24px rgba(29,233,194,.4)' }}>
                Start Client Intake
              </Link>
              <Link href="/marketing" className="mrd-btn-ghost">View Service Tiers</Link>
              <Link href="/status" className="mrd-btn-ghost">Track My Case</Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[20px]" style={{ boxShadow: '0 30px 70px rgba(0,0,0,.55)', animation: 'mrd-float-glow 6s ease-in-out infinite' }}>
            <RimRing
              gradient="conic-gradient(from 0deg, transparent 0deg, transparent 240deg, #1de9c2 278deg, #7dffde 300deg, #39e08a 322deg, transparent 355deg)"
              duration="6s"
              padding="3px"
              glow="drop-shadow(0 0 10px #1de9c2) drop-shadow(0 0 22px #39e08a) drop-shadow(0 0 34px rgba(29,233,194,.5))"
            />
            <div
              className="relative overflow-hidden rounded-[18px]"
              style={{ WebkitMaskImage: 'radial-gradient(ellipse 88% 88% at center, #000 62%, transparent 100%)', maskImage: 'radial-gradient(ellipse 88% 88% at center, #000 62%, transparent 100%)' }}
            >
              <Image src="/meridian/itin-support-banner.jpg" alt="ITIN application support for residents and non-residents" width={700} height={467} className="block h-auto w-full" />
              <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 70px 34px #071223, inset 0 0 24px 10px rgba(7,18,35,.6)' }} />
              <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(7,18,35,.28), transparent 30%, transparent 72%, rgba(7,18,35,.35))' }} />
              <div
                className="pointer-events-none absolute"
                style={{
                  top: '-60%', left: '-60%', width: '60%', height: '220%',
                  background: 'linear-gradient(75deg, transparent, rgba(29,233,194,.28), rgba(57,224,138,.3), transparent)',
                  transform: 'rotate(12deg)', animation: 'mrd-shimmer-sweep 5s ease-in-out infinite', mixBlendMode: 'screen',
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative z-[5] flex flex-wrap gap-10 px-6 pb-20 pt-8 sm:px-10">
          {STATS.map((s) => (
            <div key={s.label}>
              <h3 className="mrd-gradient-text text-[1.8rem]">{s.value}</h3>
              <p className="mrd-muted mt-1 text-[.85rem]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 right-6 z-[5] hidden flex-col items-center gap-2 text-[.72rem] tracking-[.14em] mrd-muted sm:right-10 md:flex">
          <span>SCROLL</span>
          <div className="h-10 w-px" style={{ background: 'linear-gradient(#1de9c2, transparent)', animation: 'mrd-scroll-pulse 1.6s ease-in-out infinite' }} />
        </div>
      </section>

      <section className="mrd-dot-field relative overflow-hidden px-6 py-20 sm:px-10">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <span className="mb-3 inline-flex w-full justify-center text-[.78rem] uppercase tracking-[.16em] mrd-accent-green">Showcase</span>
          <h2 className="font-extrabold" style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)' }}>Real people behind every case</h2>
        </div>

        {/* Mobile / narrow-viewport fallback: static row, no orbit motion (keeps
            things simple and battery-friendly on small screens). */}
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2.5 md:hidden">
          {SHOWCASE.map((card) => (
            <div key={card.id} className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '3 / 4' }}>
              <Image src={card.photo} alt={card.label} fill sizes="140px" className="object-cover" />
              <span className="absolute inset-x-1.5 bottom-1.5 rounded-full px-2 py-1 text-center text-[.6rem] font-semibold uppercase tracking-wide" style={{ background: 'rgba(7,18,35,.7)' }}>
                {card.label}
              </span>
            </div>
          ))}
        </div>

        {/* Desktop: the 3 photos orbit a shared circle, chasing each other
            clockwise, staying upright via a counter-rotating inner wrapper. */}
        <div className="relative mx-auto hidden md:block" style={{ width: 420, height: 420 }}>
          <div className="mrd-badge-icon absolute -left-2 top-2 h-6 w-6" style={{ animation: 'mrd-floaty 6s ease-in-out infinite -1.5s' }}>
            <RimRing gradient="conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #1de9c2 305deg, #39e08a 325deg, #1de9c2 345deg, transparent 360deg)" duration="5s" />
          </div>
          <div className="mrd-badge-icon absolute right-4 top-0 h-4 w-4" style={{ animation: 'mrd-floaty 7s ease-in-out infinite -3s' }}>
            <RimRing gradient="conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #39e08a 305deg, #1de9c2 325deg, #39e08a 345deg, transparent 360deg)" duration="4.5s" reverse />
          </div>

          {/* Faint static circle guide so the orbit path reads intentionally */}
          <div
            className="pointer-events-none absolute rounded-full"
            style={{ inset: 40, border: '1px dashed rgba(29,233,194,.15)' }}
          />

          {SHOWCASE.map((card, i) => (
            <div
              key={card.id}
              className="mrd-orbit-item"
              style={{ '--offset': `${i * 120}deg`, '--radius': '150px' } as CSSProperties}
            >
              <div className="mrd-orbit-counter" style={{ '--offset': `${i * 120}deg` } as CSSProperties}>
                <RevealOnScroll delay={`${i * 140}ms`}>
                  <div
                    className="relative overflow-hidden rounded-[18px]"
                    style={{ width: 170, height: 130, boxShadow: '0 20px 50px rgba(0,0,0,.55)' }}
                  >
                    <RimRing
                      gradient="conic-gradient(from 0deg, transparent 0deg, transparent 240deg, #1de9c2 285deg, #39e08a 312deg, #1de9c2 340deg, transparent 360deg)"
                      duration="6s"
                      padding="1.6px"
                      glow="drop-shadow(0 0 6px #1de9c2)"
                    />
                    <Image src={card.photo} alt={card.label} fill sizes="170px" className="object-cover" />
                    <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 30px 14px #071223' }} />
                    <span
                      className="absolute bottom-2.5 left-2.5 rounded-full px-2.5 py-1 text-[.62rem] font-semibold uppercase tracking-wide"
                      style={{ background: 'rgba(7,18,35,.7)', backdropFilter: 'blur(4px)' }}
                    >
                      {card.label}
                    </span>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mrd-dot-field relative overflow-hidden px-6 py-24 sm:px-10">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <span className="mb-3 inline-flex w-full justify-center text-[.78rem] uppercase tracking-[.16em] mrd-accent-green">How It Works</span>
          <h2 className="font-extrabold" style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)' }}>From application to IRS package in five steps</h2>
        </div>
        <div className="mx-auto grid max-w-[1200px] gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          {STEPS.map((step, i) => (
            <div key={step.title} className="mrd-card relative overflow-hidden p-8">
              <StepRingBadge index={i + 1} color={step.color} duration={step.duration} reverse={step.reverse} />
              <h3 className="mb-2 text-[1.1rem] font-bold">{step.title}</h3>
              <p className="mrd-muted text-[.9rem] leading-[1.6]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative px-6 py-16 sm:px-10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-center gap-3.5">
          {CREDENTIALS.map((c) => (
            <span key={c.label} className="mrd-pill-outline" style={{ border: `1px solid ${c.color}4d`, color: c.color }}>
              {c.label}
            </span>
          ))}
        </div>
      </section>

      <section className="relative px-6 py-24 sm:px-10">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
          <div>
            <span className="mb-3 inline-flex text-[.78rem] uppercase tracking-[.16em] mrd-accent-green">Why Clients Choose PATSL</span>
            <h2 className="mb-4 font-extrabold" style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)' }}>Built for compliance, designed for speed</h2>
            <p className="mrd-muted text-[.95rem] leading-[1.7]">
              Every case follows the IRS-required review order: Form W-7, Certificate of Accuracy, then the associated
              tax return — verified by our team before anything is mailed.
            </p>
          </div>
          <div className="flex flex-col gap-3.5">
            {TRUST_POINTS.map((point) => (
              <div key={point.text} className="mrd-card flex items-start gap-3 px-5 py-4">
                <span className="mrd-check" style={{ border: `1.5px solid ${point.color}`, color: point.color }}>&#10003;</span>
                <span className="text-[.92rem] leading-[1.6]">{point.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 pb-24 pt-8 sm:px-10">
        <div
          className="relative isolate overflow-hidden rounded-[28px] px-6 py-16 text-center sm:px-12"
          style={{ background: 'linear-gradient(120deg, #113252, #0a1c30)' }}
        >
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background: 'radial-gradient(circle at 20% 20%, rgba(29,233,194,.18), transparent 45%), radial-gradient(circle at 80% 80%, rgba(57,224,138,.16), transparent 45%)',
              animation: 'mrd-cta-glow 8s ease-in-out infinite alternate',
            }}
          />
          <h2 className="mb-4" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)' }}>Ready to get your ITIN moving?</h2>
          <p className="mrd-muted mx-auto mb-7 max-w-xl">
            Start your secure intake now — it takes about ten minutes and you can save your case reference to finish later.
          </p>
          <Link href="/itin-intake" className="mrd-btn-primary" style={{ padding: '.9rem 1.8rem', boxShadow: '0 0 24px rgba(29,233,194,.4)' }}>
            Start Client Intake
          </Link>
        </div>
      </section>

      <MeridianFooter full />
    </div>
  );
}
