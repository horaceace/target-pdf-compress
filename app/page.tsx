import type { Metadata } from "next";
import Link from "next/link";
import { homepage, toolPageMap } from "@/content/tool-pages";
import { UploadCard } from "@/components/upload-card";

export const metadata: Metadata = {
  title: homepage.title,
  description: homepage.description,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: homepage.title,
    description: homepage.description,
    url: "https://filesmaller.space"
  },
  twitter: {
    title: homepage.title,
    description: homepage.description
  }
};

export default function HomePage() {
  const quickLinks = homepage.quickLinks
    .map((slug) => toolPageMap.get(slug))
    .filter((item) => Boolean(item));

  const searchPaths = [
    "compress-pdf-online",
    "reduce-pdf-size-online",
    "free-pdf-compressor",
    "compress-pdf-for-upload",
    "compress-pdf-for-email",
    "compress-scanned-pdf",
    "compress-pdf-without-losing-quality",
    "reduce-pdf-size-for-job-application"
  ]
    .map((slug) => toolPageMap.get(slug))
    .filter((item) => Boolean(item));

  const toolPaths = [
    {
      title: "Upload-first compression",
      copy: "Designed for portals and forms where the main goal is simply to make the file small enough to submit."
    },
    {
      title: "Resume-safe shrinking",
      copy: "A better fit for resumes, reports, and office PDFs that still need to stay readable."
    },
    {
      title: "Scanned PDF rescue",
      copy: "Focused on image-heavy documents, where size reduction is harder and browser-side compression has limits."
    }
  ];

  const nextBatch = [
    "reduce-pdf-size-for-attachment",
    "reduce-pdf-size-for-whatsapp",
    "reduce-pdf-size-for-gmail",
    "compress-pdf-to-send-by-email",
    "compress-large-pdf",
    "compress-pdf-under-upload-limit",
    "make-scanned-pdf-smaller",
    "best-pdf-compressor-online"
  ]
    .map((slug) => toolPageMap.get(slug))
    .filter((item) => Boolean(item));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homepage.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <main className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy">
            <span className="eyebrow">Maximum PDF compression</span>
            <h1>{homepage.h1}</h1>
            <p>{homepage.subheading}</p>
            <div className="hero-points">
              <div className="hero-point">
                <strong>Shrink for uploads</strong>
                <span>Built for forms, portals, and email attachments that reject large PDFs.</span>
              </div>
              <div className="hero-point">
                <strong>Browser-side first</strong>
                <span>Process files locally in the browser before you decide whether stronger server-side compression is needed.</span>
              </div>
              <div className="hero-point">
                <strong>Scenario-led pages</strong>
                <span>Use upload, resume, email, and scanned PDF flows instead of guessing one exact size.</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="mock-browser">
                <div className="mock-browser__top">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="mock-browser__body">
                  <div className="mock-file-card">
                    <div className="mock-file-card__label">Original PDF</div>
                    <div className="mock-file-card__name">application-documents.pdf</div>
                    <div className="mock-file-card__size">8.4 MB</div>
                  </div>
                  <div className="mock-arrow">→</div>
                  <div className="mock-file-card mock-file-card--result">
                    <div className="mock-file-card__label">Compressed PDF</div>
                    <div className="mock-file-card__name">application-documents-compressed.pdf</div>
                    <div className="mock-file-card__size">2.1 MB</div>
                  </div>
                </div>
              </div>
              <div className="hero-mini-grid">
                <div className="hero-mini-card">
                  <strong>Upload</strong>
                  <span>Forms, job portals, visa systems</span>
                </div>
                <div className="hero-mini-card">
                  <strong>Modes</strong>
                  <span>Maximum, balanced, readable</span>
                </div>
                <div className="hero-mini-card">
                  <strong>Output</strong>
                  <span>Smaller file and download flow</span>
                </div>
              </div>
            </div>
          </div>
          <UploadCard />
        </div>
      </section>

      <section className="section-stack">
        <div className="panel section">
          <h2 className="section-title">Compression tools</h2>
          <div className="quick-links">
            {quickLinks.map((page) =>
              page ? (
                <Link className="quick-link" href={`/${page.slug}`} key={page.slug}>
                  <strong>{page.h1}</strong>
                  <span>{page.subheading}</span>
                </Link>
              ) : null
            )}
          </div>
        </div>

        <div className="panel section">
          <h2 className="section-title">How people use this tool</h2>
          <div className="pill-list">
            {homepage.useCases.map((item) => (
              <div className="pill" key={item}>
                <strong>{item}</strong>
                <span>Made for shrinking PDFs before upload, email, and document sharing.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel section">
          <h2 className="section-title">Tool paths</h2>
          <div className="card-grid">
            {toolPaths.map((item) => (
              <article className="pill" key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.copy}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="panel section">
          <h2 className="section-title">Search paths</h2>
          <div className="search-grid">
            {searchPaths.map((item) => (
              item ? (
                <Link className="search-chip" href={`/${item.slug}`} key={item.slug}>
                  {item.h1}
                </Link>
              ) : null
            ))}
          </div>
        </div>

        <div className="panel section">
          <h2 className="section-title">How the current version works</h2>
          <div className="step-list">
            <div className="step-card">
              <b>1</b>
              <div>Upload a PDF in the browser.</div>
            </div>
            <div className="step-card">
              <b>2</b>
              <div>Pick a compression mode based on your use case.</div>
            </div>
            <div className="step-card">
              <b>3</b>
              <div>Rewrite and download a smaller PDF locally.</div>
            </div>
          </div>
        </div>

        <div className="panel section">
          <h2 className="section-title">Frequently asked questions</h2>
          <div className="faq-grid">
            {homepage.faq.map((item) => (
              <article className="faq-item" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel section">
          <h2 className="section-title">More compression pages</h2>
          <div className="search-grid">
            {nextBatch.map((item) => (
              item ? (
                <Link
                  className="search-chip search-chip--muted"
                  href={`/${item.slug}`}
                  key={item.slug}
                >
                  {item.h1}
                </Link>
              ) : null
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
