"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
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
  "top-left"
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
          fontFamily: fontFamily as keyof typeof import("pdf-lib").StandardFonts
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

  return (
    <aside className="panel upload-card">
      <div className="upload-card__top">
        <div className="upload-card__header">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2>{t("heading")}</h2>
          <p>{t("description")}</p>
        </div>

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

        {pdfFile ? (
          <div className="upload-mode">
            <div className="upload-mode__row">
              <label htmlFor="page-numbers-position">{t("positionLabel")}</label>
              <select
                id="page-numbers-position"
                value={position}
                onChange={(e) => setPosition(e.target.value as PageNumberPosition)}
              >
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {t(`positions.${pos.replace(/-/g, "")}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="upload-mode__row">
              <label htmlFor="page-numbers-start">{t("startAtLabel")}</label>
              <input
                id="page-numbers-start"
                className="upload-mode__input"
                type="number"
                min={1}
                value={startAt}
                onChange={(e) => setStartAt(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <div className="upload-mode__row">
              <label htmlFor="page-numbers-prefix">{t("prefixLabel")}</label>
              <input
                id="page-numbers-prefix"
                className="upload-mode__input"
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder={t("prefixPlaceholder")}
              />
            </div>
            <div className="upload-mode__row">
              <label htmlFor="page-numbers-size">
                {t("fontSizeLabel")} ({fontSize}pt)
              </label>
              <input
                id="page-numbers-size"
                className="upload-mode__input"
                type="range"
                min={6}
                max={36}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>
            <div className="upload-mode__row">
              <label htmlFor="page-numbers-font">{t("fontFamilyLabel")}</label>
              <select
                id="page-numbers-font"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              >
                <option value="Helvetica">Helvetica</option>
                <option value="HelveticaBold">Helvetica Bold</option>
                <option value="TimesRoman">Times Roman</option>
                <option value="TimesRomanBold">Times Roman Bold</option>
                <option value="Courier">Courier</option>
                <option value="CourierBold">Courier Bold</option>
              </select>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="tool-card__error">
            <strong>{error.title}</strong>
            <span>{error.message}</span>
          </div>
        ) : null}

        {result ? (
          <div className="tool-card__result">
            <p className="tool-card__result-title">{t("resultTitle")}</p>
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
            onClick={applyPageNumbers}
          >
            {isPending ? t("processing") : t("applyPageNumbers")}
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
