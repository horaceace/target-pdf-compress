import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RemovePdfPagesCard } from "@/components/remove-pdf-pages-card";

export const metadata: Metadata = {
  title: "Remove PDF Pages Online Free",
  description:
    "Remove pages from a PDF online free in your browser. Delete blank, duplicate, or unwanted pages and download a cleaned PDF.",
  alternates: {
    canonical: "/remove-pdf-pages"
  },
  openGraph: {
    title: "Remove PDF Pages Online Free",
    description:
      "Remove pages from a PDF online free in your browser. Delete blank, duplicate, or unwanted pages and download a cleaned PDF.",
    url: "https://filesmaller.space/remove-pdf-pages"
  },
  twitter: {
    title: "Remove PDF Pages Online Free",
    description:
      "Remove pages from a PDF online free in your browser. Delete blank, duplicate, or unwanted pages and download a cleaned PDF."
  }
};

export default async function RemovePdfPagesPage() {
  const t = await getTranslations("RemovePdfPagesCard");

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
          <RemovePdfPagesCard />
        </div>
      </section>
    </main>
  );
}
