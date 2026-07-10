import { Link } from "@/i18n/navigation";

export type CoreToolKey =
  | "compress-pdf"
  | "merge-pdf"
  | "split-pdf"
  | "pdf-to-jpg"
  | "jpg-to-pdf"
  | "rotate-pdf"
  | "remove-pdf-pages"
  | "reorder-pdf-pages"
  | "watermark-pdf"
  | "page-numbers-pdf"
  | "unlock-pdf"
  | "protect-pdf";

const TOOL_META: Record<
  CoreToolKey,
  { href: `/${string}`; label: string; blurb: string }
> = {
  "compress-pdf": {
    href: "/compress-pdf",
    label: "Compress PDF",
    blurb: "Shrink PDF size for email and uploads"
  },
  "merge-pdf": {
    href: "/merge-pdf",
    label: "Merge PDF",
    blurb: "Combine multiple PDFs into one file"
  },
  "split-pdf": {
    href: "/split-pdf",
    label: "Split PDF",
    blurb: "Extract page ranges into smaller PDFs"
  },
  "pdf-to-jpg": {
    href: "/pdf-to-jpg",
    label: "PDF to JPG",
    blurb: "Export PDF pages as images"
  },
  "jpg-to-pdf": {
    href: "/jpg-to-pdf",
    label: "JPG to PDF",
    blurb: "Turn images into a single PDF"
  },
  "rotate-pdf": {
    href: "/rotate-pdf",
    label: "Rotate PDF",
    blurb: "Fix sideways or upside-down pages"
  },
  "remove-pdf-pages": {
    href: "/remove-pdf-pages",
    label: "Remove PDF Pages",
    blurb: "Delete unwanted pages before sending"
  },
  "reorder-pdf-pages": {
    href: "/reorder-pdf-pages",
    label: "Reorder Pages",
    blurb: "Rearrange page order in the browser"
  },
  "watermark-pdf": {
    href: "/watermark-pdf",
    label: "Watermark PDF",
    blurb: "Stamp text on every page"
  },
  "page-numbers-pdf": {
    href: "/page-numbers-pdf",
    label: "Page Numbers",
    blurb: "Add page numbers for print-ready files"
  },
  "unlock-pdf": {
    href: "/unlock-pdf",
    label: "Unlock PDF",
    blurb: "Remove password restrictions you know"
  },
  "protect-pdf": {
    href: "/protect-pdf",
    label: "Protect PDF",
    blurb: "Add a password before sharing"
  }
};

/** Minimal internal-link matrix from SEO plan FS-3 */
export const CORE_TOOL_RELATED: Record<CoreToolKey, CoreToolKey[]> = {
  "compress-pdf": ["merge-pdf", "split-pdf", "pdf-to-jpg", "jpg-to-pdf"],
  "merge-pdf": ["compress-pdf", "split-pdf", "reorder-pdf-pages"],
  "split-pdf": ["compress-pdf", "merge-pdf", "remove-pdf-pages"],
  "pdf-to-jpg": ["compress-pdf", "jpg-to-pdf", "split-pdf"],
  "jpg-to-pdf": ["compress-pdf", "pdf-to-jpg", "merge-pdf"],
  "rotate-pdf": ["remove-pdf-pages", "reorder-pdf-pages", "compress-pdf"],
  "remove-pdf-pages": ["rotate-pdf", "reorder-pdf-pages", "split-pdf"],
  "reorder-pdf-pages": ["rotate-pdf", "remove-pdf-pages", "merge-pdf"],
  "watermark-pdf": ["page-numbers-pdf", "protect-pdf", "compress-pdf"],
  "page-numbers-pdf": ["watermark-pdf", "protect-pdf", "compress-pdf"],
  "unlock-pdf": ["protect-pdf", "compress-pdf", "merge-pdf"],
  "protect-pdf": ["unlock-pdf", "watermark-pdf", "compress-pdf"]
};

export function CoreToolRelated({ current }: { current: CoreToolKey }) {
  const related = CORE_TOOL_RELATED[current]
    .map((key) => TOOL_META[key])
    .filter(Boolean);

  if (related.length === 0) return null;

  return (
    <section
      className="related-core-tools"
      aria-labelledby="related-core-tools-heading"
    >
      <h2 id="related-core-tools-heading" className="section-title">
        Related PDF tools
      </h2>
      <p className="section-lead">
        Free browser tools that pair with this workflow. Files stay on your
        device.
      </p>
      <div className="related-links">
        {related.map((item) => (
          <Link className="related-link" href={item.href} key={item.href}>
            <strong>{item.label}</strong>
            <span>{item.blurb}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
