import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the privacy policy for this PDF compression tool, including how files may be processed and what information is collected."
};

export default function PrivacyPage() {
  return (
    <main className="container">
      <section className="privacy-stack">
        <div className="privacy-card panel">
          <h1>Privacy Policy</h1>
          <p>
            This first version is a product shell. Before launch, the file handling
            language here must be updated to match the final compression workflow.
          </p>
        </div>
        <div className="privacy-card panel">
          <h2>What data is collected</h2>
          <p>
            We may collect basic analytics information such as page views, device
            type, and interaction events to understand how visitors use the site.
          </p>
        </div>
        <div className="privacy-card panel">
          <h2>How uploaded files are handled</h2>
          <p>
            Uploaded file handling depends on the final compression implementation.
            If compression runs locally in the browser, files may never leave the
            device. If server-side compression is used, this section must be updated
            before public launch.
          </p>
        </div>
        <div className="privacy-card panel">
          <h2>Contact</h2>
          <p>
            Add your production contact email here before deployment so users have a
            way to request privacy or data-related information.
          </p>
        </div>
      </section>
    </main>
  );
}
