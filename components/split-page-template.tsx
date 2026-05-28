import Link from "next/link";
import { SplitPdfCard } from "@/components/split-pdf-card";
import { SplitPageConfig, splitToolPageMap } from "@/content/split-pages";

export function SplitPageTemplate({ page }: { page: SplitPageConfig }) {
  const relatedPages = page.relatedSlugs
    .map((slug) => splitToolPageMap.get(slug))
    .filter((item): item is SplitPageConfig => Boolean(item));
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
          <div className="panel hero__copy hero__copy--feature">
            <span className="eyebrow eyebrow--feature">Page-range splitting for real document tasks</span>
            <h2>{page.h1}</h2>
            <p>{page.intro}</p>
            <div className="hero-points">
              <div className="hero-point">
                <strong>Extract the exact pages you need</strong>
                <span>Useful for forms, signatures, certificates, reports, and upload-ready subsets.</span>
              </div>
              <div className="hero-point">
                <strong>Use simple page ranges</strong>
                <span>Enter formats like 1-3, 5, 7-9 to export one or more smaller PDF files.</span>
              </div>
              <div className="hero-point">
                <strong>Split before compressing</strong>
                <span>Break one large file into smaller parts first, then compress only the pages that still need smaller sizes.</span>
              </div>
            </div>
          </div>
          <SplitPdfCard />
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
          <h2 className="section-title">Related split pages</h2>
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
