import type { Metadata } from "next";
import { RemovePdfPagesCard } from "@/components/remove-pdf-pages-card";

export const metadata: Metadata = {
  title: "Remove PDF Pages Online Free",
  description:
    "Remove pages from a PDF online free in your browser. Delete blank, duplicate, or unwanted pages and download a cleaned PDF.",
  alternates: {
    canonical: "/remove-pdf-pages"
  },
  openGraph: {
    title: "Remove PDF Pages Online Free",
    description:
      "Remove pages from a PDF online free in your browser. Delete blank, duplicate, or unwanted pages and download a cleaned PDF.",
    url: "https://filesmaller.space/remove-pdf-pages"
  },
  twitter: {
    title: "Remove PDF Pages Online Free",
    description:
      "Remove pages from a PDF online free in your browser. Delete blank, duplicate, or unwanted pages and download a cleaned PDF."
  }
};

export default function RemovePdfPagesPage() {
  return (
    <main className="container">
      <section className="tool-page__headline">
        <span className="eyebrow">PDF workflow: delete unwanted pages</span>
        <h1>Remove PDF pages</h1>
        <p>Delete blank, duplicate, or unnecessary PDF pages and download a cleaned document.</p>
      </section>

      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy hero__copy--feature">
            <span className="eyebrow eyebrow--feature">Keep only the pages that matter</span>
            <h2>Remove pages before uploading or sending a PDF</h2>
            <p>
              Upload one PDF, enter the pages you want to remove, and export a cleaner file
              directly in the browser.
            </p>
            <div className="hero-points">
              <div className="hero-point">
                <strong>Delete exact pages</strong>
                <span>Use formats like 2, 4-6, 9 to remove single pages or page ranges.</span>
              </div>
              <div className="hero-point">
                <strong>Browser-first editing</strong>
                <span>The current flow edits the PDF locally without a server-side document queue.</span>
              </div>
              <div className="hero-point">
                <strong>Cleaner upload files</strong>
                <span>Remove cover sheets, blanks, or duplicate pages before compressing or submitting.</span>
              </div>
            </div>
          </div>
          <RemovePdfPagesCard />
        </div>
      </section>
    </main>
  );
}

