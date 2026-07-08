import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dev/"]
      },
      {
        userAgent: "GPTBot",
        disallow: "/"
      },
      {
        userAgent: "CCBot",
        disallow: "/"
      },
      {
        userAgent: "anthropic-ai",
        disallow: "/"
      },
      {
        userAgent: "Claude-Web",
        disallow: "/"
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/"
      },
      {
        userAgent: "Claude-SearchBot",
        allow: "/"
      }
    ],
    sitemap: "https://filesmaller.space/sitemap.xml"
  };
}
