import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/compress-pdf-to-200kb", label: "200KB" },
  { href: "/compress-pdf-to-500kb", label: "500KB" },
  { href: "/compress-pdf-to-1mb", label: "1MB" },
  { href: "/privacy", label: "Privacy" }
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="site-header">
        <div className="container site-header__row">
          <Link className="site-brand" href="/">
            Target PDF Compress
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
        <div className="container site-footer__row">
          <div className="site-brand">Target PDF Compress</div>
          <div className="site-footer__copy">
            Built for upload limits, forms, and email attachments.
          </div>
        </div>
      </footer>
    </div>
  );
}
