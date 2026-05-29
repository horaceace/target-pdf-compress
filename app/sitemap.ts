import type { MetadataRoute } from "next";
import { toolPages } from "@/content/tool-pages";
import { splitToolPages } from "@/content/split-pages";

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
    {
      url: "https://filesmaller.space/compress-pdf",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: "https://filesmaller.space/merge-pdf",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: "https://filesmaller.space/split-pdf",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: "https://filesmaller.space/rotate-pdf",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: "https://filesmaller.space/remove-pdf-pages",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: "https://filesmaller.space/reorder-pdf-pages",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: "https://filesmaller.space/pdf-to-jpg",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: "https://filesmaller.space/jpg-to-pdf",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85
    },
    ...toolPages.map((page) => ({
      url: `https://filesmaller.space/${page.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8
    })),
    ...splitToolPages.map((page) => ({
      url: `https://filesmaller.space/${page.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ];
}
