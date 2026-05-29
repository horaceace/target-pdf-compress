import type { Metadata } from "next";
import { RotatePdfCard } from "@/components/rotate-pdf-card";

export const metadata: Metadata = {
  title: "Rotate PDF Online Free",
  description:
    "Rotate PDF pages online free in your browser. Turn all pages or selected pages 90, 180, or 270 degrees and download the fixed PDF.",
  alternates: {
    canonical: "/rotate-pdf"
  },
  openGraph: {
    title: "Rotate PDF Online Free",
    description:
      "Rotate PDF pages online free in your browser. Turn all pages or selected pages 90, 180, or 270 degrees and download the fixed PDF.",
    url: "https://filesmaller.space/rotate-pdf"
  },
  twitter: {
    title: "Rotate PDF Online Free",
    description:
      "Rotate PDF pages online free in your browser. Turn all pages or selected pages 90, 180, or 270 degrees and download the fixed PDF."
  }
};

export default function RotatePdfPage() {
  return (
    <main className="container">
      <section className="tool-page__headline">
        <span className="eyebrow">PDF workflow: rotate sideways pages</span>
        <h1>Rotate PDF pages</h1>
        <p>Fix sideways or upside-down PDF pages before uploading, sending, or compressing.</p>
      </section>

      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy hero__copy--feature">
            <span className="eyebrow eyebrow--feature">Turn pages upright before export</span>
            <h2>Rotate all pages or selected page ranges</h2>
            <p>
              Upload one PDF, choose a rotation angle, and download a corrected file directly from
              the browser.
            </p>
            <div className="hero-points">
              <div className="hero-point">
                <strong>Rotate 90, 180, or 270 degrees</strong>
                <span>Fix sideways scans, upside-down exports, or mixed-orientation documents.</span>
              </div>
              <div className="hero-point">
                <strong>Optional page ranges</strong>
                <span>Leave the range blank for all pages, or rotate only pages like 1, 3-5.</span>
              </div>
              <div className="hero-point">
                <strong>Fits the PDF workflow</strong>
                <span>Rotate first, then remove, reorder, merge, or compress the final document.</span>
              </div>
            </div>
          </div>
          <RotatePdfCard />
        </div>
      </section>
    </main>
  );
}

