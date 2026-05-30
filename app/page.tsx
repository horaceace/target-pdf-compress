import type { Metadata } from "next";
import { FaqAccordion } from "@/components/faq-accordion";
import { HomeToolSwitcher } from "@/components/home-tool-switcher";
import { TrackedLink } from "@/components/tracked-link";
import { homepage, toolPageMap } from "@/content/tool-pages";

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
  const popularCompressionPages = [
    "compress-pdf-online",
    "compress-pdf-to-1mb",
    "compress-pdf-for-upload",
    "compress-pdf-for-email",
    "compress-scanned-pdf",
    "compress-pdf-without-losing-quality",
    "reduce-pdf-size-for-job-application",
    "compress-large-pdf"
  ]
    .map((slug) => toolPageMap.get(slug))
    .filter((item) => Boolean(item));
  const pdfToJpgPages = [
    "pdf-to-jpg-online",
    "convert-pdf-pages-to-jpg",
    "pdf-page-to-jpg-for-preview",
    "extract-images-from-pdf-pages"
  ]
    .map((slug) => toolPageMap.get(slug))
    .filter((item) => Boolean(item));
  const jpgToPdfPages = [
    "jpg-to-pdf-online",
    "convert-images-to-pdf",
    "combine-jpg-into-one-pdf",
    "images-to-pdf-for-upload"
  ]
    .map((slug) => toolPageMap.get(slug))
    .filter((item) => Boolean(item));
  const editPages = [
    "rotate-pdf-online",
    "rotate-pdf-pages",
    "remove-pages-from-pdf",
    "delete-pdf-pages",
    "reorder-pdf-pages-online",
    "rearrange-pdf-pages"
  ]
    .map((slug) => toolPageMap.get(slug))
    .filter((item) => Boolean(item));
  const searchEntryPages = [...quickLinks, ...pdfToJpgPages, ...jpgToPdfPages, ...editPages].filter(
    (item, index, pages) => item && pages.findIndex((page) => page?.slug === item.slug) === index
  );

  const coreTools = [
    {
      href: "/compress-pdf",
      title: "Compress PDF",
      copy: "Reduce PDF size with stronger modes for uploads, file limits, and scan-heavy documents."
    },
    {
      href: "/merge-pdf",
      title: "Merge PDF",
      copy: "Combine multiple PDF files into one document and export a single merged output."
    },
    {
      href: "/split-pdf",
      title: "Split PDF",
      copy: "Extract page ranges into smaller PDF parts for uploads, sharing, and follow-up compression."
    },
    {
      href: "/rotate-pdf",
      title: "Rotate PDF",
      copy: "Fix sideways or upside-down PDF pages before uploading, sending, or merging."
    },
    {
      href: "/remove-pdf-pages",
      title: "Remove PDF pages",
      copy: "Delete blank, duplicate, or unnecessary pages before uploading or sharing a PDF."
    },
    {
      href: "/reorder-pdf-pages",
      title: "Reorder PDF pages",
      copy: "Move pages into the correct sequence before sending, merging, or compressing."
    },
    {
      href: "/pdf-to-jpg",
      title: "PDF to JPG",
      copy: "Turn PDF pages into JPG images for previews, uploads, and quick reuse."
    },
    {
      href: "/jpg-to-pdf",
      title: "JPG to PDF",
      copy: "Combine JPG or PNG images into one PDF for screenshots, receipts, and scanned bundles."
    }
  ];

  const featuredTool = coreTools[0];
  const secondaryTools = coreTools.slice(1);

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
    },
    {
      title: "Fix sideways scans",
      copy: "Rotate all pages or selected page ranges before submitting scanned PDFs."
    },
    {
      title: "Remove unwanted pages",
      copy: "Delete blank pages, duplicate covers, or extra instructions before uploading a cleaner PDF."
    },
    {
      title: "Reorder application packets",
      copy: "Move forms, resumes, certificates, or receipts into the right sequence before export."
    },
    {
      title: "Export pages as images",
      copy: "Convert PDF pages to JPG files when a CMS, design flow, or preview system needs images instead of another PDF."
    },
    {
      title: "Build PDFs from screenshots",
      copy: "Turn JPG or PNG files into one PDF for receipts, scans, forms, and mobile document bundles."
    }
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
    },
    {
      href: "/rotate-pdf",
      title: "Rotate PDF pages",
      copy: "Fix sideways pages before removing, reordering, merging, or compressing the final PDF."
    },
    {
      href: "/remove-pdf-pages",
      title: "Remove pages before upload",
      copy: "Delete unnecessary pages first, then compress or submit a cleaner PDF."
    },
    {
      href: "/reorder-pdf-pages",
      title: "Reorder pages before export",
      copy: "Fix page sequence before sharing, merging, or compressing the final PDF."
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

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FileSmaller",
    url: "https://filesmaller.space",
    description: homepage.description
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: coreTools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://filesmaller.space${tool.href}`,
      name: tool.title,
      description: tool.copy
    }))
  };

  const heroStats = [
    { value: String(coreTools.length), label: "core tools live" },
    { value: "50+", label: "scenario pages live" },
    { value: "Browser-first", label: "no install workflow" }
  ];

  const workflowColumns = [
    {
      title: "Compression tracks",
      intro: "Start here when the main problem is upload limits, email attachments, or scanned files that need to shrink.",
      links: [
        ...toolPaths.map((item) => ({ title: item.title, copy: item.copy })),
        {
          title: "More compression pages",
          copy: "See long-tail pages for uploads, resumes, scanned PDFs, and attachment limits.",
          href: "/compress-pdf-online"
        }
      ]
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
    },
    {
      title: "Conversion workflows",
      intro: "Use conversion when you need JPG images from PDF pages or one PDF from multiple screenshots or scans.",
      links: [
        {
          title: "PDF to JPG online",
          copy: "Export one JPG per PDF page for previews and quick reuse.",
          href: "/pdf-to-jpg-online"
        },
        {
          title: "JPG to PDF online",
          copy: "Combine screenshots, receipts, or scans into one PDF.",
          href: "/jpg-to-pdf-online"
        },
        {
          title: "Convert PDF pages to JPG",
          copy: "Useful when a page image is needed instead of another PDF.",
          href: "/convert-pdf-pages-to-jpg"
        },
        {
          title: "Images to PDF for upload",
          copy: "Build one upload-ready PDF from multiple image files.",
          href: "/images-to-pdf-for-upload"
        }
      ]
    }
  ];

  return (
    <main className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy">
            <span className="eyebrow">Browser-first PDF tools</span>
            <h1>{homepage.h1}</h1>
            <p className="hero__lede">{homepage.subheading}</p>
            <div className="stat-strip">
              {heroStats.map((item) => (
                <div className="stat-chip" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="hero-toolset">
              <TrackedLink
                className="hero-feature-tool"
                eventParams={{
                  source: "home_hero_feature",
                  tool: featuredTool.href.replace("/", ""),
                  label: featuredTool.title
                }}
                href={featuredTool.href}
              >
                <span className="directory-link__kicker">Start here</span>
                <strong>{featuredTool.title}</strong>
                <span>{featuredTool.copy}</span>
              </TrackedLink>
              <div className="hero-tool-list">
                {secondaryTools.map((tool) => (
                  <TrackedLink
                    className="hero-tool-pill"
                    eventParams={{
                      source: "home_hero_tool_list",
                      tool: tool.href.replace("/", ""),
                      label: tool.title
                    }}
                    href={tool.href}
                    key={tool.href}
                  >
                    <strong>{tool.title}</strong>
                    <span>{tool.copy}</span>
                  </TrackedLink>
                ))}
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
                    <div className="mock-file-card__label">Tool routing</div>
                    <div className="mock-file-card__name">Choose compress, merge, split, or conversion based on the document task.</div>
                    <div className="mock-file-card__size">Start from workflow instead of guessing one tool.</div>
                  </div>
                  <div className="mock-arrow">→</div>
                  <div className="mock-file-card mock-file-card--result">
                    <div className="mock-file-card__label">Output paths</div>
                    <div className="mock-file-card__name">Smaller PDFs, merged bundles, extracted page ranges, or converted image files.</div>
                    <div className="mock-file-card__size">Built for uploads, attachments, and faster document prep.</div>
                  </div>
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
              The site is structured around the core document actions people actually need: make one PDF smaller, combine many PDFs, split out needed pages, or move between PDF and JPG formats.
            </p>
          </div>
          <div className="card-grid card-grid--wide">
            {coreTools.map((tool) => (
              <TrackedLink
                className="quick-link quick-link--feature"
                eventParams={{
                  source: "home_core_tools",
                  tool: tool.href.replace("/", ""),
                  label: tool.title
                }}
                href={tool.href}
                key={tool.href}
              >
                <strong>{tool.title}</strong>
                <span>{tool.copy}</span>
              </TrackedLink>
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
              Search intent is fragmented. Some users want to compress a PDF for upload, some need to merge files, some need to split out only a few pages, and some need to convert between PDF and JPG. The homepage now works as the main hub across those search paths.
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
                      <TrackedLink
                        className="link-list__item"
                        eventParams={{
                          source: "home_workflow_columns",
                          tool: item.href.replace("/", ""),
                          label: item.title
                        }}
                        href={item.href}
                        key={item.title}
                      >
                        <span>{item.title}</span>
                        <small>{item.copy}</small>
                      </TrackedLink>
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
              <h2 className="section-title">Popular search pages for compression and conversion</h2>
            </div>
            <p className="section-copy">
              These are the pages most likely to match the way people actually search: compress PDF online, convert PDF to JPG, convert JPG to PDF, and fix file-size problems for uploads or email.
            </p>
          </div>
          <div className="scenario-rail">
            <div className="scenario-group">
              <strong>Compression</strong>
              <div className="scenario-list">
                {popularCompressionPages.map((page) =>
                  page ? (
                    <TrackedLink
                      className="scenario-link"
                      eventName="site_link_clicked"
                      eventParams={{
                        source: "home_popular_compression",
                        tool: page.tool,
                        label: page.h1
                      }}
                      href={`/${page.slug}`}
                      key={page.slug}
                    >
                      {page.h1}
                    </TrackedLink>
                  ) : null
                )}
              </div>
            </div>
            <div className="scenario-group">
              <strong>Conversion</strong>
              <div className="scenario-list">
                {[...pdfToJpgPages, ...jpgToPdfPages].map((page) =>
                  page ? (
                    <TrackedLink
                      className="scenario-link"
                      eventName="site_link_clicked"
                      eventParams={{
                        source: "home_popular_conversion",
                        tool: page.tool,
                        label: page.h1
                      }}
                      href={`/${page.slug}`}
                      key={page.slug}
                    >
                      {page.h1}
                    </TrackedLink>
                  ) : null
                )}
              </div>
            </div>
            <div className="scenario-group">
              <strong>PDF editing</strong>
              <div className="scenario-list">
                {editPages.map((page) =>
                  page ? (
                    <TrackedLink
                      className="scenario-link"
                      eventName="site_link_clicked"
                      eventParams={{
                        source: "home_popular_editing",
                        tool: page.tool,
                        label: page.h1
                      }}
                      href={`/${page.slug}`}
                      key={page.slug}
                    >
                      {page.h1}
                    </TrackedLink>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="panel section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Use Cases</span>
              <h2 className="section-title">Questions people search before choosing a tool</h2>
            </div>
            <p className="section-copy">
              The same document problem can show up as an upload issue, a Gmail attachment limit, a preview image request, or a need to combine screenshots into one PDF.
            </p>
          </div>
          <div className="pill-list">
            {homepage.useCases.map((item) => (
              <div className="pill" key={item}>
                <strong>{item}</strong>
                <span>Choose the route that matches the job instead of forcing every visit into one generic PDF compression flow.</span>
              </div>
            ))}
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
              <strong>Search-style entry pages</strong>
              <div className="search-grid">
                {searchEntryPages.map((item) =>
                  item ? (
                    <TrackedLink
                      className="search-chip"
                      eventName="site_link_clicked"
                      eventParams={{
                        source: "home_search_entry_pages",
                        tool: item.tool,
                        label: item.h1
                      }}
                      href={`/${item.slug}`}
                      key={item.slug}
                    >
                      {item.h1}
                    </TrackedLink>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="panel section">
          <h2 className="section-title">How the tools work</h2>
          <div className="step-list">
            <div className="step-card">
              <b>1</b>
              <div>Choose the exact task first: compress PDF, merge PDF, split PDF, convert PDF to JPG, or convert JPG to PDF.</div>
            </div>
            <div className="step-card">
              <b>2</b>
              <div>Upload the file, choose the mode or route that matches the use case, and run the browser-side action.</div>
            </div>
            <div className="step-card">
              <b>3</b>
              <div>Download the result, then move to the next tool if you still need compression, splitting, merging, or conversion.</div>
            </div>
          </div>
        </div>

        <div className="panel section">
          <h2 className="section-title">Frequently asked questions people search</h2>
          <FaqAccordion items={homepage.faq} />
        </div>

        <div className="panel section">
          <h2 className="section-title">More long-tail pages</h2>
          <div className="search-grid">
            {[...nextBatch, ...pdfToJpgPages, ...jpgToPdfPages].map((item) =>
              item ? (
                <TrackedLink
                  className="search-chip search-chip--muted"
                  eventName="site_link_clicked"
                  eventParams={{
                    source: "home_more_long_tail",
                    tool: item.tool,
                    label: item.h1
                  }}
                  href={`/${item.slug}`}
                  key={item.slug}
                >
                  {item.h1}
                </TrackedLink>
              ) : null
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
