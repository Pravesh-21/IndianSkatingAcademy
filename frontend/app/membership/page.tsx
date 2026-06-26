'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '';

type MemberStatus = 'active' | 'expired' | 'suspended' | 'pending';
type FetchStatus = 'idle' | 'loading' | 'found' | 'not_found' | 'error';
type RenewStatus = 'idle' | 'loading' | 'success' | 'error';

interface MemberData {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  discipline: string;
  blood_group: string | null;
  guardian_name: string | null;
  emergency_contact: string | null;
  status: MemberStatus;
  member_since: string;
}

interface MembershipData {
  id: number;
  plan_months: number;
  start_date: string;
  expiry_date: string;
  days_left: number;
}

const PLAN_OPTIONS = [
  { months: 1,  label: '1 Month',  price: 599  },
  { months: 3,  label: '3 Months', price: 1499, popular: true },
  { months: 6,  label: '6 Months', price: 2499 },
  { months: 12, label: '1 Year',   price: 3999 },
];

const DISCIPLINE_LABELS: Record<string, string> = {
  speed:      '⚡ Speed Skating',
  artistic:   '🌀 Artistic Freestyle',
  slalom:     '🏁 Slalom',
  aggressive: '🔥 Aggressive / Stunt',
};

const STATUS_CONFIG: Record<MemberStatus, { label: string; color: string; icon: string }> = {
  active:    { label: 'Active',    color: 'var(--green)',  icon: '✅' },
  expired:   { label: 'Expired',   color: 'var(--orange)', icon: '⏰' },
  suspended: { label: 'Suspended', color: '#FF3B3B',       icon: '🚫' },
  pending:   { label: 'Pending',   color: 'var(--chrome)', icon: '⏳' },
};

declare global {
  interface Window { Razorpay: any; }
}

