import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UploadCard } from "@/components/upload-card";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("UploadCard");
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/compress-pdf"),
    openGraph: buildOpenGraph(title, description, "/compress-pdf"),
    twitter: buildTwitter(title, description),
  };
}

export default async function CompressPdfPage() {
  const t = await getTranslations("UploadCard");
  const tp = await getTranslations("Compression");

  return (
    <main className="container">
      <section className="tool-page__headline">
        <span className="eyebrow">{t("headlineEyebrow")}</span>
        <h1>{t("defaultHeading")}</h1>
        <p>{t("headlineDescription")}</p>
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
                <span>{tp("modes.light.bestFor")}</span>
              </div>
              <div className="hero-point">
                <strong>{t("heroPoint2Title")}</strong>
                <span>{t("heroPoint2Copy")}</span>
              </div>
              <div className="hero-point">
                <strong>{t("heroPoint3Title")}</strong>
                <span>{tp("modes.scanned.bestFor")}</span>
              </div>
            </div>
          </div>
          <UploadCard copy={t("defaultCopy")} heading={t("defaultHeading")} />
        </div>
      </section>
    </main>
  );
}
