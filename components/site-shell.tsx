import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/compress-pdf-for-upload", label: "For Upload" },
  { href: "/compress-resume-pdf", label: "Resume PDF" },
  { href: "/compress-pdf-for-email", label: "For Email" },
  { href: "/privacy", label: "Privacy" }
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="site-header">
        <div className="container site-header__row">
          <Link className="site-brand" href="/">
            Max PDF Compress
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
          <div className="site-brand">Max PDF Compress</div>
          <div className="site-footer__copy">
            Built for maximum PDF size reduction before upload and sharing.
          </div>
        </div>
      </footer>
    </div>
  );
}
