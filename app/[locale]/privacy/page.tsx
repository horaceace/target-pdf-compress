import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the privacy policy for FileSmaller, including analytics, browser-side PDF handling, and future processing disclosures."
};

export default function PrivacyPage() {
  return (
    <main className="container">
      <section className="privacy-stack">
        <div className="privacy-card panel">
          <h1>Privacy Policy</h1>
          <p>
            FileSmaller is a browser-first PDF compression website. This page
            explains what information may be collected, how uploaded files are
            handled in the current version, and what will change if the product
            later adds server-side processing.
          </p>
        </div>
        <div className="privacy-card panel">
          <h2>Analytics and usage data</h2>
          <p>
            We may collect basic website analytics such as page views, referrers,
            device type, country-level location, and high-level interaction data
            to understand how visitors use the site and which pages perform best.
          </p>
        </div>
        <div className="privacy-card panel">
          <h2>How PDF files are handled</h2>
          <p>
            In the current version, compression is designed to run in the browser
            whenever possible. That means uploaded PDF files are processed on the
            device instead of being sent to our server for long-term storage. If a
            later version introduces server-side compression, this policy must be
            updated before that workflow is used in production.
          </p>
        </div>
        <div className="privacy-card panel">
          <h2>What we do not claim</h2>
          <p>
            We do not currently claim that every file is processed entirely
            offline, that files are never transmitted under any future workflow,
            or that the service is suitable for regulated or highly sensitive
            document handling without additional review.
          </p>
        </div>
        <div className="privacy-card panel">
          <h2>Cookies and third-party services</h2>
          <p>
            Analytics providers may use cookies or similar identifiers to measure
            site usage. Cloudflare and other infrastructure providers may also
            process request metadata needed to deliver the website securely and
            reliably.
          </p>
        </div>
        <div className="privacy-card panel">
          <h2>Policy updates</h2>
          <p>
            This policy may be updated as the product changes. If file handling,
            storage, login systems, payments, or server-side document processing
            are added, the policy should be revised before those features go live.
          </p>
        </div>
        <div className="privacy-card panel">
          <h2>Contact</h2>
          <p>
            Add a production contact email before public promotion so users have a
            clear way to ask privacy or data-related questions.
          </p>
        </div>
      </section>
    </main>
  );
}
