"use client";

import { ChangeEvent, DragEvent, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatBytes } from "@/lib/pdf/compress";
import { addPageNumbers, PageNumberPosition, PageNumbersResult } from "@/lib/pdf/page-numbers";

type PageNumbersError = {
  title: string;
  message: string;
};

const POSITIONS: PageNumberPosition[] = [
  "bottom-center",
  "bottom-right",
  "bottom-left",
  "top-center",
  "top-right",
  "top-left",
];

export function PageNumbersCard() {
  const t = useTranslations("PageNumbersCard");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [position, setPosition] = useState<PageNumberPosition>("bottom-center");
  const [startAt, setStartAt] = useState(1);
  const [prefix, setPrefix] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState("Helvetica");

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<PageNumbersError | null>(null);
  const [result, setResult] = useState<PageNumbersResult | null>(null);
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

  function applyPageNumbers() {
    if (!pdfFile) return;
    startTransition(async () => {
      try {
        setError(null);
        const pdfBytes = await pdfFile.arrayBuffer();
        const res = await addPageNumbers(pdfBytes, {
          position,
          startAt,
          prefix: prefix || undefined,
          fontSize,
          fontFamily: fontFamily as keyof typeof import("pdf-lib").StandardFonts,
        });
        setResult(res);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError({ title: t("errors.pageNumbersFailed"), message });
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

        {pdfFile && (
          <div className="watermark-controls">
            <div className="watermark-controls__row">
              <label className="watermark-field">
                <span>{t("positionLabel")}</span>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as PageNumberPosition)}
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {t(`positions.${pos.replace(/-/g, "")}`)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="watermark-field watermark-field--sm">
                <span>{t("startAtLabel")}</span>
                <input
                  type="number"
                  className="field"
                  min={1}
                  value={startAt}
                  onChange={(e) => setStartAt(Math.max(1, Number(e.target.value)))}
                />
              </label>
            </div>

            <div className="watermark-controls__row">
              <label className="watermark-field watermark-field--sm">
                <span>{t("prefixLabel")}</span>
                <input
                  type="text"
                  className="field"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder={t("prefixPlaceholder")}
                />
              </label>

              <label className="watermark-field watermark-field--sm">
                <span>{t("fontSizeLabel")} ({fontSize}pt)</span>
                <input
                  type="range"
                  min={6}
                  max={36}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
              </label>
            </div>

            <label className="watermark-field watermark-field--sm">
              <span>{t("fontFamilyLabel")}</span>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                <option value="Helvetica">Helvetica</option>
                <option value="HelveticaBold">Helvetica Bold</option>
                <option value="TimesRoman">Times Roman</option>
                <option value="TimesRomanBold">Times Roman Bold</option>
                <option value="Courier">Courier</option>
                <option value="CourierBold">Courier Bold</option>
              </select>
            </label>
          </div>
        )}

        {error && (
          <div className="tool-card__error">
            <strong>{error.title}</strong>
            <span>{error.message}</span>
          </div>
        )}

        {result && (
          <div className="tool-card__result">
            <p className="tool-card__result-title">{t("resultTitle")}</p>
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
            onClick={applyPageNumbers}
          >
            {isPending ? t("processing") : t("applyPageNumbers")}
          </button>
        </div>
      </div>
    </div>
  );
}
