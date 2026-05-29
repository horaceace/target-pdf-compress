import type { Metadata } from "next";
import { UploadCard } from "@/components/upload-card";

export const metadata: Metadata = {
  title: "Compress PDF Online Free",
  description:
    "Compress PDF online free in your browser with modes for readability, uploads, scanned documents, and tighter file size limits.",
  alternates: {
    canonical: "/compress-pdf"
  },
  openGraph: {
    title: "Compress PDF Online Free",
    description:
      "Compress PDF online free in your browser with modes for readability, uploads, scanned documents, and tighter file size limits.",
    url: "https://filesmaller.space/compress-pdf"
  },
  twitter: {
    title: "Compress PDF Online Free",
    description:
      "Compress PDF online free in your browser with modes for readability, uploads, scanned documents, and tighter file size limits."
  }
};

export default function CompressPdfPage() {
  return (
    <main className="container">
      <section className="tool-page__headline">
        <span className="eyebrow">PDF workflow: compress files</span>
        <h1>Compress PDF files</h1>
        <p>Upload one or more PDF files, choose a compression mode, and download smaller results.</p>
      </section>

      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy hero__copy--feature">
            <span className="eyebrow eyebrow--feature">Compression modes for real file limits</span>
            <h2>Choose the right compression mode</h2>
            <p>
              Pick the mode that fits your file: readability, uploads, tighter
              size limits, or scanned image-heavy documents.
            </p>
            <div className="hero-points">
              <div className="hero-point">
                <strong>Light and balanced</strong>
                <span>Best for contracts, resumes, and office PDFs that still need to stay clean and readable.</span>
              </div>
              <div className="hero-point">
                <strong>Strong and extreme</strong>
                <span>Best for upload portals, attachments, and tighter document size limits.</span>
              </div>
              <div className="hero-point">
                <strong>Scanned PDF mode</strong>
                <span>Best for image-heavy scans, proofs, and documents that resist lighter compression.</span>
              </div>
            </div>
          </div>
          <UploadCard copy="Compress PDF in your browser" heading="Compress PDF files" />
        </div>
      </section>
    </main>
  );
}
