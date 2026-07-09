"use client";

import { ChangeEvent, DragEvent, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatBytes } from "@/lib/pdf/compress";
import { unlockPdf, UnlockResult } from "@/lib/pdf/unlock";

type UnlockError = {
  title: string;
  message: string;
};

export function UnlockPdfCard() {
  const t = useTranslations("UnlockPdfCard");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<UnlockError | null>(null);
  const [result, setResult] = useState<UnlockResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function triggerPicker() {
    inputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setError(null);
      setResult(null);
    }
    event.target.value = "";
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setPdfFile(file);
      setError(null);
      setResult(null);
    }
  }

  function handleUnlock() {
    if (!pdfFile) return;
    startTransition(async () => {
      try {
        setError(null);
        const pdfBytes = await pdfFile.arrayBuffer();
        const res = await unlockPdf(pdfBytes);
        setResult(res);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const lowered = message.toLowerCase();
        if (lowered.includes("password") || lowered.includes("encrypt")) {
          setError({
            title: t("errors.passwordProtected"),
            message: t("errors.passwordProtectedHint"),
          });
        } else {
          setError({ title: t("errors.unlockFailed"), message });
        }
      }
    });
  }

  function downloadResult() {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  const dropzoneContent = pdfFile ? (
    <div className="dropzone-uploaded">
      <p className="dropzone-file-name">{pdfFile.name}</p>
      <p className="dropzone-file-meta">
        <span>{formatBytes(pdfFile.size)}</span>
        <span> · PDF</span>
      </p>
      <button
        className="button button--outline button--sm"
        type="button"
        onClick={() => {
          setPdfFile(null);
          setResult(null);
          setError(null);
        }}
      >
        {t("removeFile")}
      </button>
    </div>
  ) : (
    <button className="dropzone-trigger" type="button" onClick={triggerPicker}>
      <p className="dropzone-title">{t("dropzoneTitle")}</p>
      <p className="dropzone-hint">{t("dropzoneHint")}</p>
    </button>
  );

  return (
    <div className="panel tool-card">
      <div>
        <aside className="capability-callout capability-callout--inline" role="note">
          <strong>{t("heading")}</strong>
          <span>{t("capabilityNote")}</span>
        </aside>
        <div
          className={`dropzone ${isDragging ? "dropzone--dragging" : ""} ${pdfFile ? "dropzone--filled" : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="dropzone-input"
            onChange={handleFileChange}
          />
          {dropzoneContent}
        </div>

        {error && (
          <div className="tool-card__error">
            <strong>{error.title}</strong>
            <span>{error.message}</span>
          </div>
        )}

        {result && (
          <div className="tool-card__result">
            <p className="tool-card__result-title">
              {result.wasEncrypted ? t("resultTitleUnlocked") : t("resultTitleNotEncrypted")}
            </p>
            <p className="tool-card__result-meta">
              {t("resultPages", { count: result.pageCount })} ·{" "}
              {t("resultSize", {
                original: formatBytes(result.originalBytes),
                output: formatBytes(result.outputBytes),
              })}
            </p>
            <button
              className="button button--primary"
              type="button"
              onClick={downloadResult}
            >
              {t("downloadButton")}
            </button>
          </div>
        )}

        <div className="tool-card__actions">
          <button
            className="button button--primary"
            type="button"
            disabled={!pdfFile || isPending}
            onClick={handleUnlock}
          >
            {isPending ? t("processing") : t("unlockPdf")}
          </button>
        </div>
      </div>
    </div>
  );
}
