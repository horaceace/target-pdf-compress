"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
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

  function setFile(file: File | null) {
    setPdfFile(file);
    setError(null);
    setResult(null);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file) setFile(file);
    event.target.value = "";
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) setFile(file);
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
            message: t("errors.passwordProtectedHint")
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

  return (
    <aside className="panel upload-card">
      <div className="upload-card__top">
        {/* Home switcher already shows title/copy under Secure & mark — keep card compact */}
        <aside className="capability-callout capability-callout--inline" role="note">
          <span>{t("capabilityNote")}</span>
        </aside>

        <div
          className={`upload-dropzone${isDragging ? " upload-dropzone--active" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!pdfFile) triggerPicker();
          }}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            if ((event.key === "Enter" || event.key === " ") && !pdfFile) {
              event.preventDefault();
              triggerPicker();
            }
          }}
        >
          {pdfFile ? (
            <>
              <strong>{pdfFile.name}</strong>
              <span>
                {formatBytes(pdfFile.size)} · PDF
              </span>
              <small>{t("dropzoneHint")}</small>
            </>
          ) : (
            <>
              <strong>{t("dropzoneTitle")}</strong>
              <span>{t("dropzoneHint")}</span>
            </>
          )}
          <input
            ref={inputRef}
            className="upload-dropzone__input"
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
          />
        </div>

        {error ? (
          <div className="tool-card__error">
            <strong>{error.title}</strong>
            <span>{error.message}</span>
          </div>
        ) : null}

        {result ? (
          <div className="tool-card__result">
            <p className="tool-card__result-title">
              {result.wasEncrypted ? t("resultTitleUnlocked") : t("resultTitleNotEncrypted")}
            </p>
            <p className="tool-card__result-meta">
              {t("resultPages", { count: result.pageCount })} ·{" "}
              {t("resultSize", {
                original: formatBytes(result.originalBytes),
                output: formatBytes(result.outputBytes)
              })}
            </p>
            <button className="button button--primary" type="button" onClick={downloadResult}>
              {t("downloadButton")}
            </button>
          </div>
        ) : null}

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={!pdfFile || isPending}
            onClick={handleUnlock}
          >
            {isPending ? t("processing") : t("unlockPdf")}
          </button>
          <div className="upload-actions__secondary">
            <button
              type="button"
              className="button button--secondary"
              disabled={!pdfFile || isPending}
              onClick={() => setFile(null)}
            >
              {t("removeFile")}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
