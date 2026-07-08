import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MergePdfCard } from "@/components/merge-pdf-card";

export const metadata: Metadata = {
  title: "Merge PDF Files Online Free",
  description:
    "Merge PDF files online free in your browser. Combine multiple PDF documents into one merged file and download it instantly.",
  alternates: {
    canonical: "/merge-pdf"
  },
  openGraph: {
    title: "Merge PDF Files Online Free",
    description:
      "Merge PDF files online free in your browser. Combine multiple PDF documents into one merged file and download it instantly.",
    url: "https://filesmaller.space/merge-pdf"
  },
  twitter: {
    title: "Merge PDF Files Online Free",
    description:
      "Merge PDF files online free in your browser. Combine multiple PDF documents into one merged file and download it instantly."
  }
};

export default async function MergePdfPage() {
  const t = await getTranslations("MergePdfCard");

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
          <MergePdfCard />
        </div>
      </section>
    </main>
  );
}
