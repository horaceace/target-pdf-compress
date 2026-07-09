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

export function HomeToolSwitcher() {
  const t = useTranslations("HomeToolSwitcher");
  const [activeTool, setActiveTool] = useState<ToolKey>("compress");

  const toolTabs: Array<{
    key: ToolKey;
    label: string;
    title: string;
    copy: string;
  }> = [
    {
      key: "compress",
      label: t("tabs.compress.label"),
      title: t("tabs.compress.title"),
      copy: t("tabs.compress.copy")
    },
    {
      key: "merge",
      label: t("tabs.merge.label"),
      title: t("tabs.merge.title"),
      copy: t("tabs.merge.copy")
    },
    {
      key: "split",
      label: t("tabs.split.label"),
      title: t("tabs.split.title"),
      copy: t("tabs.split.copy")
    },
    {
      key: "rotate",
      label: t("tabs.rotate.label"),
      title: t("tabs.rotate.title"),
      copy: t("tabs.rotate.copy")
    },
    {
      key: "remove",
      label: t("tabs.remove.label"),
      title: t("tabs.remove.title"),
      copy: t("tabs.remove.copy")
    },
    {
      key: "reorder",
      label: t("tabs.reorder.label"),
      title: t("tabs.reorder.title"),
      copy: t("tabs.reorder.copy")
    },
    {
      key: "pdf-to-jpg",
      label: t("tabs.pdfToJpg.label"),
      title: t("tabs.pdfToJpg.title"),
      copy: t("tabs.pdfToJpg.copy")
    },
    {
      key: "jpg-to-pdf",
      label: t("tabs.jpgToPdf.label"),
      title: t("tabs.jpgToPdf.title"),
      copy: t("tabs.jpgToPdf.copy")
    },
    {
      key: "watermark",
      label: t("tabs.watermark.label"),
      title: t("tabs.watermark.title"),
      copy: t("tabs.watermark.copy")
    },
    {
      key: "page-numbers",
      label: t("tabs.pageNumbers.label"),
      title: t("tabs.pageNumbers.title"),
      copy: t("tabs.pageNumbers.copy")
    },
    {
      key: "unlock",
      label: t("tabs.unlock.label"),
      title: t("tabs.unlock.title"),
      copy: t("tabs.unlock.copy")
    },
    {
      key: "protect",
      label: t("tabs.protect.label"),
      title: t("tabs.protect.title"),
      copy: t("tabs.protect.copy")
    }
  ];

  const activeMeta = toolTabs.find((item) => item.key === activeTool) ?? toolTabs[0];

  return (
    <div className="home-tool-switcher">
      <div className="home-tool-switcher__tabs" role="tablist" aria-label={t("ariaLabel")}>
        {toolTabs.map((item) => {
          const Icon = toolIcons[item.key];
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={activeTool === item.key}
              className={`home-tool-tab${activeTool === item.key ? " home-tool-tab--active" : ""}`}
              onClick={() => {
                trackEvent("tool_switch_clicked", {
                  source: "home_tool_switcher_tab",
                  tool: item.key,
                  label: item.title
                });
                setActiveTool(item.key);
              }}
            >
              <Icon className="home-tool-tab__icon" />
              <strong>{item.label}</strong>
              <span>{item.title}</span>
            </button>
          );
        })}
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
