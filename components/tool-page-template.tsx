import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FaqAccordion } from "@/components/faq-accordion";
import { ToolPageConfig, toolPageMap } from "@/content/tool-pages";
import { JpgToPdfCard } from "@/components/jpg-to-pdf-card";
import { MergePdfCard } from "@/components/merge-pdf-card";
import { PdfToJpgCard } from "@/components/pdf-to-jpg-card";
import { RemovePdfPagesCard } from "@/components/remove-pdf-pages-card";
import { ReorderPdfCard } from "@/components/reorder-pdf-card";
import { RotatePdfCard } from "@/components/rotate-pdf-card";
import { UploadCard } from "@/components/upload-card";
import { WatermarkCard } from "@/components/watermark-card";
import { PageNumbersCard } from "@/components/page-numbers-card";
import { UnlockPdfCard } from "@/components/unlock-pdf-card";
import { ProtectPdfCard } from "@/components/protect-pdf-card";

export async function ToolPageTemplate({ page }: { page: ToolPageConfig }) {
  const t = await getTranslations("ToolPageTemplate");

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
        name: t("breadcrumbHome"),
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
    "compress-pdf": t("scenarioCompress"),
    "merge-pdf": t("scenarioMerge"),
    "pdf-to-jpg": t("scenarioPdfToJpg"),
    "jpg-to-pdf": t("scenarioJpgToPdf"),
    "rotate-pdf": t("scenarioRotate"),
    "remove-pdf-pages": t("scenarioRemove"),
    "reorder-pdf-pages": t("scenarioReorder"),
    "watermark-pdf": t("scenarioWatermark"),
    "page-numbers-pdf": t("scenarioPageNumbers"),
    "unlock-pdf": t("scenarioUnlock"),
    "protect-pdf": t("scenarioProtect")
  };
  const relatedTitleMap: Record<ToolPageConfig["tool"], string> = {
    "compress-pdf": t("relatedCompress"),
    "merge-pdf": t("relatedMerge"),
    "pdf-to-jpg": t("relatedPdfToJpg"),
    "jpg-to-pdf": t("relatedJpgToPdf"),
    "rotate-pdf": t("relatedRotate"),
    "remove-pdf-pages": t("relatedRemove"),
    "reorder-pdf-pages": t("relatedReorder"),
    "watermark-pdf": t("relatedWatermark"),
    "page-numbers-pdf": t("relatedPageNumbers"),
    "unlock-pdf": t("relatedUnlock"),
    "protect-pdf": t("relatedProtect")
  };

  function renderToolCard() {
    if (page.tool === "compress-pdf") {
      return (
        <UploadCard
          copy={page.targetLabel}
          heading={page.h1}
          initialTarget={page.targetLabel
            .replace(t("compressionMode"), "")
            .replace(t("targetSize"), "")
            .replace(t("compressionGoal"), "")}
        />
      );
    }

    if (page.tool === "merge-pdf") {
      return <MergePdfCard />;
    }

    if (page.tool === "pdf-to-jpg") {
      return <PdfToJpgCard />;
    }

    if (page.tool === "rotate-pdf") {
      return <RotatePdfCard />;
    }

    if (page.tool === "remove-pdf-pages") {
      return <RemovePdfPagesCard />;
    }

    if (page.tool === "reorder-pdf-pages") {
      return <ReorderPdfCard />;
    }

    if (page.tool === "watermark-pdf") {
      return <WatermarkCard />;
    }

    if (page.tool === "page-numbers-pdf") {
      return <PageNumbersCard />;
    }

    if (page.tool === "unlock-pdf") {
      return <UnlockPdfCard />;
    }

    if (page.tool === "protect-pdf") {
      return <ProtectPdfCard />;
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
        {page.tool === "compress-pdf" ? (
          <aside className="capability-callout" role="note">
            <strong>{t("capabilityTitle")}</strong>
            <span>{t("capabilityBody")}</span>
          </aside>
        ) : null}
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
          <h2 className="section-title">{t("howItWorks")}</h2>
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
          <h2 className="section-title">{t("commonQuestions")}</h2>
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
