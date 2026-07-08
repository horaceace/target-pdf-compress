import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaqAccordion } from "@/components/faq-accordion";
import { HomeToolSwitcher } from "@/components/home-tool-switcher";
import { TrackedLink } from "@/components/tracked-link";
import { homepage, toolPageMap } from "@/content/tool-pages";
import { Wrench, FileText, Zap } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HomePage");
  const title = t("seoTitle");
  const description = t("seoDescription");
  return {
    title,
    description,
    alternates: {
      canonical: "/"
    },
    openGraph: {
      title,
      description,
      url: "https://filesmaller.space",
      images: [
        {
          url: "https://filesmaller.space/og-image.png",
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://filesmaller.space/og-image.png"]
    }
  };
}

export default async function HomePage() {
  const t = await getTranslations("HomePage");

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
      title: t("coreToolCompressTitle"),
      copy: t("coreToolCompressCopy")
    },
    {
      href: "/merge-pdf",
      title: t("coreToolMergeTitle"),
      copy: t("coreToolMergeCopy")
    },
    {
      href: "/split-pdf",
      title: t("coreToolSplitTitle"),
      copy: t("coreToolSplitCopy")
    },
    {
      href: "/rotate-pdf",
      title: t("coreToolRotateTitle"),
      copy: t("coreToolRotateCopy")
    },
    {
      href: "/remove-pdf-pages",
      title: t("coreToolRemoveTitle"),
      copy: t("coreToolRemoveCopy")
    },
    {
      href: "/reorder-pdf-pages",
      title: t("coreToolReorderTitle"),
      copy: t("coreToolReorderCopy")
    },
    {
      href: "/pdf-to-jpg",
      title: t("coreToolPdfToJpgTitle"),
      copy: t("coreToolPdfToJpgCopy")
    },
    {
      href: "/jpg-to-pdf",
      title: t("coreToolJpgToPdfTitle"),
      copy: t("coreToolJpgToPdfCopy")
    }
  ];

  const featuredTool = coreTools[0];
  const secondaryTools = coreTools.slice(1);

  const toolPaths = [
    { title: t("toolPathUploadFirstTitle"), copy: t("toolPathUploadFirstCopy") },
    { title: t("toolPathResumeSafeTitle"), copy: t("toolPathResumeSafeCopy") },
    { title: t("toolPathScannedRescueTitle"), copy: t("toolPathScannedRescueCopy") }
  ];

  const documentWorkflows = [
    { title: t("docWorkflow1Title"), copy: t("docWorkflow1Copy") },
    { title: t("docWorkflow2Title"), copy: t("docWorkflow2Copy") },
    { title: t("docWorkflow3Title"), copy: t("docWorkflow3Copy") },
    { title: t("docWorkflow4Title"), copy: t("docWorkflow4Copy") },
    { title: t("docWorkflow5Title"), copy: t("docWorkflow5Copy") },
    { title: t("docWorkflow6Title"), copy: t("docWorkflow6Copy") },
    { title: t("docWorkflow7Title"), copy: t("docWorkflow7Copy") },
    { title: t("docWorkflow8Title"), copy: t("docWorkflow8Copy") },
    { title: t("docWorkflow9Title"), copy: t("docWorkflow9Copy") }
  ];

  const mergePaths = [
    {
      href: "/merge-pdf",
      title: t("mergePath1Title"),
      copy: t("mergePath1Copy")
    },
    {
      href: "/merge-pdf",
      title: t("mergePath2Title"),
      copy: t("mergePath2Copy")
    },
    {
      href: "/merge-pdf",
      title: t("mergePath3Title"),
      copy: t("mergePath3Copy")
    },
    {
      href: "/merge-pdf",
      title: t("mergePath4Title"),
      copy: t("mergePath4Copy")
    }
  ];

  const splitPaths = [
    {
      href: "/split-pdf-by-page-ranges",
      title: t("splitPath1Title"),
      copy: t("splitPath1Copy")
    },
    {
      href: "/extract-pdf-pages",
      title: t("splitPath2Title"),
      copy: t("splitPath2Copy")
    },
    {
      href: "/split-large-pdf",
      title: t("splitPath3Title"),
      copy: t("splitPath3Copy")
    },
    {
      href: "/split-pdf-for-upload",
      title: t("splitPath4Title"),
      copy: t("splitPath4Copy")
    },
    {
      href: "/rotate-pdf",
      title: t("splitPath5Title"),
      copy: t("splitPath5Copy")
    },
    {
      href: "/remove-pdf-pages",
      title: t("splitPath6Title"),
      copy: t("splitPath6Copy")
    },
    {
      href: "/reorder-pdf-pages",
      title: t("splitPath7Title"),
      copy: t("splitPath7Copy")
    }
  ];

  const conversionLinks = [
    {
      href: "/pdf-to-jpg-online",
      title: t("conversionLink1Title"),
      copy: t("conversionLink1Copy")
    },
    {
      href: "/jpg-to-pdf-online",
      title: t("conversionLink2Title"),
      copy: t("conversionLink2Copy")
    },
    {
      href: "/convert-pdf-pages-to-jpg",
      title: t("conversionLink3Title"),
      copy: t("conversionLink3Copy")
    },
    {
      href: "/images-to-pdf-for-upload",
      title: t("conversionLink4Title"),
      copy: t("conversionLink4Copy")
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
    { value: String(coreTools.length), label: t("heroStatCoreTools"), icon: Wrench },
    { value: "50+", label: t("heroStatScenarioPages"), icon: FileText },
    { value: "Browser-first", label: t("heroStatNoInstall"), icon: Zap }
  ];

  const workflowColumns = [
    {
      title: t("wfColumnCompressionTitle"),
      intro: t("wfColumnCompressionIntro"),
      links: [
        ...toolPaths.map((item) => ({ title: item.title, copy: item.copy })),
        {
          title: t("moreCompressionPagesTitle"),
          copy: t("moreCompressionPagesCopy"),
          href: "/compress-pdf-online"
        }
      ]
    },
    {
      title: t("wfColumnMergeTitle"),
      intro: t("wfColumnMergeIntro"),
      links: mergePaths.map((item) => ({ title: item.title, copy: item.copy, href: item.href }))
    },
    {
      title: t("wfColumnSplitTitle"),
      intro: t("wfColumnSplitIntro"),
      links: splitPaths.map((item) => ({ title: item.title, copy: item.copy, href: item.href }))
    },
    {
      title: t("wfColumnConversionTitle"),
      intro: t("wfColumnConversionIntro"),
      links: conversionLinks.map((item) => ({ title: item.title, copy: item.copy, href: item.href }))
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
            <span className="eyebrow">{t("heroEyebrow")}</span>
            <h1>{t("heroH1")}</h1>
            <p className="hero__lede">{t("heroSubheading")}</p>
            <div className="stat-strip">
              {heroStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="stat-chip" key={item.label}>
                    <Icon />
                    <div>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  </div>
                );
              })}
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
                <span className="directory-link__kicker">{t("heroFeaturedKicker")}</span>
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
                    <div className="mock-file-card__label">{t("mockRoutingLabel")}</div>
                    <div className="mock-file-card__name">{t("mockRoutingName")}</div>
                    <div className="mock-file-card__size">{t("mockRoutingSize")}</div>
                  </div>
                  <div className="mock-arrow">→</div>
                  <div className="mock-file-card mock-file-card--result">
                    <div className="mock-file-card__label">{t("mockOutputLabel")}</div>
                    <div className="mock-file-card__name">{t("mockOutputName")}</div>
                    <div className="mock-file-card__size">{t("mockOutputSize")}</div>
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
              <span className="section-kicker">{t("coreToolsSectionKicker")}</span>
              <h2 className="section-title">{t("coreToolsSectionTitle")}</h2>
            </div>
            <p className="section-copy">{t("coreToolsSectionCopy")}</p>
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
              <span className="section-kicker">{t("workflowsSectionKicker")}</span>
              <h2 className="section-title">{t("workflowsSectionTitle")}</h2>
            </div>
            <p className="section-copy">{t("workflowsSectionCopy")}</p>
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
              <span className="section-kicker">{t("scenariosSectionKicker")}</span>
              <h2 className="section-title">{t("scenariosSectionTitle")}</h2>
            </div>
            <p className="section-copy">{t("scenariosSectionCopy")}</p>
          </div>
          <div className="scenario-rail">
            <div className="scenario-group">
              <strong>{t("scenarioGroupCompression")}</strong>
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
              <strong>{t("scenarioGroupConversion")}</strong>
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
              <strong>{t("scenarioGroupPdfEditing")}</strong>
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
              <span className="section-kicker">{t("useCasesSectionKicker")}</span>
              <h2 className="section-title">{t("useCasesSectionTitle")}</h2>
            </div>
            <p className="section-copy">{t("useCasesSectionCopy")}</p>
          </div>
          <div className="pill-list">
            {homepage.useCases.map((item) => (
              <div className="pill" key={item}>
                <strong>{item}</strong>
                <span>{t("useCaseCopy")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">{t("directorySectionKicker")}</span>
              <h2 className="section-title">{t("directorySectionTitle")}</h2>
            </div>
            <p className="section-copy">{t("directorySectionCopy")}</p>
          </div>
          <div className="editorial-grid editorial-grid--compact">
            <div className="editorial-card">
              <strong>{t("directoryCardDocumentWorkflows")}</strong>
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
              <strong>{t("directoryCardSearchEntryPages")}</strong>
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
          <h2 className="section-title">{t("howItWorksTitle")}</h2>
          <div className="step-list">
            <div className="step-card">
              <b>1</b>
              <div>{t("howItWorksStep1")}</div>
            </div>
            <div className="step-card">
              <b>2</b>
              <div>{t("howItWorksStep2")}</div>
            </div>
            <div className="step-card">
              <b>3</b>
              <div>{t("howItWorksStep3")}</div>
            </div>
          </div>
        </div>

        <div className="panel section">
          <h2 className="section-title">{t("faqTitle")}</h2>
          <FaqAccordion items={homepage.faq} />
        </div>

        <div className="panel section">
          <h2 className="section-title">{t("moreLongTailTitle")}</h2>
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
