'use client';

import { useState, useCallback } from 'react';
import Script from 'next/script';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '';

type Discipline = 'speed' | 'artistic' | 'slalom' | 'aggressive';
type Step = 1 | 2 | 3 | 4;
type PaymentStatus = 'idle' | 'loading' | 'success' | 'error';

const DISCIPLINE_OPTIONS: { value: Discipline; label: string; icon: string; desc: string }[] = [
  { value: 'speed',      label: 'Speed Skating',      icon: '⚡', desc: 'Race the wind on straightaways' },
  { value: 'artistic',   label: 'Artistic Freestyle',  icon: '🌀', desc: 'Grace, spins & footwork' },
  { value: 'slalom',     label: 'Slalom',              icon: '🏁', desc: 'Precision cone weaving' },
  { value: 'aggressive', label: 'Aggressive / Stunt',  icon: '🔥', desc: 'Tricks, grinds & jumps' },
];

const PLAN_OPTIONS = [
  { months: 1,  label: '1 Month',  price: 599,  savings: null,        popular: false },
  { months: 3,  label: '3 Months', price: 1499, savings: 'Save ₹298', popular: true  },
  { months: 6,  label: '6 Months', price: 2499, savings: 'Save ₹1,095', popular: false },
  { months: 12, label: '1 Year',   price: 3999, savings: 'Save ₹2,989', popular: false },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function AdmissionPage() {
  const [step, setStep] = useState<Step>(1);
  const [razorpayReady, setRazorpayReady] = useState(false);

  // Step 1 — Personal Details
  const [name, setName]                       = useState('');
  const [email, setEmail]                     = useState('');
  const [phone, setPhone]                     = useState('');
  const [dob, setDob]                         = useState('');
  const [address, setAddress]                 = useState('');
  const [discipline, setDiscipline]           = useState<Discipline | ''>('');
  const [guardianName, setGuardianName]       = useState('');
  const [bloodGroup, setBloodGroup]           = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Step 2 — Aadhaar number (text, no upload)
  const [aadharNumber, setAadharNumber] = useState('');

  // Step 3 — Plan
  const [planMonths, setPlanMonths] = useState<number>(3);

  // Status
  const [status, setStatus]       = useState<PaymentStatus>('idle');
  const [errorMsg, setErrorMsg]   = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const totalSteps = 4;

  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, totalSteps) as Step);
  }, []);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1) as Step);
  }, []);

  function validateStep1(): string | null {
    if (!name.trim() || name.trim().length < 2) return 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (!/^[6-9]\d{9}$/.test(phone)) return 'Enter a valid 10-digit Indian mobile number.';
    if (!dob) return 'Please enter your date of birth.';
    if (!address.trim() || address.trim().length < 5) return 'Please enter your full address.';
    if (!discipline) return 'Please select a skating discipline.';
    return null;
  }

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg('');
    goNext();
  }

  function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    goNext();
  }

  function handlePlanSelect(months: number) {
    setPlanMonths(months);
  }

  async function handlePayment() {
    if (status === 'loading') return;
    setStatus('loading');
    setErrorMsg('');

    try {
      // Create order + member record via backend
      const regRes = await fetch(`${API_URL}/api/membership/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          dob,
          address: address.trim(),
          discipline,
          aadhar_number:     aadharNumber.trim() || undefined,
          guardian_name:     guardianName.trim() || undefined,
          blood_group:       bloodGroup || undefined,
          emergency_contact: emergencyContact.trim() || undefined,
          plan_months:       planMonths,
        }),
      });

      const regData = await regRes.json();

      if (!regRes.ok || !regData.success) {
        setStatus('error');
        setErrorMsg(regData.message ?? 'Registration failed. Please try again.');
        return;
      }

      const { order_id, amount, membership_id } = regData;

      // Launch Razorpay checkout
      const options = {
        key:         RAZORPAY_KEY_ID,
        amount,
        currency:    'INR',
        name:        'Indian Skating Academy',
        description: `Membership — ${PLAN_OPTIONS.find(p => p.months === planMonths)?.label}`,
        order_id,
        prefill: {
          name:    name.trim(),
          email:   email.trim(),
          contact: phone.trim(),
        },
        theme: { color: '#00C2FF' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // Verify payment
          const verRes = await fetch(`${API_URL}/api/membership/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              membership_id,
            }),
          });

          const verData = await verRes.json();

          if (verRes.ok && verData.success) {
            setExpiryDate(verData.expiry_date ?? '');
            setStatus('success');
            setStep(4);
          } else {
            setStatus('error');
            setErrorMsg(verData.message ?? 'Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            // No-op: status is managed by handler/catch
          },
        },
      };

      if (!window.Razorpay) {
        setStatus('error');
        setErrorMsg('Payment gateway not loaded. Please refresh the page and try again.');
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
      setStatus('idle'); // reset while modal is open
    } catch (err) {
      console.error('[Admission] Payment error:', err);
      setStatus('error');
      setErrorMsg('Cannot reach the server. Please check your connection and try again.');
    }
  }

  const selectedPlan = PLAN_OPTIONS.find(p => p.months === planMonths);

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
      />

      <main className="page-wrapper">
        <section className="admission-section">
          {/* Header */}
          <div className="admission-header">
            <div className="hero-badge" style={{ marginBottom: '20px' }}>
              <span className="hero-badge-dot" />
              Official Admission
            </div>
            <h1 className="admission-title">Join the Academy</h1>
            <p className="admission-subtitle">
              Complete your admission and start skating with India&apos;s best.
            </p>

            {/* Step Progress */}
            {step < 4 && (
              <div className="admission-progress" aria-label="Progress steps">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`admission-step-dot${step >= s ? ' active' : ''}${step > s ? ' done' : ''}`}>
                    {step > s ? '✓' : s}
                  </div>
                ))}
                <div className="admission-progress-labels">
                  <span className={step >= 1 ? 'active' : ''}>Details</span>
                  <span className={step >= 2 ? 'active' : ''}>Documents</span>
                  <span className={step >= 3 ? 'active' : ''}>Plan & Pay</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Step 4: Success ── */}
          {step === 4 && (
            <div className="admission-success">
              <div className="admission-success-icon">🛼</div>
              <h2 className="admission-success-title">Welcome to ISA!</h2>
              <p className="admission-success-sub">
                Your admission is confirmed and membership is now active.
              </p>
              {expiryDate && (
                <div className="admission-success-expiry">
                  <span className="admission-success-expiry-label">Membership valid until</span>
                  <span className="admission-success-expiry-date">
                    {new Date(expiryDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              <p className="admission-success-note">
                A confirmation has been saved in our system. Please visit the{' '}
                <a href="/membership" className="admission-link">Membership Portal</a>{' '}
                to view your status and renew when needed.
              </p>
            </div>
          )}

          {/* ── Step 1: Personal Details ── */}
          {step === 1 && (
            <form className="admission-form" onSubmit={handleStep1Submit} id="admission-step1">
              <div className="admission-form-grid">
                <div className="form-group full-span">
                  <label className="form-label" htmlFor="adm-name">Full Name *</label>
                  <input
                    id="adm-name"
                    className="form-input-v2"
                    type="text"
                    placeholder="e.g. Arjun Sharma"
                    required
                    value={name}
                    onChange={e => { setName(e.target.value); setErrorMsg(''); }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adm-email">Email Address *</label>
                  <input
                    id="adm-email"
                    className="form-input-v2"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adm-phone">Phone Number *</label>
                  <input
                    id="adm-phone"
                    className="form-input-v2"
                    type="tel"
                    placeholder="10-digit mobile number"
                    required
                    pattern="[6-9][0-9]{9}"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setErrorMsg(''); }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adm-dob">Date of Birth *</label>
                  <input
                    id="adm-dob"
                    className="form-input-v2"
                    type="date"
                    required
                    value={dob}
                    onChange={e => { setDob(e.target.value); setErrorMsg(''); }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adm-guardian">Guardian Name (if minor)</label>
                  <input
                    id="adm-guardian"
                    className="form-input-v2"
                    type="text"
                    placeholder="Parent / guardian name"
                    value={guardianName}
                    onChange={e => setGuardianName(e.target.value)}
                  />
                </div>

                <div className="form-group full-span">
                  <label className="form-label" htmlFor="adm-address">Full Address *</label>
                  <textarea
                    id="adm-address"
                    className="form-input-v2 form-textarea"
                    placeholder="House no., street, city, state, PIN"
                    required
                    rows={3}
                    value={address}
                    onChange={e => { setAddress(e.target.value); setErrorMsg(''); }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adm-blood">Blood Group</label>
                  <select
                    id="adm-blood"
                    className="form-input-v2"
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                  >
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adm-emergency">Emergency Contact</label>
                  <input
                    id="adm-emergency"
                    className="form-input-v2"
                    type="tel"
                    placeholder="Emergency phone number"
                    value={emergencyContact}
                    onChange={e => setEmergencyContact(e.target.value)}
                  />
                </div>
              </div>

              {/* Discipline selection */}
              <div className="form-group full-span" style={{ marginTop: '8px' }}>
                <label className="form-label">Skating Discipline *</label>
                <div className="discipline-grid">
                  {DISCIPLINE_OPTIONS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      className={`discipline-card${discipline === d.value ? ' selected' : ''}`}
                      onClick={() => { setDiscipline(d.value); setErrorMsg(''); }}
                      data-cursor-hover
                    >
                      <span className="discipline-icon">{d.icon}</span>
                      <span className="discipline-name">{d.label}</span>
                      <span className="discipline-desc">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && <p className="admission-error">{errorMsg}</p>}

              <button type="submit" className="admission-btn-next" data-cursor-hover>
                Continue to Documents →
              </button>
            </form>
          )}

          {/* ── Step 2: Documents ── */}
          {step === 2 && (
            <form className="admission-form" onSubmit={handleStep2Submit} id="admission-step2">
              <div className="admission-docs-intro">
                <p>Please provide your Aadhaar details. Document photos will be submitted in person at the academy.</p>
              </div>

              <div className="admission-form-grid">
                <div className="form-group full-span">
                  <label className="form-label" htmlFor="adm-aadhar">Aadhaar Card Number</label>
                  <input
                    id="adm-aadhar"
                    className="form-input-v2"
                    type="text"
                    placeholder="XXXX XXXX XXXX"
                    maxLength={14}
                    value={aadharNumber}
                    onChange={e => {
                      // Auto-format XXXX XXXX XXXX
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setAadharNumber(formatted);
                    }}
                  />
                  <span className="form-hint">Your 12-digit Aadhaar number (stored securely)</span>
                </div>
              </div>

              {/* Document checklist */}
              <div className="docs-checklist">
                <h3 className="docs-checklist-title">Documents to bring on your first day:</h3>
                <ul className="docs-list">
                  <li className="docs-item">
                    <span className="docs-icon">🪪</span>
                    <span>Original Aadhaar Card + 1 photocopy</span>
                  </li>
                  <li className="docs-item">
                    <span className="docs-icon">📸</span>
                    <span>2 Passport-size photographs (white background)</span>
                  </li>
                  <li className="docs-item">
                    <span className="docs-icon">📋</span>
                    <span>Birth certificate (for students under 18)</span>
                  </li>
                  <li className="docs-item">
                    <span className="docs-icon">✅</span>
                    <span>Signed consent form (provided at the academy)</span>
                  </li>
                </ul>
              </div>

              {errorMsg && <p className="admission-error">{errorMsg}</p>}

              <div className="admission-btn-row">
                <button type="button" className="admission-btn-back" onClick={goBack} data-cursor-hover>
                  ← Back
                </button>
                <button type="submit" className="admission-btn-next" data-cursor-hover>
                  Choose Plan →
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Plan & Payment ── */}
          {step === 3 && (
            <div className="admission-form" id="admission-step3">
              <div className="plans-grid">
                {PLAN_OPTIONS.map(plan => (
                  <button
                    key={plan.months}
                    type="button"
                    className={`plan-card${planMonths === plan.months ? ' selected' : ''}${plan.popular ? ' popular' : ''}`}
                    onClick={() => handlePlanSelect(plan.months)}
                    data-cursor-hover
                  >
                    {plan.popular && <div className="plan-badge">Most Popular</div>}
                    <div className="plan-duration">{plan.label}</div>
                    <div className="plan-price">₹{plan.price.toLocaleString('en-IN')}</div>
                    <div className="plan-per">
                      ₹{Math.round(plan.price / plan.months).toLocaleString('en-IN')} / month
                    </div>
                    {plan.savings && <div className="plan-savings">{plan.savings}</div>}
                  </button>
                ))}
              </div>

              {/* Order summary */}
              {selectedPlan && (
                <div className="order-summary">
                  <div className="order-row">
                    <span className="order-label">Member</span>
                    <span className="order-value">{name}</span>
                  </div>
                  <div className="order-row">
                    <span className="order-label">Discipline</span>
                    <span className="order-value">{DISCIPLINE_OPTIONS.find(d => d.value === discipline)?.label}</span>
                  </div>
                  <div className="order-row">
                    <span className="order-label">Plan</span>
                    <span className="order-value">{selectedPlan.label}</span>
                  </div>
                  <div className="order-divider" />
                  <div className="order-row order-total">
                    <span className="order-label">Total</span>
                    <span className="order-value">₹{selectedPlan.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {status === 'error' && errorMsg && (
                <p className="admission-error">{errorMsg}</p>
              )}

              <div className="admission-btn-row">
                <button type="button" className="admission-btn-back" onClick={goBack} data-cursor-hover>
                  ← Back
                </button>
                <button
                  type="button"
                  className={`admission-btn-pay${status === 'loading' ? ' loading' : ''}`}
                  onClick={handlePayment}
                  disabled={status === 'loading' || !razorpayReady}
                  data-cursor-hover
                >
                  {status === 'loading' ? (
                    <><span className="admission-spinner" /> Processing…</>
                  ) : (
                    <>Pay ₹{selectedPlan?.price.toLocaleString('en-IN')} & Confirm</>
                  )}
                </button>
              </div>

              <p className="admission-secure-note">
                🔒 Payments are 100% secure via Razorpay. UPI, Cards, Net Banking accepted.
              </p>
            </div>
          )}
        </section>

          {/* Already a member? */}
          <div className="admission-renew-hint">
            <a href="/membership" className="admission-renew-link" data-cursor-hover>
              <span className="admission-renew-icon">🔄</span>
              Already taken admission? Renew your membership
              <span className="admission-renew-arrow">→</span>
            </a>
          </div>
      </main>
    </>
  );
}
