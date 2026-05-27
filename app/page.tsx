import type { Metadata } from "next";
import Link from "next/link";
import { homepage, toolPageMap } from "@/content/tool-pages";
import { UploadCard } from "@/components/upload-card";

export const metadata: Metadata = {
  title: homepage.title,
  description: homepage.description
};

export default function HomePage() {
  const quickLinks = homepage.quickLinks
    .map((slug) => toolPageMap.get(slug))
    .filter((item) => Boolean(item));

  return (
    <main className="container">
      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy">
            <span className="eyebrow">SEO-ready PDF tool</span>
            <h1>{homepage.h1}</h1>
            <p>{homepage.subheading}</p>
          </div>
          <UploadCard />
        </div>
      </section>

      <section className="section-stack">
        <div className="panel section">
          <h2 className="section-title">Popular target sizes</h2>
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
          <h2 className="section-title">Common use cases</h2>
          <div className="pill-list">
            {homepage.useCases.map((item) => (
              <div className="pill" key={item}>
                <strong>{item}</strong>
                <span>Made for size-restricted PDF upload workflows.</span>
              </div>
            ))}
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
      </section>
    </main>
  );
}
