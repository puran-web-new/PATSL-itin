'use client';

import { FormEvent, useState } from 'react';
import '../meridian.css';
import MeridianNav from '../../components/meridian/MeridianNav';
import MeridianFooter from '../../components/meridian/MeridianFooter';

const HIGHLIGHTS = [
  { color: '#1de9c2', text: 'Bring your original passport or national ID — we verify it on the spot, no notary or embassy needed.' },
  { color: '#39e08a', text: 'Appointments typically run 15–20 minutes.' },
  { color: '#1de9c2', text: 'CAA office — Queens, NY. Exact address is confirmed after booking.' },
];

export default function MeridianAppointmentPage() {
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tier, setTier] = useState('CAA_CONCIERGE');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.get('fullName'),
          email: data.get('email'),
          phone: data.get('phone'),
          preferredDate: data.get('preferredDate'),
          preferredTime: data.get('preferredTime'),
          serviceTier: tier,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to submit request.');
      setBooked(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mrd-root min-h-screen">
      <MeridianNav cta={{ label: 'Book Appointment', href: '/appointment' }} />

      <section className="relative px-6 pb-24 pt-14 sm:px-10">
        <div className="mx-auto grid max-w-[1200px] items-start gap-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <div>
            <span className="mb-3 inline-flex text-[.78rem] uppercase tracking-[.16em] mrd-accent-green">Verification Appointment</span>
            <h1 className="mb-4 font-extrabold" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.6rem)' }}>
              Book your in-person document check
            </h1>
            <p className="mrd-muted mb-6 max-w-[52ch] text-[.95rem] leading-[1.7]">
              Every ITIN case requires one short, in-person visit to our CAA office so we can verify your original
              identity document. This is the only in-person step in the whole process — after this, everything else
              is handled for you and mailed to the IRS on your behalf.
            </p>
            <div className="flex flex-col gap-3.5">
              {HIGHLIGHTS.map((h) => (
                <div key={h.text} className="mrd-card flex items-start gap-3 px-5 py-4">
                  <span className="mrd-check" style={{ border: `1.5px solid ${h.color}`, color: h.color }}>&#10003;</span>
                  <span className="text-[.92rem] leading-[1.6]">{h.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] p-8" style={{ background: 'linear-gradient(160deg, #0c2038, #081627)', border: '1px solid rgba(29,233,194,.2)', boxShadow: '0 0 30px rgba(29,233,194,.15)' }}>
            {!booked ? (
              <>
                <h3 className="mb-1 text-[1.15rem] font-bold">Request a time</h3>
                <p className="mrd-muted mb-5 text-[.85rem]">We&rsquo;ll confirm your exact appointment slot by email or phone.</p>
                {error && <p className="mb-4 text-[.82rem] text-red-400">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                  <div>
                    <label className="mrd-muted mb-1.5 block text-[.78rem]">Full name</label>
                    <input name="fullName" type="text" required placeholder="Jordan Alvarez" className="mrd-input" />
                  </div>
                  <div>
                    <label className="mrd-muted mb-1.5 block text-[.78rem]">Email address</label>
                    <input name="email" type="email" required placeholder="you@example.com" className="mrd-input" />
                  </div>
                  <div>
                    <label className="mrd-muted mb-1.5 block text-[.78rem]">Phone</label>
                    <input name="phone" type="tel" placeholder="(555) 555-1234" className="mrd-input" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mrd-muted mb-1.5 block text-[.78rem]">Preferred date</label>
                      <input name="preferredDate" type="date" className="mrd-input" />
                    </div>
                    <div>
                      <label className="mrd-muted mb-1.5 block text-[.78rem]">Preferred time</label>
                      <input name="preferredTime" type="time" className="mrd-input" />
                    </div>
                  </div>
                  <div>
                    <label className="mrd-muted mb-1.5 block text-[.78rem]">Which service?</label>
                    <div className="flex overflow-hidden rounded-[10px]" style={{ border: '1px solid rgba(234,246,246,.15)' }}>
                      {[
                        { id: 'EXPRESS_SELF_SERVICE', label: 'Express' },
                        { id: 'CAA_CONCIERGE', label: 'CAA Concierge' },
                        { id: 'B2B_PORTAL', label: 'B2B Portal' },
                      ].map((t, i) => (
                        <label key={t.id} className="mrd-tier-radio" style={i > 0 ? { borderLeft: '1px solid rgba(234,246,246,.15)' } : undefined}>
                          <input type="radio" name="tier" checked={tier === t.id} onChange={() => setTier(t.id)} className="mr-1.5" />
                          {t.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={submitting} className="mrd-btn-primary mt-1 w-full disabled:opacity-60" style={{ padding: '.85rem 1.3rem' }}>
                    {submitting ? 'Submitting…' : 'Request appointment'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3 className="mb-2.5 text-[1.15rem] font-bold">Request received</h3>
                <p className="mrd-muted text-[.9rem] leading-[1.6]">
                  Thanks — our team will confirm your verification appointment time by email or phone within one
                  business day. Please bring your original passport or national ID.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <MeridianFooter />
    </div>
  );
}
