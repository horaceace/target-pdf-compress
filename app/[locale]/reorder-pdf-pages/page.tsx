import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReorderPdfCard } from "@/components/reorder-pdf-card";

export const metadata: Metadata = {
  title: "Reorder PDF Pages Online Free",
  description:
    "Reorder PDF pages online free in your browser. Type a new page order, rearrange PDF pages, and download the reordered file.",
  alternates: {
    canonical: "/reorder-pdf-pages"
  },
  openGraph: {
    title: "Reorder PDF Pages Online Free",
    description:
      "Reorder PDF pages online free in your browser. Type a new page order, rearrange PDF pages, and download the reordered file.",
    url: "https://filesmaller.space/reorder-pdf-pages"
  },
  twitter: {
    title: "Reorder PDF Pages Online Free",
    description:
      "Reorder PDF pages online free in your browser. Type a new page order, rearrange PDF pages, and download the reordered file."
  }
};

export default async function ReorderPdfPagesPage() {
  const t = await getTranslations("ReorderPdfCard");

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
          <ReorderPdfCard />
        </div>
      </section>
    </main>
  );
}
