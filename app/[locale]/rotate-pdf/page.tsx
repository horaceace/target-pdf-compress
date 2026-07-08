import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RotatePdfCard } from "@/components/rotate-pdf-card";

export const metadata: Metadata = {
  title: "Rotate PDF Online Free",
  description:
    "Rotate PDF pages online free in your browser. Turn all pages or selected pages 90, 180, or 270 degrees and download the fixed PDF.",
  alternates: {
    canonical: "/rotate-pdf"
  },
  openGraph: {
    title: "Rotate PDF Online Free",
    description:
      "Rotate PDF pages online free in your browser. Turn all pages or selected pages 90, 180, or 270 degrees and download the fixed PDF.",
    url: "https://filesmaller.space/rotate-pdf"
  },
  twitter: {
    title: "Rotate PDF Online Free",
    description:
      "Rotate PDF pages online free in your browser. Turn all pages or selected pages 90, 180, or 270 degrees and download the fixed PDF."
  }
};

export default async function RotatePdfPage() {
  const t = await getTranslations("RotatePdfCard");

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
          <RotatePdfCard />
        </div>
      </section>
    </main>
  );
}
