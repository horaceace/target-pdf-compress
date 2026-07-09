import type { Metadata } from "next";

const BASE_URL = "https://filesmaller.space";
const LOCALES = ["en", "hi", "id"] as const;
const DEFAULT_LOCALE = "en";

/**
 * Build alternates object with canonical and hreflang language links.
 * For English (default, as-needed prefix): path = "/compress-pdf"
 * For other locales: path = "/hi/compress-pdf"
 */
export function buildAlternates(path: string): Metadata["alternates"] {
  // Normalize: strip locale prefix to get the base path
  let basePath = path;
  for (const locale of LOCALES) {
    if (locale !== DEFAULT_LOCALE && path.startsWith(`/${locale}/`)) {
      basePath = path.slice(locale.length + 1) || "/"; // Remove "/hi" prefix
      break;
    }
  }

  const canonical = DEFAULT_LOCALE === "en" ? basePath : `/${DEFAULT_LOCALE}${basePath}`;

  // For homepage, locale paths should be "/hi" not "/hi/"
  const localePath = basePath === "/" ? "" : basePath;
  const languages: Record<string, string> = {
    en: `${BASE_URL}${basePath}`,
    hi: `${BASE_URL}/hi${localePath}`,
    id: `${BASE_URL}/id${localePath}`,
    "x-default": `${BASE_URL}${basePath}`,
  };

  return {
    canonical,
    languages,
  };
}

/** Build OpenGraph metadata with locale-aware URL */
export function buildOpenGraph(
  title: string,
  description: string,
  path: string,
  image?: { url: string; width: number; height: number; alt: string }
): Metadata["openGraph"] {
  const cleanPath = path === "/" ? "" : path;
  return {
    title,
    description,
    url: `${BASE_URL}${cleanPath}`,
    ...(image ? { images: [image] } : {}),
  };
}

/** Build Twitter metadata */
export function buildTwitter(
  title: string,
  description: string,
  imageUrl?: string
): Metadata["twitter"] {
  return {
    card: imageUrl ? "summary_large_image" : "summary",
    title,
    description,
    ...(imageUrl ? { images: [imageUrl] } : {}),
  };
}
