"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { JpgToPdfCard } from "@/components/jpg-to-pdf-card";
import { MergePdfCard } from "@/components/merge-pdf-card";
import { PdfToJpgCard } from "@/components/pdf-to-jpg-card";
import { RemovePdfPagesCard } from "@/components/remove-pdf-pages-card";
import { ReorderPdfCard } from "@/components/reorder-pdf-card";
import { RotatePdfCard } from "@/components/rotate-pdf-card";
import { SplitPdfCard } from "@/components/split-pdf-card";
import { UploadCard } from "@/components/upload-card";
import { WatermarkCard } from "@/components/watermark-card";
import { PageNumbersCard } from "@/components/page-numbers-card";
import { UnlockPdfCard } from "@/components/unlock-pdf-card";
import { ProtectPdfCard } from "@/components/protect-pdf-card";
import { trackEvent } from "@/lib/analytics/events";
import {
  FileDown,
  Combine,
  Scissors,
  RotateCw,
  Trash2,
  ArrowLeftRight,
  FileImage,
  Images,
  Type,
  Hash,
  LockOpen,
  Lock
} from "lucide-react";

type ToolKey =
  | "compress"
  | "merge"
  | "split"
  | "rotate"
  | "remove"
  | "reorder"
  | "pdf-to-jpg"
  | "jpg-to-pdf"
  | "watermark"
  | "page-numbers"
  | "unlock"
  | "protect";

type ToolGroupId = "optimize" | "organize" | "convert" | "secure";

const toolIcons: Record<ToolKey, typeof FileDown> = {
  compress: FileDown,
  merge: Combine,
  split: Scissors,
  rotate: RotateCw,
  remove: Trash2,
  reorder: ArrowLeftRight,
  "pdf-to-jpg": FileImage,
  "jpg-to-pdf": Images,
  watermark: Type,
  "page-numbers": Hash,
  unlock: LockOpen,
  protect: Lock
};

const toolGroups: Array<{ id: ToolGroupId; tools: ToolKey[] }> = [
  { id: "optimize", tools: ["compress"] },
  { id: "organize", tools: ["merge", "split", "rotate", "remove", "reorder"] },
  { id: "convert", tools: ["pdf-to-jpg", "jpg-to-pdf"] },
  { id: "secure", tools: ["watermark", "page-numbers", "unlock", "protect"] }
];

const tabKeyMap: Record<ToolKey, string> = {
  compress: "compress",
  merge: "merge",
  split: "split",
  rotate: "rotate",
  remove: "remove",
  reorder: "reorder",
  "pdf-to-jpg": "pdfToJpg",
  "jpg-to-pdf": "jpgToPdf",
  watermark: "watermark",
  "page-numbers": "pageNumbers",
  unlock: "unlock",
  protect: "protect"
};

export function HomeToolSwitcher() {
  const t = useTranslations("HomeToolSwitcher");
  const [activeTool, setActiveTool] = useState<ToolKey>("compress");

  const toolMeta = (key: ToolKey) => {
    const tab = tabKeyMap[key];
    return {
      key,
      label: t(`tabs.${tab}.label`),
      title: t(`tabs.${tab}.title`),
      copy: t(`tabs.${tab}.copy`)
    };
  };

  const activeMeta = toolMeta(activeTool);

  return (
    <div className="home-tool-switcher">
      <div className="home-tool-grid" role="tablist" aria-label={t("ariaLabel")}>
        {toolGroups.map((group) => (
          <section className="home-tool-group" key={group.id}>
            <div className="home-tool-group__label">{t(`groups.${group.id}`)}</div>
            <div
              className={`home-tool-group__items${
                group.id === "optimize" ? " home-tool-group__items--featured" : ""
              }`}
            >
              {group.tools.map((key) => {
                const item = toolMeta(key);
                const Icon = toolIcons[key];
                const isActive = activeTool === key;
                const isFeatured = key === "compress";
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={[
                      "home-tool-tab",
                      isActive ? "home-tool-tab--active" : "",
                      isFeatured ? "home-tool-tab--featured" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      trackEvent("tool_switch_clicked", {
                        source: "home_tool_switcher_tab",
                        tool: key,
                        label: item.title
                      });
                      setActiveTool(key);
                    }}
                  >
                    <Icon className="home-tool-tab__icon" aria-hidden="true" />
                    <strong>{item.label}</strong>
                    {isFeatured ? <span>{item.title}</span> : null}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="home-tool-switcher__meta">
        <strong>{activeMeta.title}</strong>
        <span>{activeMeta.copy}</span>
      </div>

      {activeTool === "compress" ? <UploadCard /> : null}
      {activeTool === "merge" ? <MergePdfCard /> : null}
      {activeTool === "split" ? <SplitPdfCard /> : null}
      {activeTool === "rotate" ? <RotatePdfCard /> : null}
      {activeTool === "remove" ? <RemovePdfPagesCard /> : null}
      {activeTool === "reorder" ? <ReorderPdfCard /> : null}
      {activeTool === "pdf-to-jpg" ? <PdfToJpgCard /> : null}
      {activeTool === "jpg-to-pdf" ? <JpgToPdfCard /> : null}
      {activeTool === "watermark" ? <WatermarkCard /> : null}
      {activeTool === "page-numbers" ? <PageNumbersCard /> : null}
      {activeTool === "unlock" ? <UnlockPdfCard /> : null}
      {activeTool === "protect" ? <ProtectPdfCard /> : null}
    </div>
  );
}
