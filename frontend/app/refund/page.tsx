'use client';

export default function Refund() {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <h1>Refund <span className="text-glow">Policy</span></h1>
        <p>Last Updated: May 2026</p>
      </section>

      <section className="legal-content">
        <div className="legal-card">
          <h2>1. Membership Fees</h2>
          <p>
            Initial enrollment fees and monthly training fees are generally non-refundable once the training cycle has commenced.
          </p>

          <h2>2. Eligibility for Refund</h2>
          <div className="legal-section">
            <p>Refund requests may be considered under the following circumstances:</p>
            <ul>
              <li>Medical reasons (with valid certification) preventing the athlete from skating for more than 30 days.</li>
              <li>Relocation to a city where ISA does not have a presence.</li>
              <li>Cancellation of a program or event by the academy.</li>
            </ul>
          </div>

          <h2>3. Request Process</h2>
          <p>
            All refund requests must be submitted in writing to the Academy Manager. Approved refunds will be processed within 15 working days.
          </p>

          <h2>4. Competition Fees</h2>
          <p>
            Fees paid for third-party competitions or equipment orders are subject to the respective organizer's or vendor's refund policies.
          </p>
        </div>
      </section>
    </main>
  );
}
