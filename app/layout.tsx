import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { Analytics } from "@/components/analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://filesmaller.space"),
  title: {
    default: "Compress PDF Online Free | FileSmaller",
    template: "%s | FileSmaller"
  },
  description:
    "Compress PDF online free, merge PDF files, split PDF pages, convert PDF to JPG, and turn JPG to PDF in a browser-first workflow.",
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
    title: "Compress PDF Online Free | FileSmaller",
    description:
      "Compress PDF online free, merge PDF files, split PDF pages, convert PDF to JPG, and turn JPG to PDF in a browser-first workflow."
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF Online Free | FileSmaller",
    description:
      "Compress PDF online free, merge PDF files, split PDF pages, convert PDF to JPG, and turn JPG to PDF in a browser-first workflow."
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
