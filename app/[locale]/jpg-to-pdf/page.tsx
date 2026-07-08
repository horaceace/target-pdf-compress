import type { Metadata } from "next";
import { JpgToPdfCard } from "@/components/jpg-to-pdf-card";

export const metadata: Metadata = {
  title: "JPG to PDF Online Free",
  description:
    "Convert JPG to PDF online free in your browser. Combine multiple JPG or PNG files into one PDF document for sharing and submission.",
  alternates: {
    canonical: "/jpg-to-pdf"
  },
  openGraph: {
    title: "JPG to PDF Online Free",
    description:
      "Convert JPG to PDF online free in your browser. Combine multiple JPG or PNG files into one PDF document for sharing and submission.",
    url: "https://filesmaller.space/jpg-to-pdf"
  },
  twitter: {
    title: "JPG to PDF Online Free",
    description:
      "Convert JPG to PDF online free in your browser. Combine multiple JPG or PNG files into one PDF document for sharing and submission."
  }
};

export default function JpgToPdfPage() {
  return (
    <main className="container">
      <section className="tool-page__headline">
        <span className="eyebrow">Image workflow: build one PDF from many files</span>
        <h1>JPG to PDF</h1>
        <p>Upload JPG or PNG files, set the order, and export one combined PDF directly in the browser.</p>
      </section>

      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy hero__copy--feature">
            <span className="eyebrow eyebrow--feature">Turn image batches into one PDF</span>
            <h2>Combine screenshots, scans, and photos into a single document</h2>
            <p>
              Upload the images in the order you want, create one PDF, and then compress
              that document later if the final file still needs to shrink.
            </p>
            <div className="hero-points">
              <div className="hero-point">
                <strong>Multi-image ordering</strong>
                <span>Reorder images before export so the final PDF matches the reading flow you want.</span>
              </div>
              <div className="hero-point">
                <strong>Browser-first conversion</strong>
                <span>Create the PDF locally in the browser without adding a server-side image queue to the MVP.</span>
              </div>
              <div className="hero-point">
                <strong>Strong workflow fit</strong>
                <span>Useful for receipts, mobile screenshots, scans, and image bundles that need to become one PDF file.</span>
              </div>
            </div>
          </div>
          <JpgToPdfCard />
        </div>
      </section>
    </main>
  );
}
