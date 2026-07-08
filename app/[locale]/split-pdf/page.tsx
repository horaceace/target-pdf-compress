import type { Metadata } from "next";
import { SplitPdfCard } from "@/components/split-pdf-card";

export const metadata: Metadata = {
  title: "Split PDF Files Online Free",
  description:
    "Split PDF files online free in your browser. Extract page ranges, create separate PDF files, and download them instantly.",
  alternates: {
    canonical: "/split-pdf"
  },
  openGraph: {
    title: "Split PDF Files Online Free",
    description:
      "Split PDF files online free in your browser. Extract page ranges, create separate PDF files, and download them instantly.",
    url: "https://filesmaller.space/split-pdf"
  },
  twitter: {
    title: "Split PDF Files Online Free",
    description:
      "Split PDF files online free in your browser. Extract page ranges, create separate PDF files, and download them instantly."
  }
};

export default function SplitPdfPage() {
  return (
    <main className="container">
      <section className="tool-page__headline">
        <span className="eyebrow">PDF workflow: split pages into smaller files</span>
        <h1>Split PDF files</h1>
        <p>Extract page ranges from one PDF and download separate PDF files in the browser.</p>
      </section>

      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy hero__copy--feature">
            <span className="eyebrow eyebrow--feature">Pull out only the pages you need</span>
            <h2>Split a large PDF into smaller documents</h2>
            <p>
              Upload one PDF, choose page ranges, and export separate files for forms,
              uploads, or follow-up compression.
            </p>
            <div className="hero-points">
              <div className="hero-point">
                <strong>Range-based splitting</strong>
                <span>Use formats like 1-3, 5, 7-9 to define the exact pages you want to export.</span>
              </div>
              <div className="hero-point">
                <strong>Browser-first flow</strong>
                <span>Split the document locally in the browser without a server-side queue for the MVP.</span>
              </div>
              <div className="hero-point">
                <strong>Pairs naturally with compression</strong>
                <span>Extract only the needed pages first, then compress the smaller PDFs if upload limits still matter.</span>
              </div>
            </div>
          </div>
          <SplitPdfCard />
        </div>
      </section>
    </main>
  );
}
