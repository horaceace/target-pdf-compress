import { homepage as homepageEn, toolPages as toolPagesEn } from "./tool-pages"
import { splitToolPages as splitPagesEn } from "./split-pages"

type HomepageContent = typeof homepageEn
type ToolPage = (typeof toolPagesEn)[number]
type SplitPage = (typeof splitPagesEn)[number]

async function loadLocaleModule<T>(locale: string, name: string): Promise<Partial<T> | null> {
  try {
    if (locale === "en") return null
    const mod = await import(`./locales/${locale}/${name}.ts`)
    return (mod.default || mod) as Partial<T>
  } catch {
    return null
  }
}

function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T> | null): T {
  if (!override) return base
  const result = { ...base }
  for (const key of Object.keys(override) as Array<keyof T>) {
    const ov = override[key]
    if (ov !== undefined && ov !== null) {
      result[key] = ov as T[keyof T]
    }
  }
  return result
}

function mergePagesBySlug(base: ToolPage[], overrides: Partial<ToolPage>[]): ToolPage[] {
  if (!overrides.length) return base
  const map = new Map(overrides.map((o) => [o.slug, o]))
  return base.map((page) => {
    const override = map.get(page.slug)
    return override ? deepMerge(page, override) : page
  })
}

function mergeSplitPagesBySlug(base: SplitPage[], overrides: Partial<SplitPage>[]): SplitPage[] {
  if (!overrides.length) return base
  const map = new Map(overrides.map((o) => [o.slug, o]))
  return base.map((page) => {
    const override = map.get(page.slug)
    return override ? deepMerge(page, override) : page
  })
}

export async function getHomepageForLocale(locale: string): Promise<HomepageContent> {
  const override = await loadLocaleModule<HomepageContent>(locale, "homepage")
  return deepMerge(homepageEn, override)
}

export async function getToolPagesForLocale(locale: string): Promise<ToolPage[]> {
  const mod = await loadLocaleModule<{ toolPages: Partial<ToolPage>[] }>(locale, "tool-pages")
  return mergePagesBySlug(toolPagesEn, mod?.toolPages || [])
}

export async function getSplitPagesForLocale(locale: string): Promise<SplitPage[]> {
  const mod = await loadLocaleModule<{ splitToolPages: Partial<SplitPage>[] }>(locale, "split-pages")
  return mergeSplitPagesBySlug(splitPagesEn, mod?.splitToolPages || [])
}

// Sync helpers for build-time usage (loads locale modules statically)
export { homepageEn, toolPagesEn, splitPagesEn }
