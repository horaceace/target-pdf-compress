"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatBytes } from "@/lib/pdf/compress";
import { downloadFilesAsZip } from "@/lib/download/download-zip";
import {
  PageRange,
  SplitResultItem,
  parsePageRanges,
  prepareSplitPdf,
  splitPdfByRanges
} from "@/lib/pdf/split";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

type SelectedPdf = {
  file: File;
  pageCount: number;
};

type SplitCardError = {
  title: string;
  message: string;
  hint?: string;
};

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SplitPdfCard() {
  const t = useTranslations("SplitPdfCard");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<SelectedPdf | null>(null);
  const [rangeInput, setRangeInput] = useState("1");
  const [parsedRanges, setParsedRanges] = useState<PageRange[]>([]);
  const [results, setResults] = useState<SplitResultItem[]>([]);
  const [error, setError] = useState<SplitCardError | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  function resetResults() {
    setResults([]);
    setParsedRanges([]);
    setError(null);
  }

  function normalizeSplitError(splitError: unknown): SplitCardError {
    if (!(splitError instanceof Error)) {
      return {
        title: t("errors.splitFailed"),
        message: t("errors.splitFailedMessage"),
        hint: t("errors.splitFailedHint")
      };
    }

    const lowered = splitError.message.toLowerCase();

    if (lowered.includes("not a pdf")) {
      return {
        title: t("errors.unsupportedFile"),
        message: splitError.message,
        hint: t("errors.unsupportedFileHint")
      };
    }

    if (lowered.includes("empty")) {
      return {
        title: t("errors.emptyPdf"),
        message: splitError.message,
        hint: t("errors.emptyPdfHint")
      };
    }

    if (lowered.includes("page range") || lowered.includes("page ") || lowered.includes("range")) {
      return {
        title: t("errors.invalidRanges"),
        message: splitError.message,
        hint: t("errors.invalidRangesHint")
      };
    }

    if (lowered.includes("encrypted") || lowered.includes("password")) {
      return {
        title: t("errors.protectedPdf"),
        message: t("errors.protectedPdfHint"),
        hint: undefined
      };
    }

    return {
      title: t("errors.splitFailed"),
      message: splitError.message,
      hint: t("errors.splitFailedHint")
    };
  }

  function triggerPicker() {
    inputRef.current?.click();
  }

  async function loadFile(file: File) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSelected(null);
      setError({
        title: t("errors.unsupportedFile"),
        message: `${file.name} ${t("errors.unsupportedFileHint")}`,
        hint: undefined
      });
      return;
    }

    if (file.size === 0) {
      setSelected(null);
      setError({
        title: t("errors.emptyPdf"),
        message: `${file.name} ${t("errors.emptyPdfHint")}`,
        hint: undefined
      });
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setSelected(null);
      setError({
        title: t("errors.fileTooLarge"),
        message: `${file.name} is larger than 50 MB. ${t("errors.fileTooLargeHint")}`,
        hint: undefined
      });
      return;
    }

    try {
      const prepared = await prepareSplitPdf(file);
      setSelected({
        file,
        pageCount: prepared.pageCount
      });
      setRangeInput(prepared.pageCount > 1 ? `1-${prepared.pageCount}` : "1");
      resetResults();
    } catch (loadError) {
      setSelected(null);
      setError(normalizeSplitError(loadError));
    }
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.[0]) {
      void loadFile(event.target.files[0]);
      event.target.value = "";
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files?.[0]) {
      void loadFile(event.dataTransfer.files[0]);
    }
  }

  function splitCurrentPdf() {
    if (!selected) {
      setError({
        title: t("errors.noPdfSelected"),
        message: t("errors.noPdfSelectedHint"),
        hint: undefined
      });
      return;
    }

    startTransition(async () => {
      try {
        const ranges = parsePageRanges(rangeInput, selected.pageCount);
        const nextResults = await splitPdfByRanges(selected.file, ranges);
        setParsedRanges(ranges);
        setResults(nextResults);
        setError(null);
      } catch (splitError) {
        setResults([]);
        setParsedRanges([]);
        setError(normalizeSplitError(splitError));
      }
    });
  }

  function downloadAll() {
    if (!selected || !results.length) {
      return;
    }

    void downloadFilesAsZip(
      `${selected.file.name.replace(/\.pdf$/i, "") || "split-pdf"}-split-files.zip`,
      results.map((item) => ({
        fileName: item.fileName,
        blob: item.blob
      }))
    );
  }

  const totalOutputBytes = results.reduce((sum, item) => sum + item.blob.size, 0);
  const totalOutputPages = results.reduce(
    (sum, item) => sum + (item.pageEnd - item.pageStart + 1),
    0
  );

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
          onDragEnter={(event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onClick={triggerPicker}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              triggerPicker();
            }
          }}
        >
          <strong>{t("dropzoneHeading")}</strong>
          <span>{t("dropzoneSubtext")}</span>
          <small>{t("dropzoneHint")}</small>
          <input
            ref={inputRef}
            className="upload-dropzone__input"
            type="file"
            accept="application/pdf,.pdf"
            onChange={onChange}
          />
        </div>

        {selected ? (
          <div className="upload-summary">
            <div>
              <strong>{selected.file.name}</strong>
              <span>{t("selectedFile")}</span>
            </div>
            <div>
              <strong>{formatBytes(selected.file.size)}</strong>
              <span>{t("fileSize")}</span>
            </div>
            <div>
              <strong>{selected.pageCount}</strong>
              <span>{t("totalPages")}</span>
            </div>
          </div>
        ) : null}

        <div className="upload-mode">
          <div className="upload-mode__row">
            <label htmlFor="page-ranges">{t("pageRanges")}</label>
            <input
              id="page-ranges"
              className="upload-mode__input"
              type="text"
              placeholder={t("pageRangesPlaceholder")}
              value={rangeInput}
              onChange={(event) => setRangeInput(event.target.value)}
            />
          </div>
          <div className="upload-mode__meta">
            <strong>{t("splitByRanges")}</strong>
            <span>{t("rangesHint")}</span>
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={!selected || isPending}
            onClick={splitCurrentPdf}
          >
            {isPending ? t("splitting") : t("splitButton")}
          </button>
          <div className="upload-actions__secondary">
            <button
              type="button"
              className="button button--secondary"
              disabled={!selected || isPending}
              onClick={() => {
                setSelected(null);
                setRangeInput("1");
                resetResults();
              }}
            >
              {t("clearFile")}
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={!results.length}
              onClick={downloadAll}
            >
              {t("downloadZip")}
            </button>
          </div>
        </div>
      </div>

      {!selected ? (
        <div className="upload-empty">
          <div className="upload-empty__badge">{t("emptyBadge")}</div>
          <div className="upload-empty__grid">
            <div>
              <span>{t("emptyStatInput")}</span>
              <strong>{t("emptyStatInputValue")}</strong>
            </div>
            <div>
              <span>{t("emptyStatRanges")}</span>
              <strong>{t("emptyStatRangesValue")}</strong>
            </div>
            <div>
              <span>{t("emptyStatOutput")}</span>
              <strong>{t("emptyStatOutputValue")}</strong>
            </div>
          </div>
          <p>{t("emptyText")}</p>
        </div>
      ) : null}

      {parsedRanges.length ? (
        <div className="upload-job__hint">
          <strong>{parsedRanges.length} {t("rangesReady")}</strong>
          <span>
            {parsedRanges.map((range) => (range.start === range.end ? `${range.start}` : `${range.start}-${range.end}`)).join(", ")}
          </span>
        </div>
      ) : null}

      {results.length ? (
        <div className="upload-summary">
          <div>
            <strong>{results.length}</strong>
            <span>{t("splitFiles")}</span>
          </div>
          <div>
            <strong>{formatBytes(totalOutputBytes)}</strong>
            <span>{t("combinedOutputSize")}</span>
          </div>
          <div>
            <strong>{totalOutputPages}</strong>
            <span>{t("exportedPages")}</span>
          </div>
          <div>
            <strong>{parsedRanges.map((range) => range.start === range.end ? `${range.start}` : `${range.start}-${range.end}`).join(", ")}</strong>
            <span>{t("exportedRanges")}</span>
          </div>
        </div>
      ) : null}

      {results.length ? (
        <div className="upload-jobs">
          {results.map((item) => (
            <article className="upload-job" key={item.id}>
              <div className="upload-job__head">
                <div>
                  <strong>{item.fileName}</strong>
                  <span>{item.label}</span>
                </div>
                <span className="upload-job__status upload-job__status--success">{t("ready")}</span>
              </div>
              <div className="upload-job__stats">
                <div>
                  <span>{t("pages")}</span>
                  <strong>{item.pageStart === item.pageEnd ? item.pageStart : `${item.pageStart}-${item.pageEnd}`}</strong>
                </div>
                <div>
                  <span>{t("outputSize")}</span>
                  <strong>{formatBytes(item.blob.size)}</strong>
                </div>
                <div>
                  <span>{t("totalPagesLabel")}</span>
                  <strong>{item.pageTotal}</strong>
                </div>
              </div>
              <div className="upload-job__actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => downloadBlob(item.blob, item.fileName)}
                >
                  {t("downloadPdf")}
                </button>
                <a className="button button--secondary" href="/compress-pdf">
                  {t("compressNext")}
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {results.length ? (
        <div className="upload-job__next-step">
          <strong>{t("recommendedNextStep")}</strong>
          <span>{t("nextStepCopy")}</span>
        </div>
      ) : null}

      {selected ? (
        <div className="upload-job__hint upload-job__hint--neutral">
          <strong>{selected.pageCount} {t("totalPagesLoaded")}</strong>
          <span>{t("splitHint")}</span>
        </div>
      ) : null}

      {error ? (
        <div className="upload-job__error">
          <strong>{error.title}</strong>
          <span>{error.message}</span>
          {error.hint ? <small>{error.hint}</small> : null}
        </div>
      ) : null}
    </aside>
  );
}
