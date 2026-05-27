import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageTemplate } from "@/components/tool-page-template";
import { toolPages, toolPageMap } from "@/content/tool-pages";

export function generateStaticParams() {
  return toolPages.map((page) => ({ slug: page.slug }));
}

export function generateMetadata({
  params
}: {
  params: { slug: string };
}): Metadata {
  const page = toolPageMap.get(params.slug);

  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description
  };
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const page = toolPageMap.get(params.slug);

  if (!page) {
    notFound();
  }

  return <ToolPageTemplate page={page} />;
}
