'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-container">
        {/* Footer Top: Brand and Newsletter */}
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">ISA</Link>
            <p className="footer-tagline">
              India's Premier Inline Skating Academy. <br />
              Speed is the language. The rink is the page.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="social-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          <div className="footer-nav">
            <div className="footer-nav-col">
              <h4>Academy</h4>
              <Link href="/about">About Us</Link>
              <Link href="/programs">Programs</Link>
              <Link href="/gallery">Gallery</Link>
              <Link href="/locations">Locations</Link>
            </div>
            <div className="footer-nav-col">
              <h4>Support</h4>
              <Link href="/contact">Contact</Link>
              <Link href="/join">Join Academy</Link>
              <a href="mailto:info@skatingacademy.in">Email Us</a>
              <a href="tel:+917447444707">+91 7447444707</a>
            </div>
            <div className="footer-nav-col">
              <h4>Legal</h4>
              <Link href="/terms">Terms & Conditions</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/refund">Refund Policy</Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom: Copyright and Info */}
        <div className="footer-bottom">
          <div className="footer-copy">
            © 2026 Indian Skating Academy. Built for Speed.
          </div>
          <div className="footer-address">
            ISA HQ, Near NIT Ground, Nagpur, MH 440022
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button (Enhanced) */}
      <a href="https://wa.me/917447444707" className="whatsapp-float-premium" target="_blank" rel="noopener noreferrer">
        <span className="wa-text">Chat with Coach</span>
        <div className="wa-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </div>
      </a>
    </footer>
  );
}
