"use client";

import { useState } from "react";
import { JpgToPdfCard } from "@/components/jpg-to-pdf-card";
import { MergePdfCard } from "@/components/merge-pdf-card";
import { PdfToJpgCard } from "@/components/pdf-to-jpg-card";
import { RemovePdfPagesCard } from "@/components/remove-pdf-pages-card";
import { ReorderPdfCard } from "@/components/reorder-pdf-card";
import { RotatePdfCard } from "@/components/rotate-pdf-card";
import { SplitPdfCard } from "@/components/split-pdf-card";
import { UploadCard } from "@/components/upload-card";
import { trackEvent } from "@/lib/analytics/events";

type ToolKey =
  | "compress"
  | "merge"
  | "split"
  | "rotate"
  | "remove"
  | "reorder"
  | "pdf-to-jpg"
  | "jpg-to-pdf";

const toolTabs: Array<{
  key: ToolKey;
  label: string;
  title: string;
  copy: string;
}> = [
  {
    key: "compress",
    label: "Compress",
    title: "Compress PDF",
    copy: "Reduce file size for uploads, portals, attachments, and image-heavy scans."
  },
  {
    key: "merge",
    label: "Merge",
    title: "Merge PDF",
    copy: "Combine multiple PDF files into one clean document before sending or compressing."
  },
  {
    key: "split",
    label: "Split",
    title: "Split PDF",
    copy: "Extract page ranges from one PDF and export smaller files for uploads or follow-up compression."
  },
  {
    key: "rotate",
    label: "Rotate",
    title: "Rotate PDF",
    copy: "Turn sideways or upside-down pages upright before submitting or merging."
  },
  {
    key: "remove",
    label: "Remove",
    title: "Remove PDF pages",
    copy: "Delete blank, duplicate, or unnecessary pages before uploading a cleaner PDF."
  },
  {
    key: "reorder",
    label: "Reorder",
    title: "Reorder PDF pages",
    copy: "Move pages into the right sequence before export, merge, or compression."
  },
  {
    key: "pdf-to-jpg",
    label: "PDF to JPG",
    title: "PDF to JPG",
    copy: "Export one JPG per PDF page for previews, sharing, uploads, and visual extraction."
  },
  {
    key: "jpg-to-pdf",
    label: "JPG to PDF",
    title: "JPG to PDF",
    copy: "Combine screenshots, scans, and image files into one PDF document in the browser."
  }
];

export function HomeToolSwitcher() {
  const [activeTool, setActiveTool] = useState<ToolKey>("compress");
  const activeMeta = toolTabs.find((item) => item.key === activeTool) ?? toolTabs[0];

  return (
    <div className="home-tool-switcher">
      <div className="home-tool-switcher__tabs" role="tablist" aria-label="Choose PDF tool">
        {toolTabs.map((item) => (
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
            <strong>{item.label}</strong>
            <span>{item.title}</span>
          </button>
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
    </div>
  );
}
