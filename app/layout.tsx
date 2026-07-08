import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Common" });
  return {
    metadataBase: new URL("https://filesmaller.space"),
    title: {
      default: t("siteTitle"),
      template: t("siteTitleTemplate")
    },
    description: t("siteDescription"),
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg"
    },
    openGraph: {
      type: "website",
      url: "https://filesmaller.space",
      siteName: "FileSmaller",
      title: t("siteTitle"),
      description: t("siteDescription"),
      images: [
        {
          url: "https://filesmaller.space/og-image.png",
          width: 1200,
          height: 630,
          alt: "FileSmaller — Free PDF Tools Online"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: t("siteTitle"),
      description: t("siteDescription"),
      images: ["https://filesmaller.space/og-image.png"]
    }
  };
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="bg-orb bg-orb--1" />
        <div className="bg-orb bg-orb--2" />
        <div className="bg-orb bg-orb--3" />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
