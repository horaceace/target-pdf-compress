import type { Metadata } from "next";
import { PdfToJpgCard } from "@/components/pdf-to-jpg-card";

export const metadata: Metadata = {
  title: "PDF to JPG Online Free",
  description:
    "Convert PDF to JPG online free in your browser. Export one JPG per page for previews, uploads, sharing, and content workflows.",
  alternates: {
    canonical: "/pdf-to-jpg"
  },
  openGraph: {
    title: "PDF to JPG Online Free",
    description:
      "Convert PDF to JPG online free in your browser. Export one JPG per page for previews, uploads, sharing, and content workflows.",
    url: "https://filesmaller.space/pdf-to-jpg"
  },
  twitter: {
    title: "PDF to JPG Online Free",
    description:
      "Convert PDF to JPG online free in your browser. Export one JPG per page for previews, uploads, sharing, and content workflows."
  }
};

export default function PdfToJpgPage() {
  return (
    <main className="container">
      <section className="tool-page__headline">
        <span className="eyebrow">PDF workflow: export pages as images</span>
        <h1>PDF to JPG</h1>
        <p>Upload one PDF, convert each page to a JPG image, and download the output files in the browser.</p>
      </section>

      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy hero__copy--feature">
            <span className="eyebrow eyebrow--feature">Export one JPG image per PDF page</span>
            <h2>Turn PDF pages into shareable image files</h2>
            <p>
              Upload a PDF, choose the JPG quality level, and download separate page images
              for previews, CMS uploads, or content reuse.
            </p>
            <div className="hero-points">
              <div className="hero-point">
                <strong>Page-by-page export</strong>
                <span>Each PDF page becomes a separate JPG file for reuse outside the PDF format.</span>
              </div>
              <div className="hero-point">
                <strong>Browser-first conversion</strong>
                <span>Render the PDF locally in the browser without adding a server render queue to the MVP.</span>
              </div>
              <div className="hero-point">
                <strong>Useful bridge tool</strong>
                <span>Pairs naturally with JPG to PDF for document-image round trips and quick visual extraction.</span>
              </div>
            </div>
          </div>
          <PdfToJpgCard />
        </div>
      </section>
    </main>
  );
}
