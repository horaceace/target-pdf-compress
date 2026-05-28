import type { Metadata } from "next";
import Link from "next/link";
import { HomeToolSwitcher } from "@/components/home-tool-switcher";
import { homepage, toolPageMap } from "@/content/tool-pages";

export const metadata: Metadata = {
  title: "FileSmaller | Free PDF Tools Online",
  description: homepage.description,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "FileSmaller | Free PDF Tools Online",
    description: homepage.description,
    url: "https://filesmaller.space"
  },
  twitter: {
    title: "FileSmaller | Free PDF Tools Online",
    description: homepage.description
  }
};

export default function HomePage() {
  const quickLinks = homepage.quickLinks
    .map((slug) => toolPageMap.get(slug))
    .filter((item) => Boolean(item));
  const coreTools = [
    {
      href: "/compress-pdf",
      title: "Compress PDF",
      copy: "Reduce PDF size with modes for readability, uploads, tight limits, and scanned image-heavy files."
    },
    {
      href: "/merge-pdf",
      title: "Merge PDF",
      copy: "Combine multiple PDF files into one document, reorder them, and download a single merged output."
    },
    {
      href: "/split-pdf",
      title: "Split PDF",
      copy: "Extract page ranges from one PDF, create separate files, and download smaller document parts."
    }
  ];

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

  const documentWorkflows = [
    {
      title: "Merge application files",
      copy: "Combine resume, cover letter, certificates, or supporting documents into one PDF before upload."
    },
    {
      title: "Bundle reports and invoices",
      copy: "Merge separate PDFs into one cleaner file for sending, archiving, or client delivery."
    },
    {
      title: "Compress after merging",
      copy: "Create one document first, then run compression if the final merged PDF is still too large."
    },
    {
      title: "Split before sending",
      copy: "Extract only the pages you need before emailing, uploading, or compressing a smaller document."
    }
  ];

  const mergeUseCases = [
    "For combining resumes and certificates",
    "For sending one PDF instead of many",
    "For building a final upload-ready document"
  ];

  const splitUseCases = [
    "For extracting only the needed pages",
    "For separating forms, signatures, or certificates",
    "For breaking one large PDF into smaller upload-ready files"
  ];

  const mergePaths = [
    {
      href: "/merge-pdf",
      title: "Merge PDF for job applications",
      copy: "Combine resume, cover letter, certificates, and supporting files into one upload-ready PDF."
    },
    {
      href: "/merge-pdf",
      title: "Merge PDF for reports and invoices",
      copy: "Bundle separate client reports, invoices, or statements into one cleaner document."
    },
    {
      href: "/merge-pdf",
      title: "Merge before compressing",
      copy: "Create one final PDF first, then compress it if the combined file is still too large."
    },
    {
      href: "/merge-pdf",
      title: "Reorder PDF pages before export",
      copy: "Adjust the file order before generating a final merged document for sending or storage."
    }
  ];

  const splitPaths = [
    {
      href: "/split-pdf-by-page-ranges",
      title: "Split PDF by page ranges",
      copy: "Use ranges like 1-3, 5, 7-9 to export only the pages you actually need."
    },
    {
      href: "/extract-pdf-pages",
      title: "Extract signature or certificate pages",
      copy: "Pull out just the required pages before uploading or attaching a smaller PDF."
    },
    {
      href: "/split-large-pdf",
      title: "Split before compressing",
      copy: "Separate the large document into smaller parts, then compress only the pages you still need."
    },
    {
      href: "/split-pdf-for-upload",
      title: "Split PDFs for form uploads",
      copy: "Break one multi-page file into smaller upload-ready documents for portals and systems."
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

  const heroStats = [
    { value: "3", label: "core PDF tools" },
    { value: "30+", label: "scenario pages live" },
    { value: "Browser-first", label: "no install workflow" }
  ];

  const workflowColumns = [
    {
      title: "Compression tracks",
      intro: "Start here when the main problem is upload limits, email attachments, or scanned files that need to shrink.",
      links: toolPaths.map((item) => ({ title: item.title, copy: item.copy }))
    },
    {
      title: "Merge workflows",
      intro: "Use merge when you need one final document for applications, invoices, supporting files, or archiving.",
      links: mergePaths.map((item) => ({ title: item.title, copy: item.copy, href: item.href }))
    },
    {
      title: "Split workflows",
      intro: "Use split when the easiest way forward is exporting only the pages that actually matter.",
      links: splitPaths.map((item) => ({ title: item.title, copy: item.copy, href: item.href }))
    }
  ];

  return (
    <main className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy">
            <span className="eyebrow">Browser-first PDF tools</span>
            <h1>Compress, merge, and split PDF files in one workflow</h1>
            <p className="hero__lede">
              Start with PDF compression for uploads and file limits, merge multiple PDFs
              into one clean document, or split one PDF into smaller parts before sending,
              submitting, or compressing again.
            </p>
            <div className="stat-strip">
              {heroStats.map((item) => (
                <div className="stat-chip" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="hero-directory">
              {coreTools.map((tool) => (
                <Link className="directory-link" href={tool.href} key={tool.href}>
                  <span className="directory-link__kicker">Tool</span>
                  <strong>{tool.title}</strong>
                  <span>{tool.copy}</span>
                </Link>
              ))}
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
                    <div className="mock-file-card__label">Tool routing</div>
                    <div className="mock-file-card__name">Choose compress, merge, or split based on the document task.</div>
                    <div className="mock-file-card__size">Start from workflow instead of guessing one tool.</div>
                  </div>
                  <div className="mock-arrow">→</div>
                  <div className="mock-file-card mock-file-card--result">
                    <div className="mock-file-card__label">Output paths</div>
                    <div className="mock-file-card__name">Smaller PDFs, merged bundles, or extracted page-range files.</div>
                    <div className="mock-file-card__size">Built for uploads, attachments, and faster document prep.</div>
                  </div>
                </div>
              </div>
              <div className="hero-mini-grid">
                <div className="hero-mini-card">
                  <strong>Compress</strong>
                  <span>Modes for uploads, scans, and readable office PDFs</span>
                </div>
                <div className="hero-mini-card">
                  <strong>Merge</strong>
                  <span>Reorder files and export one merged document</span>
                </div>
                <div className="hero-mini-card">
                  <strong>Split</strong>
                  <span>Break one large PDF into smaller page-range files</span>
                </div>
              </div>
            </div>
          </div>
          <HomeToolSwitcher />
        </div>
      </section>

      <section className="section-stack">
        <div className="panel section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Start here</span>
              <h2 className="section-title">Choose the tool path, not just a single upload box</h2>
            </div>
            <p className="section-copy">
              The site is structured around the three document actions people actually need: make one PDF smaller, combine many PDFs, or pull out only the pages worth keeping.
            </p>
          </div>
          <div className="card-grid card-grid--wide">
            {coreTools.map((tool) => (
              <Link className="quick-link quick-link--feature" href={tool.href} key={tool.href}>
                <strong>{tool.title}</strong>
                <span>{tool.copy}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Workflows</span>
              <h2 className="section-title">Built around common overseas document tasks</h2>
            </div>
            <p className="section-copy">
              Instead of treating every visit like the same PDF compression job, the homepage breaks workflows into clearer tracks that match uploads, applications, attachments, and partial exports.
            </p>
          </div>
          <div className="workflow-columns">
            {workflowColumns.map((column) => (
              <article className="workflow-column" key={column.title}>
                <strong>{column.title}</strong>
                <p>{column.intro}</p>
                <div className="link-list">
                  {column.links.map((item) =>
                    "href" in item && item.href ? (
                      <Link className="link-list__item" href={item.href} key={item.title}>
                        <span>{item.title}</span>
                        <small>{item.copy}</small>
                      </Link>
                    ) : (
                      <div className="link-list__item" key={item.title}>
                        <span>{item.title}</span>
                        <small>{item.copy}</small>
                      </div>
                    )
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Popular scenarios</span>
              <h2 className="section-title">The highest-intent pages are grouped for speed</h2>
            </div>
            <p className="section-copy">
              These are the pages most likely to match search intent when someone just wants a direct route for email limits, uploads, resumes, or scanned files.
            </p>
          </div>
          <div className="editorial-grid">
            <div className="editorial-card">
              <strong>Compression scenarios</strong>
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
            <div className="editorial-card">
              <strong>Use-case language</strong>
              <div className="pill-list">
                {homepage.useCases.map((item) => (
                  <div className="pill" key={item}>
                    <strong>{item}</strong>
                    <span>Made for shrinking PDFs before upload, email, and document sharing.</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Directory</span>
              <h2 className="section-title">Browse by workflow, page type, or search-style route</h2>
            </div>
            <p className="section-copy">
              This lower section behaves more like a tool directory: fast scanning, lots of entry points, and clear intent labels instead of heavy marketing copy.
            </p>
          </div>
          <div className="editorial-grid editorial-grid--compact">
            <div className="editorial-card">
              <strong>Document workflows</strong>
              <div className="card-grid">
                {documentWorkflows.map((item) => (
                  <article className="pill" key={item.title}>
                    <strong>{item.title}</strong>
                    <span>{item.copy}</span>
                  </article>
                ))}
              </div>
            </div>
            <div className="editorial-card">
              <strong>Compression search paths</strong>
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
          </div>
        </div>

        <div className="panel section">
          <h2 className="section-title">How the tools work</h2>
          <div className="step-list">
            <div className="step-card">
              <b>1</b>
              <div>Choose a core tool: compress one PDF, merge multiple PDFs, or split one PDF into smaller files.</div>
            </div>
            <div className="step-card">
              <b>2</b>
              <div>Upload files, choose the right mode, page ranges, or file order, and run the action.</div>
            </div>
            <div className="step-card">
              <b>3</b>
              <div>Download the result, then reuse another tool if you need to compress, merge, or split again.</div>
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
