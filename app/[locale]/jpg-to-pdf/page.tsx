import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JpgToPdfCard } from "@/components/jpg-to-pdf-card";

export const metadata: Metadata = {
  title: "JPG to PDF Online Free",
  description:
    "Convert JPG to PDF online free in your browser. Combine multiple JPG or PNG files into one PDF document for sharing and submission.",
  alternates: {
    canonical: "/jpg-to-pdf"
  },
  openGraph: {
    title: "JPG to PDF Online Free",
    description:
      "Convert JPG to PDF online free in your browser. Combine multiple JPG or PNG files into one PDF document for sharing and submission.",
    url: "https://filesmaller.space/jpg-to-pdf"
  },
  twitter: {
    title: "JPG to PDF Online Free",
    description:
      "Convert JPG to PDF online free in your browser. Combine multiple JPG or PNG files into one PDF document for sharing and submission."
  }
};

export default async function JpgToPdfPage() {
  const t = await getTranslations("JpgToPdfCard");

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
          <JpgToPdfCard />
        </div>
      </section>
    </main>
  );
}
