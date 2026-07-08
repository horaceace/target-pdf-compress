"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const localeLabels: Record<string, string> = {
  en: "English",
  hi: "हिन्दी",
  id: "Bahasa Indonesia"
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="locale-switcher" ref={ref}>
      <button
        className="locale-switcher__trigger"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch language"
      >
        <Globe size={16} />
        <span>{localeLabels[locale] || locale}</span>
      </button>
      {open && (
        <div className="locale-switcher__dropdown">
          {Object.entries(localeLabels).map(([code, label]) => (
            <button
              key={code}
              className={`locale-switcher__option${code === locale ? " locale-switcher__option--active" : ""}`}
              type="button"
              onClick={() => {
                router.replace(pathname, { locale: code });
                setOpen(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
