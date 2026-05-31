import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dev/"]
      }
    ],
    sitemap: "https://filesmaller.space/sitemap.xml",
    host: "https://filesmaller.space"
  };
}
