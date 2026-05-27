import type { MetadataRoute } from "next";
import { toolPages } from "@/content/tool-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: "https://filesmaller.space",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: "https://filesmaller.space/privacy",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3
    },
    ...toolPages.map((page) => ({
      url: `https://filesmaller.space/${page.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ];
}
