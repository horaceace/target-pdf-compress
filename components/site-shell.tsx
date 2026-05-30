import Link from "next/link";
import { ReactNode } from "react";
import { TrackedLink } from "@/components/tracked-link";

const toolNavItems = [
  { href: "/compress-pdf", label: "Compress PDF" },
  { href: "/merge-pdf", label: "Merge PDF" },
  { href: "/split-pdf", label: "Split PDF" },
  { href: "/rotate-pdf", label: "Rotate PDF" },
  { href: "/remove-pdf-pages", label: "Remove Pages" },
  { href: "/reorder-pdf-pages", label: "Reorder Pages" },
  { href: "/pdf-to-jpg", label: "PDF to JPG" },
  { href: "/jpg-to-pdf", label: "JPG to PDF" }
];

const footerGroups = [
  {
    title: "Tools",
    links: [
      { href: "/compress-pdf", label: "Compress PDF" },
      { href: "/merge-pdf", label: "Merge PDF" },
      { href: "/split-pdf", label: "Split PDF" },
      { href: "/rotate-pdf", label: "Rotate PDF" },
      { href: "/remove-pdf-pages", label: "Remove PDF Pages" },
      { href: "/reorder-pdf-pages", label: "Reorder PDF Pages" },
      { href: "/pdf-to-jpg", label: "PDF to JPG" },
      { href: "/jpg-to-pdf", label: "JPG to PDF" }
    ]
  },
  {
    title: "Use Cases",
    links: [
      { href: "/compress-pdf-for-upload", label: "For Uploads" },
      { href: "/compress-pdf-for-email", label: "For Email" },
      { href: "/split-pdf-for-upload", label: "Split for Upload" }
    ]
  },
  {
    title: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/privacy", label: "Privacy" }
    ]
  }
];

const footerHighlights = [
  "Compress for uploads and attachments",
  "Merge multiple PDFs into one file",
  "Split page ranges before sending",
  "Rotate sideways PDF pages",
  "Remove unwanted PDF pages",
  "Reorder pages before export",
  "Convert PDF pages to JPG",
  "Turn JPG images into one PDF"
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="site-header">
        <div className="container site-header__row">
          <Link className="site-brand" href="/">
            <span className="site-brand__mark" aria-hidden="true">
              <span className="site-brand__glyph" />
            </span>
            <span>FileSmaller</span>
          </Link>
          <nav className="site-nav" aria-label="Main navigation">
            <Link href="/">Home</Link>
            <div className="site-nav__menu">
              <button className="site-nav__menu-trigger" type="button">
                Tools
              </button>
              <div className="site-nav__dropdown">
                {toolNavItems.map((item) => (
                  <TrackedLink
                    eventParams={{
                      source: "header_tools_dropdown",
                      tool: item.href.replace("/", ""),
                      label: item.label
                    }}
                    key={item.href}
                    href={item.href}
                  >
                    {item.label}
                  </TrackedLink>
                ))}
              </div>
            </div>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div className="container site-footer__layout">
          <div className="site-footer__intro">
            <div className="site-brand">
              <span className="site-brand__mark" aria-hidden="true">
                <span className="site-brand__glyph" />
              </span>
              <span>FileSmaller</span>
            </div>
            <div className="site-footer__copy">
              Browser-first PDF and image tools for compressing, merging, splitting, and converting documents before upload, sharing, and submission.
            </div>
            <div className="site-footer__meta">No login. No install. Built for fast document tasks.</div>
            <div className="site-footer__badges">
              {footerHighlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="site-footer__groups">
            {footerGroups.map((group) => (
              <div className="site-footer__group" key={group.title}>
                <strong>{group.title}</strong>
                <div className="site-footer__links">
                  {group.links.map((link) => (
                    <TrackedLink
                      eventName={group.title === "Tools" ? "tool_switch_clicked" : "site_link_clicked"}
                      eventParams={{
                        source: `footer_${group.title.toLowerCase().replaceAll(" ", "_")}`,
                        tool: link.href.replace("/", "") || "home",
                        label: link.label
                      }}
                      key={link.href}
                      href={link.href}
                    >
                      {link.label}
                    </TrackedLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="container site-footer__bottom">
          <span>© 2026 FileSmaller. All Rights Reserved.</span>
          <span>Precision browser-first document tools for compression, merge, split, and conversion workflows.</span>
        </div>
      </footer>
    </div>
  );
}
