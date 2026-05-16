'use client';

import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import { useState } from 'react';

type Discipline = 'speed' | 'artistic' | 'slalom' | 'aggressive';
type Status = 'idle' | 'loading' | 'success' | 'error';

const DISCIPLINE_LABELS: Record<Discipline, string> = {
  speed:      'Speed Skating',
  artistic:   'Artistic Freestyle',
  slalom:     'Slalom',
  aggressive: 'Aggressive / Stunt',
};

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '91XXXXXXXXXX';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function buildWhatsAppUrl(name: string, age: string, phone: string, discipline: Discipline): string {
  const disciplineLabel = DISCIPLINE_LABELS[discipline];
  const message = [
    `Hi ISA! I'd like to join.`,
    `Name: ${name}`,
    `Age: ${age}`,
    `Phone: ${phone}`,
    `Discipline: ${disciplineLabel}`,
  ].join('\n');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function JoinPage() {
  const containerRef = useGSAPScroll();

  const [name, setName]             = useState('');
  const [age, setAge]               = useState('');
  const [phone, setPhone]           = useState('');
  const [discipline, setDiscipline] = useState<Discipline | ''>('');

  const [showActions, setShowActions] = useState(false);
  const [status, setStatus]           = useState<Status>('idle');
  const [errorMsg, setErrorMsg]       = useState('');

  // Validate fields and show action buttons
  function handleLaceUp(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !age || !phone || !discipline) return;
    setShowActions(true);
    setStatus('idle');
    setErrorMsg('');
  }

  // Open WhatsApp in new tab and log to backend
  async function handleWhatsApp() {
    if (!discipline) return;
    window.open(buildWhatsAppUrl(name, age, phone, discipline as Discipline), '_blank');

    // Also save to MongoDB silently (no email sent)
    try {
      await fetch(`${API_URL}/api/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age: parseInt(age), phone, discipline, method: 'whatsapp' }),
      });
    } catch {
      // Silently ignore — WhatsApp already opened
    }
  }

  // Send via email through backend
  async function handleEmail() {
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/api/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age: parseInt(age), phone, discipline, method: 'email' }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(data.message ?? 'Something went wrong. Please try WhatsApp.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Cannot reach the server. Please try WhatsApp instead.');
    }
  }

  return (
    <main className="page-wrapper" ref={containerRef as React.RefObject<HTMLElement>}>
      <section className="cta-section section" id="join">
        <h2 className="cta-title reveal">Join the Rink</h2>
        <p className="cta-subtitle reveal">
          Begin your journey. Lace up and roll with India&apos;s best.
        </p>

        {status === 'success' ? (
          <div className="join-success reveal" id="join-success">
            <div className="join-success-icon">🛼</div>
            <h3 className="join-success-title">We&apos;ll be in touch!</h3>
            <p className="join-success-sub">
              Your enquiry has been sent to the ISA team. We&apos;ll call you shortly.
            </p>
          </div>
        ) : (
          <>
            <form className="cta-form reveal" onSubmit={handleLaceUp} id="join-form">
              <input
                className="form-input"
                type="text"
                placeholder="Your Name"
                id="form-name"
                required
                value={name}
                onChange={e => { setName(e.target.value); setShowActions(false); }}
              />
              <input
                className="form-input"
                type="number"
                placeholder="Age"
                id="form-age"
                required
                min={4}
                max={80}
                value={age}
                onChange={e => { setAge(e.target.value); setShowActions(false); }}
              />
              <input
                className="form-input full-width"
                type="tel"
                placeholder="Phone Number (10 digits)"
                id="form-phone"
                required
                pattern="[6-9][0-9]{9}"
                value={phone}
                onChange={e => { setPhone(e.target.value); setShowActions(false); }}
              />
              <select
                className="form-select full-width"
                id="form-interest"
                value={discipline}
                onChange={e => { setDiscipline(e.target.value as Discipline); setShowActions(false); }}
                required
              >
                <option value="" disabled>Select Discipline</option>
                <option value="speed">Speed Skating</option>
                <option value="artistic">Artistic Freestyle</option>
                <option value="slalom">Slalom</option>
                <option value="aggressive">Aggressive / Stunt</option>
              </select>
              <button type="submit" className="btn-submit" id="submit-form">
                → Lace Up
              </button>
            </form>

            {/* Two-option action bar */}
            {showActions && (
              <div className="join-actions reveal" id="join-actions">
                <p className="join-actions-label">How would you like to send your enquiry?</p>
                <div className="join-actions-row">
                  <button
                    className="join-action-btn join-action-whatsapp"
                    id="btn-whatsapp"
                    onClick={handleWhatsApp}
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="join-action-icon" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Send via WhatsApp
                  </button>

                  <button
                    className="join-action-btn join-action-email"
                    id="btn-email"
                    onClick={handleEmail}
                    type="button"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <span className="join-action-spinner" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="join-action-icon" aria-hidden="true">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    )}
                    {status === 'loading' ? 'Sending...' : 'Send via Email'}
                  </button>
                </div>

                {status === 'error' && (
                  <p className="join-error" id="join-error">{errorMsg}</p>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
