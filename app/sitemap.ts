import type { MetadataRoute } from "next";
import { toolPages } from "@/content/tool-pages";
import { splitToolPages } from "@/content/split-pages";

const BASE_URL = "https://filesmaller.space";
const LOCALES = ["en", "hi", "id"] as const;

function buildSitemapEntry(
  path: string,
  priority: number,
  changeFrequency: "weekly" | "monthly"
): MetadataRoute.Sitemap[number] {
  const now = new Date();
  return {
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Core pages (English + hi/id variants)
  const corePages = ["", "/privacy", "/compress-pdf", "/merge-pdf", "/split-pdf",
    "/rotate-pdf", "/remove-pdf-pages", "/reorder-pdf-pages", "/pdf-to-jpg", "/jpg-to-pdf"];

  const corePriorities: Record<string, number> = {
    "": 1,
    "/privacy": 0.3,
    "/compress-pdf": 0.9,
    "/merge-pdf": 0.9,
    "/split-pdf": 0.9,
    "/rotate-pdf": 0.85,
    "/remove-pdf-pages": 0.85,
    "/reorder-pdf-pages": 0.85,
    "/pdf-to-jpg": 0.85,
    "/jpg-to-pdf": 0.85,
  };

  const entries: MetadataRoute.Sitemap = [];

  // English (default, no prefix) + hi/id prefixes
  for (const corePath of corePages) {
    const priority = corePriorities[corePath] || 0.8;
    const freq = corePath === "/privacy" ? "monthly" as const : "weekly" as const;

    // English (default, no prefix)
    entries.push(buildSitemapEntry(corePath || "/", priority, freq));

    // Hindi and Indonesian variants
    for (const locale of ["hi", "id"]) {
      const path = corePath === "" ? `/${locale}` : `/${locale}${corePath}`;
      entries.push(buildSitemapEntry(path, priority - 0.05, freq));
    }
  }

  // SEO slug pages (English)
  for (const page of toolPages) {
    entries.push({
      url: `${BASE_URL}/${page.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    });
  }
  for (const page of splitToolPages) {
    entries.push({
      url: `${BASE_URL}/${page.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    });
  }

  // SEO slug pages (Hindi + Indonesian variants)
  for (const locale of ["hi", "id"]) {
    for (const page of toolPages) {
      entries.push({
        url: `${BASE_URL}/${locale}/${page.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      });
    }
    for (const page of splitToolPages) {
      entries.push({
        url: `${BASE_URL}/${locale}/${page.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      });
    }
  }

  return entries;
}
