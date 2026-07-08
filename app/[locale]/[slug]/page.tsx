import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SplitPageTemplate } from "@/components/split-page-template";
import { ToolPageTemplate } from "@/components/tool-page-template";
import { toolPages, toolPageMap } from "@/content/tool-pages";
import { splitToolPages, splitToolPageMap } from "@/content/split-pages";

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
        alternates: {
          canonical: `/${splitPage.slug}`
        },
        openGraph: {
          title: splitPage.title,
          description: splitPage.description,
          url: `https://filesmaller.space/${splitPage.slug}`
        },
        twitter: {
          title: splitPage.title,
          description: splitPage.description
        }
      };
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
