import type { Metadata } from "next";
import { ReorderPdfCard } from "@/components/reorder-pdf-card";

export const metadata: Metadata = {
  title: "Reorder PDF Pages Online Free",
  description:
    "Reorder PDF pages online free in your browser. Type a new page order, rearrange PDF pages, and download the reordered file.",
  alternates: {
    canonical: "/reorder-pdf-pages"
  },
  openGraph: {
    title: "Reorder PDF Pages Online Free",
    description:
      "Reorder PDF pages online free in your browser. Type a new page order, rearrange PDF pages, and download the reordered file.",
    url: "https://filesmaller.space/reorder-pdf-pages"
  },
  twitter: {
    title: "Reorder PDF Pages Online Free",
    description:
      "Reorder PDF pages online free in your browser. Type a new page order, rearrange PDF pages, and download the reordered file."
  }
};

export default function ReorderPdfPagesPage() {
  return (
    <main className="container">
      <section className="tool-page__headline">
        <span className="eyebrow">PDF workflow: rearrange page order</span>
        <h1>Reorder PDF pages</h1>
        <p>Move PDF pages into the order you need before uploading, sending, or compressing.</p>
      </section>

      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy hero__copy--feature">
            <span className="eyebrow eyebrow--feature">Fix page order before export</span>
            <h2>Rearrange PDF pages in the browser</h2>
            <p>
              Upload one PDF, type the output page order, and download a reordered document without
              installing a desktop editor.
            </p>
            <div className="hero-points">
              <div className="hero-point">
                <strong>Text-based page order</strong>
                <span>Use formats like 3,1,2,4-6 to move pages into a new sequence.</span>
              </div>
              <div className="hero-point">
                <strong>Browser-first flow</strong>
                <span>The current version rearranges the PDF locally in your browser.</span>
              </div>
              <div className="hero-point">
                <strong>Works with the tool chain</strong>
                <span>Reorder pages, remove extras, then compress or merge the final document.</span>
              </div>
            </div>
          </div>
          <ReorderPdfCard />
        </div>
      </section>
    </main>
  );
}

