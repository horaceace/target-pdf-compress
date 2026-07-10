import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageNumbersCard } from "@/components/page-numbers-card";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/metadata";
import { CoreToolRelated } from "@/components/core-tool-related";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PageNumbersCard");
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/page-numbers-pdf"),
    openGraph: buildOpenGraph(title, description, "/page-numbers-pdf"),
    twitter: buildTwitter(title, description),
  };
}

export default async function PageNumbersPdfPage() {
  const t = await getTranslations("PageNumbersCard");

  return (
    <main className="container">
      <section className="tool-page__headline">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{t("heading")}</h1>
        <p>{t("description")}</p>
      </section>

      <section className="hero">
        <div className="hero__wrap">
          <div className="panel hero__copy hero__copy--feature">
            <span className="eyebrow eyebrow--feature">{t("heroEyebrow")}</span>
            <h2>{t("heroHeading")}</h2>
            <p>{t("heroIntro")}</p>
            <div className="hero-points">
              <div className="hero-point">
                <strong>{t("heroPoint1Title")}</strong>
                <span>{t("heroPoint1Copy")}</span>
              </div>
              <div className="hero-point">
                <strong>{t("heroPoint2Title")}</strong>
                <span>{t("heroPoint2Copy")}</span>
              </div>
              <div className="hero-point">
                <strong>{t("heroPoint3Title")}</strong>
                <span>{t("heroPoint3Copy")}</span>
              </div>
            </div>
          </div>
          <PageNumbersCard />
        </div>
      </section>
      <CoreToolRelated current="page-numbers-pdf" />
    </main>
  );
}
