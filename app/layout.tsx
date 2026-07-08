import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { Analytics } from "@/components/analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://filesmaller.space"),
  title: {
    default: "Free PDF Tools Online | FileSmaller",
    template: "%s | FileSmaller"
  },
  description:
    "Compress PDF online free, merge PDF files, split PDF pages, rotate, remove, or reorder PDF pages, convert PDF to JPG, and turn JPG to PDF in a browser-first workflow.",
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
    title: "Free PDF Tools Online | FileSmaller",
    description:
      "Compress PDF online free, merge PDF files, split PDF pages, rotate, remove, or reorder PDF pages, convert PDF to JPG, and turn JPG to PDF in a browser-first workflow.",
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
    title: "Free PDF Tools Online | FileSmaller",
    description:
      "Compress PDF online free, merge PDF files, split PDF pages, rotate, remove, or reorder PDF pages, convert PDF to JPG, and turn JPG to PDF in a browser-first workflow.",
    images: ["https://filesmaller.space/og-image.png"]
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