export default function MembershipPage() {
  const [phone, setPhone]               = useState('');
  const [fetchStatus, setFetchStatus]   = useState<FetchStatus>('idle');
  const [fetchError, setFetchError]     = useState('');
  const [member, setMember]             = useState<MemberData | null>(null);
  const [membership, setMembership]     = useState<MembershipData | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  // Renewal state
  const [renewPlan, setRenewPlan]       = useState(3);
  const [renewStatus, setRenewStatus]   = useState<RenewStatus>('idle');
  const [renewError, setRenewError]     = useState('');
  const [newExpiry, setNewExpiry]       = useState('');

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setFetchError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setFetchStatus('loading');
    setFetchError('');
    setMember(null);
    setMembership(null);

    try {
      const res  = await fetch(`${API_URL}/api/membership/status/${phone}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setMember(data.member);
        setMembership(data.membership);
        setFetchStatus('found');
      } else if (res.status === 404) {
        setFetchStatus('not_found');
      } else {
        setFetchStatus('error');
        setFetchError(data.message ?? 'Something went wrong.');
      }
    } catch {
      setFetchStatus('error');
      setFetchError('Cannot reach the server. Please check your connection.');
    }
  }

  async function handleRenew() {
    if (renewStatus === 'loading' || !member) return;
    setRenewStatus('loading');
    setRenewError('');

    try {
      const res  = await fetch(`${API_URL}/api/membership/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: member.phone, plan_months: renewPlan }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setRenewStatus('error');
        setRenewError(data.message ?? 'Renewal failed. Please try again.');
        return;
      }

      const { order_id, amount, membership_id, new_expiry } = data;

      const options = {
        key:         RAZORPAY_KEY_ID,
        amount,
        currency:    'INR',
        name:        'Indian Skating Academy',
        description: `Membership Renewal — ${PLAN_OPTIONS.find(p => p.months === renewPlan)?.label}`,
        order_id,
        prefill: {
          name:    member.name,
          email:   member.email,
          contact: member.phone,
        },
        theme: { color: '#00C2FF' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verRes  = await fetch(`${API_URL}/api/membership/verify-payment`, {
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
            setNewExpiry(verData.expiry_date ?? new_expiry);
            setRenewStatus('success');
            // Refresh member data
            setMember(prev => prev ? { ...prev, status: 'active' } : prev);
          } else {
            setRenewStatus('error');
            setRenewError(verData.message ?? 'Payment received but activation failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => setRenewStatus('idle'),
        },
      };

      if (!window.Razorpay) {
        setRenewStatus('error');
        setRenewError('Payment gateway not loaded. Please refresh.');
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
      setRenewStatus('idle');
    } catch (err) {
      console.error('[Membership] Renew error:', err);
      setRenewStatus('error');
      setRenewError('Cannot reach the server. Please try again.');
    }
  }

  const statusConf = member ? STATUS_CONFIG[member.status] : null;
  const canRenew   = member && (member.status === 'active' || member.status === 'expired');

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
      />

      <main className="page-wrapper">
        <section className="membership-section">
          {/* Header */}
          <div className="membership-header">
            <div className="hero-badge" style={{ marginBottom: '20px' }}>
              <span className="hero-badge-dot" />
              Member Portal
            </div>
            <h1 className="membership-title">Your Membership</h1>
            <p className="membership-subtitle">
              Check your status, view expiry date, and renew your membership.
            </p>
          </div>

          {/* Phone lookup */}
          {fetchStatus !== 'found' && (
            <form className="membership-lookup-form" onSubmit={handleLookup} id="membership-lookup">
              <div className="membership-lookup-input-wrap">
                <span className="membership-lookup-prefix">+91</span>
                <input
                  id="membership-phone"
                  className="membership-lookup-input"
                  type="tel"
                  placeholder="Enter your 10-digit mobile number"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setFetchError(''); setFetchStatus('idle'); }}
                  required
                />
              </div>

              {fetchError && <p className="membership-error">{fetchError}</p>}

              <button
                type="submit"
                className={`membership-lookup-btn${fetchStatus === 'loading' ? ' loading' : ''}`}
                disabled={fetchStatus === 'loading'}
                data-cursor-hover
              >
                {fetchStatus === 'loading' ? (
                  <><span className="admission-spinner" /> Searching…</>
                ) : (
                  'Check Status →'
                )}
              </button>

              {fetchStatus === 'not_found' && (
                <div className="membership-not-found">
                  <p>No membership found for this number.</p>
                  <Link href="/admission" className="admission-link" data-cursor-hover>
                    Register via Admission Form →
                  </Link>
                </div>
              )}
            </form>
          )}

          {/* Member found — profile card */}
          {fetchStatus === 'found' && member && (
            <div className="membership-profile">

              {/* Status Card */}
              <div className={`membership-status-card status-${member.status}`}>
                <div className="membership-status-top">
                  <div className="membership-avatar">
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="membership-info">
                    <h2 className="membership-name">{member.name}</h2>
                    <p className="membership-phone-display">+91 {member.phone}</p>
                    <p className="membership-discipline">{DISCIPLINE_LABELS[member.discipline] ?? member.discipline}</p>
                  </div>
                  <div className="membership-status-badge" style={{ color: statusConf?.color }}>
                    <span className="membership-status-icon">{statusConf?.icon}</span>
                    <span className="membership-status-label">{statusConf?.label}</span>
                  </div>
                </div>

                {/* Membership Info */}
                {membership ? (
                  <div className="membership-dates">
                    <div className="membership-date-item">
                      <span className="membership-date-label">Started</span>
                      <span className="membership-date-value">{formatDate(membership.start_date)}</span>
                    </div>
                    <div className="membership-date-divider" />
                    <div className="membership-date-item">
                      <span className="membership-date-label">Expires</span>
                      <span className="membership-date-value">{formatDate(membership.expiry_date)}</span>
                    </div>
                    <div className="membership-date-divider" />
                    <div className="membership-date-item">
                      <span className="membership-date-label">
                        {membership.days_left > 0 ? 'Days Left' : 'Overdue'}
                      </span>
                      <span
                        className="membership-date-value"
                        style={{ color: membership.days_left > 7 ? 'var(--green)' : membership.days_left > 0 ? 'var(--orange)' : '#FF3B3B' }}
                      >
                        {membership.days_left > 0 ? membership.days_left : Math.abs(membership.days_left)} days
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="membership-no-active">No active membership found.</p>
                )}

                <div className="membership-meta">
                  <span>Member since {formatDate(member.member_since)}</span>
                  {member.blood_group && <span>Blood: {member.blood_group}</span>}
                </div>
              </div>

              {/* Suspended state */}
              {member.status === 'suspended' && (
                <div className="membership-suspended-card">
                  <span className="membership-suspended-icon">🚫</span>
                  <h3>Membership Suspended</h3>
                  <p>
                    Your membership was inactive for over 2 months and has been suspended.
                    To continue skating with ISA, please re-register via the Admission form.
                  </p>
                  <Link href="/admission" className="membership-readmit-btn" data-cursor-hover>
                    Re-Apply for Admission →
                  </Link>
                </div>
              )}

              {/* Renewal success */}
              {renewStatus === 'success' && (
                <div className="membership-renew-success">
                  <span>🎉</span>
                  <div>
                    <strong>Membership Renewed!</strong>
                    {newExpiry && (
                      <p>Your new expiry date is <strong>{formatDate(newExpiry)}</strong>.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Renewal section */}
              {canRenew && renewStatus !== 'success' && (
                <div className="membership-renew-section">
                  <h3 className="membership-renew-title">
                    {member.status === 'expired' ? 'Renew Your Membership' : 'Extend Your Membership'}
                  </h3>
                  {member.status === 'expired' && membership && (
                    <p className="membership-renew-note">
                      ℹ️ Your renewal will extend from your original expiry date ({formatDate(membership.expiry_date)}), not today.
                    </p>
                  )}

                  <div className="renew-plans-grid">
                    {PLAN_OPTIONS.map(plan => (
                      <button
                        key={plan.months}
                        type="button"
                        className={`renew-plan-card${renewPlan === plan.months ? ' selected' : ''}${(plan as any).popular ? ' popular' : ''}`}
                        onClick={() => { setRenewPlan(plan.months); setRenewError(''); }}
                        data-cursor-hover
                      >
                        {(plan as any).popular && <div className="plan-badge">Popular</div>}
                        <span className="renew-plan-label">{plan.label}</span>
                        <span className="renew-plan-price">₹{plan.price.toLocaleString('en-IN')}</span>
                      </button>
                    ))}
                  </div>

                  {renewError && <p className="membership-error">{renewError}</p>}

                  <button
                    type="button"
                    className={`membership-renew-btn${renewStatus === 'loading' ? ' loading' : ''}`}
                    onClick={handleRenew}
                    disabled={renewStatus === 'loading' || !razorpayReady}
                    data-cursor-hover
                  >
                    {renewStatus === 'loading' ? (
                      <><span className="admission-spinner" /> Processing…</>
                    ) : (
                      <>Pay ₹{PLAN_OPTIONS.find(p => p.months === renewPlan)?.price.toLocaleString('en-IN')} & Renew</>
                    )}
                  </button>

                  <p className="admission-secure-note">
                    🔒 Secure payment via Razorpay. UPI, Cards, Net Banking accepted.
                  </p>
                </div>
              )}

              {/* Lookup different number */}
              <button
                type="button"
                className="membership-lookup-again"
                onClick={() => { setFetchStatus('idle'); setMember(null); setMembership(null); setPhone(''); setRenewStatus('idle'); setNewExpiry(''); }}
                data-cursor-hover
              >
                ← Look up a different number
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
