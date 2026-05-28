import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { Analytics } from "@/components/analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://filesmaller.space"),
  title: {
    default: "FileSmaller | Free PDF Tools Online",
    template: "%s | FileSmaller"
  },
  description:
    "Free browser-first PDF tools for compressing, merging, and splitting documents online.",
  applicationName: "FileSmaller",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  },
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "https://filesmaller.space",
    siteName: "FileSmaller",
    title: "FileSmaller | Free PDF Tools Online",
    description:
      "Free browser-first PDF tools for compressing, merging, and splitting documents online."
  },
  twitter: {
    card: "summary_large_image",
    title: "FileSmaller | Free PDF Tools Online",
    description:
      "Free browser-first PDF tools for compressing, merging, and splitting documents online."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Analytics />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
