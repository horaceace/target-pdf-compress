import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PdfToJpgCard } from "@/components/pdf-to-jpg-card";

export const metadata: Metadata = {
  title: "PDF to JPG Online Free",
  description:
    "Convert PDF to JPG online free in your browser. Export one JPG per page for previews, uploads, sharing, and content workflows.",
  alternates: {
    canonical: "/pdf-to-jpg"
  },
  openGraph: {
    title: "PDF to JPG Online Free",
    description:
      "Convert PDF to JPG online free in your browser. Export one JPG per page for previews, uploads, sharing, and content workflows.",
    url: "https://filesmaller.space/pdf-to-jpg"
  },
  twitter: {
    title: "PDF to JPG Online Free",
    description:
      "Convert PDF to JPG online free in your browser. Export one JPG per page for previews, uploads, sharing, and content workflows."
  }
};

export default async function PdfToJpgPage() {
  const t = await getTranslations("PdfToJpgCard");

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
          <PdfToJpgCard />
        </div>
      </section>
    </main>
  );
}
