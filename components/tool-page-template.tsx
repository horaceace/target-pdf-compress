import Link from "next/link";
import { FaqAccordion } from "@/components/faq-accordion";
import { ToolPageConfig, toolPageMap } from "@/content/tool-pages";
import { JpgToPdfCard } from "@/components/jpg-to-pdf-card";
import { MergePdfCard } from "@/components/merge-pdf-card";
import { PdfToJpgCard } from "@/components/pdf-to-jpg-card";
import { UploadCard } from "@/components/upload-card";

export function ToolPageTemplate({ page }: { page: ToolPageConfig }) {
  const relatedPages = page.relatedSlugs
    .map((slug) => toolPageMap.get(slug))
    .filter((item): item is ToolPageConfig => Boolean(item));
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://filesmaller.space"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.h1,
        item: `https://filesmaller.space/${page.slug}`
      }
    ]
  };
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    url: `https://filesmaller.space/${page.slug}`,
    description: page.description,
    breadcrumb: {
      "@id": `https://filesmaller.space/${page.slug}#breadcrumb`
    }
  };
  const toolLabelMap: Record<ToolPageConfig["tool"], string> = {
    "compress-pdf": "Scenario-driven compression",
    "merge-pdf": "Scenario-driven PDF merge",
    "pdf-to-jpg": "Scenario-driven PDF to JPG conversion",
    "jpg-to-pdf": "Scenario-driven JPG to PDF conversion"
  };
  const relatedTitleMap: Record<ToolPageConfig["tool"], string> = {
    "compress-pdf": "Related compression pages",
    "merge-pdf": "Related merge pages",
    "pdf-to-jpg": "Related PDF to JPG pages",
    "jpg-to-pdf": "Related JPG to PDF pages"
  };

  function renderToolCard() {
    if (page.tool === "compress-pdf") {
      return (
        <UploadCard
          copy={page.targetLabel}
          heading={page.h1}
          initialTarget={page.targetLabel
            .replace("Compression mode: ", "")
            .replace("Target size: ", "")
            .replace("Compression goal: ", "")}
        />
      );
    }

    if (page.tool === "merge-pdf") {
      return <MergePdfCard />;
    }

    if (page.tool === "pdf-to-jpg") {
      return <PdfToJpgCard />;
    }

    return <JpgToPdfCard />;
  }

  return (
    <main className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...breadcrumbSchema,
            "@id": `https://filesmaller.space/${page.slug}#breadcrumb`
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <section className="tool-page__headline">
        <span className="eyebrow">{page.targetLabel}</span>
        <h1>{page.h1}</h1>
        <p>{page.subheading}</p>
      </section>

      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy">
            <span className="eyebrow">{toolLabelMap[page.tool]}</span>
            <h1>{page.h1}</h1>
            <p>{page.intro}</p>
          </div>
          {renderToolCard()}
        </div>
      </section>

      <section className="section-stack">
        <div className="panel section">
          <h2 className="section-title">How it works</h2>
          <div className="step-list">
            {page.steps.map((step, index) => (
              <div className="step-card" key={step}>
                <b>{index + 1}</b>
                <div>{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel section">
          <h2 className="section-title">Common questions</h2>
          <FaqAccordion items={page.faq} />
        </div>

        <div className="panel section">
          <h2 className="section-title">{relatedTitleMap[page.tool]}</h2>
          <div className="related-links">
            {relatedPages.map((related) => (
              <Link className="related-link" href={`/${related.slug}`} key={related.slug}>
                <strong>{related.h1}</strong>
                <span>{related.subheading}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
