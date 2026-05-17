'use client';

import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function ContactPage() {
  useGSAPScroll();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch(`${API_URL}/api/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setName('');
        setPhone('');
        setMessage('');
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setStatus('error');
      setErrorMessage('Failed to connect to the server.');
    }
  };

  return (
    <main className="main-container" style={{ padding: '8rem 2rem 4rem' }}>
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="section-header reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="title-md gold-shimmer">Contact Us</h2>
          <p className="sub-header" style={{ color: '#888' }}>
            Have questions? Send us a message and we will get back to you.
          </p>
        </div>

        {status === 'success' ? (
          <div className="join-success reveal" id="contact-success" style={{ textAlign: 'center', backgroundColor: '#141414', padding: '3rem', borderRadius: '8px', border: '1px solid #333' }}>
            <div className="join-success-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
            <h3 className="join-success-title" style={{ color: '#d4af37', marginBottom: '0.5rem' }}>Message Sent!</h3>
            <p className="join-success-sub" style={{ color: '#aaa' }}>
              Your inquiry has been received. We will be in touch soon.
            </p>
          </div>
        ) : (
          <form className="cta-form reveal" onSubmit={handleSubmit} style={{ backgroundColor: '#141414', padding: '3rem', borderRadius: '8px', border: '1px solid #333' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                className="form-input"
                type="text"
                placeholder="Your Name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '1rem', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                className="form-input"
                type="tel"
                placeholder="Phone Number (10 digits)"
                required
                pattern="^[6-9]\d{9}$"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ width: '100%', padding: '1rem', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <textarea
                className="form-input"
                placeholder="Your Message (Optional)"
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ width: '100%', padding: '1rem', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '4px', color: '#fff', minHeight: '150px' }}
              />
            </div>

            {status === 'error' && (
              <p style={{ color: '#ff4a4a', marginBottom: '1rem', textAlign: 'center' }}>{errorMessage}</p>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={status === 'loading'}
              style={{ width: '100%', padding: '1rem', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
