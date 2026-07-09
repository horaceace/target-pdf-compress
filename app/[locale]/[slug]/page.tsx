import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SplitPageTemplate } from "@/components/split-page-template";
import { ToolPageTemplate } from "@/components/tool-page-template";
import { toolPages, toolPageMap } from "@/content/tool-pages";
import { splitToolPages, splitToolPageMap } from "@/content/split-pages";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/metadata";

export function generateStaticParams() {
  return [...toolPages, ...splitToolPages].map((page) => ({ slug: page.slug }));
}

export function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const page = toolPageMap.get(slug);
    const splitPage = splitToolPageMap.get(slug);

    if (!page) {
      if (!splitPage) {
        return {};
      }

      return {
        title: splitPage.title,
        description: splitPage.description,
        alternates: buildAlternates(`/${splitPage.slug}`),
        openGraph: buildOpenGraph(splitPage.title, splitPage.description, `/${splitPage.slug}`),
        twitter: buildTwitter(splitPage.title, splitPage.description),
      };
    }

    return {
      title: page.title,
      description: page.description,
      alternates: buildAlternates(`/${page.slug}`),
      openGraph: buildOpenGraph(page.title, page.description, `/${page.slug}`),
      twitter: buildTwitter(page.title, page.description),
    };
  });
}

export default async function ToolPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = toolPageMap.get(slug);
  const splitPage = splitToolPageMap.get(slug);

  if (!page && !splitPage) {
    notFound();
  }

  if (splitPage) {
    return <SplitPageTemplate page={splitPage} />;
  }

  if (!page) {
    notFound();
  }

  return <ToolPageTemplate page={page} />;
}
