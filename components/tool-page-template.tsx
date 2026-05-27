import Link from "next/link";
import { ToolPageConfig, toolPageMap } from "@/content/tool-pages";
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

  return (
    <main className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="tool-page__headline">
        <span className="eyebrow">{page.targetLabel}</span>
        <h1>{page.h1}</h1>
        <p>{page.subheading}</p>
      </section>

      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy">
            <span className="eyebrow">Scenario-driven compression</span>
            <h1>{page.h1}</h1>
            <p>{page.intro}</p>
          </div>
          <UploadCard
            copy={page.targetLabel}
            heading={page.h1}
            initialTarget={page.targetLabel
              .replace("Compression mode: ", "")
              .replace("Target size: ", "")
              .replace("Compression goal: ", "")}
          />
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
          <div className="faq-grid">
            {page.faq.map((item) => (
              <article className="faq-item" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel section">
          <h2 className="section-title">Related compression pages</h2>
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
