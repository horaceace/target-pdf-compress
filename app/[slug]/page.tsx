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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const page = toolPageMap.get(slug);

    if (!page) {
      return {};
    }

    return {
      title: page.title,
      description: page.description,
      alternates: {
        canonical: `/${page.slug}`
      },
      openGraph: {
        title: page.title,
        description: page.description,
        url: `https://filesmaller.space/${page.slug}`
      },
      twitter: {
        title: page.title,
        description: page.description
      }
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

  if (!page) {
    notFound();
  }

  return <ToolPageTemplate page={page} />;
}
