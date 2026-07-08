import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PrivacyPage");
  return {
    title: t("seoTitle"),
    description: t("seoDescription")
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("PrivacyPage");

  return (
    <main className="container">
      <section className="privacy-stack">
        <div className="privacy-card panel">
          <h1>{t("title")}</h1>
          <p>{t("intro")}</p>
        </div>
        <div className="privacy-card panel">
          <h2>{t("analyticsTitle")}</h2>
          <p>{t("analyticsContent")}</p>
        </div>
        <div className="privacy-card panel">
          <h2>{t("fileHandlingTitle")}</h2>
          <p>{t("fileHandlingContent")}</p>
        </div>
        <div className="privacy-card panel">
          <h2>{t("disclaimerTitle")}</h2>
          <p>{t("disclaimerContent")}</p>
        </div>
        <div className="privacy-card panel">
          <h2>{t("cookiesTitle")}</h2>
          <p>{t("cookiesContent")}</p>
        </div>
        <div className="privacy-card panel">
          <h2>{t("updatesTitle")}</h2>
          <p>{t("updatesContent")}</p>
        </div>
        <div className="privacy-card panel">
          <h2>{t("contactTitle")}</h2>
          <p>{t("contactContent")}</p>
        </div>
      </section>
    </main>
  );
}
