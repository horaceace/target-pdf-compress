import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/compress-pdf", label: "Compress PDF" },
  { href: "/merge-pdf", label: "Merge PDF" },
  { href: "/split-pdf", label: "Split PDF" },
  { href: "/privacy", label: "Privacy" }
];

const footerGroups = [
  {
    title: "Tools",
    links: [
      { href: "/compress-pdf", label: "Compress PDF" },
      { href: "/merge-pdf", label: "Merge PDF" },
      { href: "/split-pdf", label: "Split PDF" }
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
  "Split page ranges before sending"
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
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
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
              Browser-first PDF tools for compressing, merging, and splitting documents before upload, sharing, and submission.
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
                    <Link key={link.href} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="container site-footer__bottom">
          <span>© 2026 FileSmaller. All Rights Reserved.</span>
          <span>Precision browser-first PDF tools for compression, merge, and split workflows.</span>
        </div>
      </footer>
    </div>
  );
}
