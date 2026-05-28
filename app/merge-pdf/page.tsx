import type { Metadata } from "next";
import { MergePdfCard } from "@/components/merge-pdf-card";

export const metadata: Metadata = {
  title: "Merge PDF Files Online",
  description:
    "Merge PDF files online in your browser. Combine multiple PDF documents into one merged file and download it instantly.",
  alternates: {
    canonical: "/merge-pdf"
  },
  openGraph: {
    title: "Merge PDF Files Online",
    description:
      "Merge PDF files online in your browser. Combine multiple PDF documents into one merged file and download it instantly.",
    url: "https://filesmaller.space/merge-pdf"
  },
  twitter: {
    title: "Merge PDF Files Online",
    description:
      "Merge PDF files online in your browser. Combine multiple PDF documents into one merged file and download it instantly."
  }
};

export default function MergePdfPage() {
  return (
    <main className="container">
      <section className="tool-page__headline">
        <span className="eyebrow">PDF workflow: combine files into one</span>
        <h1>Merge PDF files</h1>
        <p>Combine multiple PDF documents into one merged file before download.</p>
      </section>

      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy hero__copy--feature">
            <span className="eyebrow eyebrow--feature">Merge multiple documents into one</span>
            <h2>Build one merged PDF from multiple files</h2>
            <p>
              Upload PDF files, set the right order, and download one combined
              document in the browser.
            </p>
            <div className="hero-points">
              <div className="hero-point">
                <strong>Simple file order</strong>
                <span>Move files up or down before creating the final merged document.</span>
              </div>
              <div className="hero-point">
                <strong>Browser-first flow</strong>
                <span>Combine documents without adding a server-side document queue to the MVP.</span>
              </div>
              <div className="hero-point">
                <strong>Good first matrix tool</strong>
                <span>Pairs naturally with compression, split, and later PDF conversion tools.</span>
              </div>
            </div>
          </div>
          <MergePdfCard />
        </div>
      </section>
    </main>
  );
}
