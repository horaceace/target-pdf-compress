import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TrackedLink } from "@/components/tracked-link";
import { LocaleSwitcher } from "@/components/locale-switcher";

export async function SiteShell({ children }: { children: ReactNode }) {
  const t = await getTranslations("SiteShell");

  const toolNavItems = [
    { href: "/compress-pdf", label: t("toolCompressPdf") },
    { href: "/merge-pdf", label: t("toolMergePdf") },
    { href: "/split-pdf", label: t("toolSplitPdf") },
    { href: "/rotate-pdf", label: t("toolRotatePdf") },
    { href: "/remove-pdf-pages", label: t("toolRemovePages") },
    { href: "/reorder-pdf-pages", label: t("toolReorderPages") },
    { href: "/pdf-to-jpg", label: t("toolPdfToJpg") },
    { href: "/jpg-to-pdf", label: t("toolJpgToPdf") }
  ];

  const footerGroups = [
    {
      title: t("footerGroupTools"),
      links: [
        { href: "/compress-pdf", label: t("toolCompressPdf") },
        { href: "/merge-pdf", label: t("toolMergePdf") },
        { href: "/split-pdf", label: t("toolSplitPdf") },
        { href: "/rotate-pdf", label: t("toolRotatePdf") },
        { href: "/remove-pdf-pages", label: t("toolRemovePdfPages") },
        { href: "/reorder-pdf-pages", label: t("toolReorderPages") },
        { href: "/pdf-to-jpg", label: t("toolPdfToJpg") },
        { href: "/jpg-to-pdf", label: t("toolJpgToPdf") }
      ]
    },
    {
      title: t("footerGroupUseCases"),
      links: [
        { href: "/compress-pdf-for-upload", label: t("footerLinkForUploads") },
        { href: "/compress-pdf-for-email", label: t("footerLinkForEmail") },
        { href: "/split-pdf-for-upload", label: t("footerLinkSplitForUpload") }
      ]
    },
    {
      title: t("footerGroupCompany"),
      links: [
        { href: "/", label: t("navHome") },
        { href: "/privacy", label: t("navPrivacy") }
      ]
    }
  ];

  const footerHighlights = [
    t("footerHighlight1"),
    t("footerHighlight2"),
    t("footerHighlight3"),
    t("footerHighlight4"),
    t("footerHighlight5"),
    t("footerHighlight6"),
    t("footerHighlight7"),
    t("footerHighlight8")
  ];

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
            <Link href="/">{t("navHome")}</Link>
            <div className="site-nav__menu">
              <button className="site-nav__menu-trigger" type="button">
                {t("navTools")}
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
            <Link href="/privacy">{t("navPrivacy")}</Link>
            <LocaleSwitcher />
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
            <div className="site-footer__copy">{t("footerIntro")}</div>
            <div className="site-footer__meta">{t("footerMeta")}</div>
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
                      eventName={group.title === t("footerGroupTools") ? "tool_switch_clicked" : "site_link_clicked"}
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
          <span>{t("copyright")}</span>
          <LocaleSwitcher />
          <span>{t("footerTagline")}</span>
        </div>
      </footer>
    </div>
  );
}
