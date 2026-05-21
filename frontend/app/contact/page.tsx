'use client';

import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function ContactPage() {
  const containerRef = useGSAPScroll();
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
    <main className="page-wrapper" ref={containerRef as React.RefObject<HTMLElement>}>
      {/* Page Hero */}
      <section className="page-hero">
        <p className="section-label reveal">Get in Touch</p>
        <h2 className="section-heading reveal">
          Contact <span className="accent">Us</span>
        </h2>
        <p className="page-hero-subtitle reveal">
          Have questions? Send us a message and we&apos;ll get back to you.
        </p>
      </section>

      {/* Contact Form */}
      <section className="cta-section section" id="contact" style={{ marginTop: '-80px' }}>
        {status === 'success' ? (
          <div className="join-success reveal" id="contact-success">
            <div className="join-success-icon">✉️</div>
            <h3 className="join-success-title">Message Sent!</h3>
            <p className="join-success-sub">
              Your inquiry has been received. We&apos;ll be in touch soon.
            </p>
          </div>
        ) : (
          <form className="cta-form reveal" onSubmit={handleSubmit} id="contact-form">
            <input
              className="form-input full-width"
              type="text"
              placeholder="Your Name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              className="form-input full-width"
              type="tel"
              placeholder="Phone Number (10 digits)"
              required
              pattern="^[6-9]\d{9}$"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <textarea
              className="form-input full-width"
              placeholder="Your Message (Optional)"
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ minHeight: '140px', resize: 'vertical' }}
            />

            {status === 'error' && (
              <p className="join-error full-width">{errorMessage}</p>
            )}

            <button
              type="submit"
              className="btn-submit"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Sending...' : '→ Send Message'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
