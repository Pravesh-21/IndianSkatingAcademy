'use client';

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <h1 className="reveal">Privacy <span className="text-glow">Policy</span></h1>
        <p className="reveal">Last Updated: May 2026</p>
      </section>

      <section className="legal-content reveal">
        <div className="legal-card">
          <h2>1. Data Collection</h2>
          <p>
            We collect personal information such as name, contact details, and age during the enrollment process to provide a tailored training experience and maintain academy records.
          </p>

          <h2>2. Use of Information</h2>
          <p>
            Your data is used to manage memberships, communicate schedule updates, and share information about upcoming competitions or academy events.
          </p>

          <h2>3. Data Protection</h2>
          <p>
            We implement industry-standard security measures to protect your personal data from unauthorized access, alteration, or disclosure.
          </p>

          <h2>4. Third-Party Sharing</h2>
          <p>
            ISA does not sell or lease your personal information to third parties. Data may only be shared with sports governing bodies for competition registrations with your consent.
          </p>

          <h2>5. Cookies</h2>
          <p>
            Our website uses cookies to enhance user experience and analyze site traffic. You can manage cookie preferences through your browser settings.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            You have the right to access, correct, or request the deletion of your personal data stored with ISA at any time.
          </p>
        </div>
      </section>
    </main>
  );
}
