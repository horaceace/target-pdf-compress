import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  metadataBase: new URL("https://filesmaller.space"),
  title: {
    default: "Compress PDF to the Smallest Size Online",
    template: "%s | FileSmaller"
  },
  description:
    "Compress PDF to the smallest practical size for uploads, forms, resumes, and email attachments."
  ,
  applicationName: "FileSmaller",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "https://filesmaller.space",
    siteName: "FileSmaller",
    title: "Compress PDF to the Smallest Size Online",
    description:
      "Compress PDF to the smallest practical size for uploads, forms, resumes, and email attachments."
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF to the Smallest Size Online",
    description:
      "Compress PDF to the smallest practical size for uploads, forms, resumes, and email attachments."
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
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
