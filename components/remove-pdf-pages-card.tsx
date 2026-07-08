"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatBytes } from "@/lib/pdf/compress";
import {
  RemovePagesResult,
  prepareRemovePagesPdf,
  removePdfPages
} from "@/lib/pdf/remove-pages";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

type SelectedPdf = {
  file: File;
  pageCount: number;
};

type RemovePagesError = {
  title: string;
  message: string;
  hint?: string;
};

type TFunc = ReturnType<typeof useTranslations>;

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function normalizeRemoveError(t: TFunc, error: unknown): RemovePagesError {
  if (!(error instanceof Error)) {
    return {
      title: t("errors.removeFailed"),
      message: t("errors.removeFailedMessage"),
      hint: t("errors.removeFailedHint")
    };
  }

  const lowered = error.message.toLowerCase();

  if (lowered.includes("not a pdf")) {
    return {
      title: t("errors.unsupportedFile"),
      message: error.message,
      hint: t("errors.unsupportedFileHint")
    };
  }

  if (lowered.includes("empty")) {
    return {
      title: t("errors.emptyPdf"),
      message: error.message,
      hint: t("errors.emptyPdfHint")
    };
  }

  if (lowered.includes("page") || lowered.includes("range")) {
    return {
      title: t("errors.invalidSelection"),
      message: error.message,
      hint: t("errors.invalidSelectionHint")
    };
  }

  if (lowered.includes("encrypted") || lowered.includes("password")) {
    return {
      title: t("errors.protectedPdf"),
      message: t("errors.protectedPdfHint"),
      hint: "Unlock the file first, then upload it again."
    };
  }

  return {
    title: t("errors.removeFailed"),
    message: error.message,
    hint: t("errors.removeFailedHint")
  };
}

export function RemovePdfPagesCard() {
  const t = useTranslations("RemovePdfPagesCard");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<SelectedPdf | null>(null);
  const [pageInput, setPageInput] = useState("2");
  const [result, setResult] = useState<RemovePagesResult | null>(null);
  const [error, setError] = useState<RemovePagesError | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  function triggerPicker() {
    inputRef.current?.click();
  }

  async function loadFile(file: File) {
    setResult(null);

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSelected(null);
      setError({
        title: t("errors.unsupportedFile"),
        message: `${file.name} ${t("errors.unsupportedFileHint")}`,
        hint: "Upload a valid .pdf document before removing pages."
      });
      return;
    }

    if (file.size === 0) {
      setSelected(null);
      setError({
        title: t("errors.emptyPdf"),
        message: `${file.name} ${t("errors.emptyPdfHint")}`,
        hint: "Use a PDF that contains actual pages before removing pages."
      });
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setSelected(null);
      setError({
        title: t("errors.fileTooLarge"),
        message: `${file.name} is larger than 50 MB. Try a smaller PDF or split it first.`,
        hint: t("errors.fileTooLargeHint")
      });
      return;
    }

    try {
      const prepared = await prepareRemovePagesPdf(file);
      setSelected({
        file,
        pageCount: prepared.pageCount
      });
      setPageInput(prepared.pageCount > 1 ? "2" : "1");
      setError(null);
    } catch (loadError) {
      setSelected(null);
      setError(normalizeRemoveError(t, loadError));
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

  function removePages() {
    if (!selected) {
      setError({
        title: t("errors.noPdfSelected"),
        message: t("errors.noPdfSelectedHint"),
        hint: "Upload one PDF first, then enter the pages you want to remove."
      });
      return;
    }

    startTransition(async () => {
      try {
        const nextResult = await removePdfPages(selected.file, pageInput);
        setResult(nextResult);
        setError(null);
      } catch (removeError) {
        setResult(null);
        setError(normalizeRemoveError(t, removeError));
      }
    });
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
            <label htmlFor="remove-pages">{t("pagesToRemove")}</label>
            <input
              id="remove-pages"
              className="upload-mode__input"
              type="text"
              placeholder={t("pagesPlaceholder")}
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
            />
          </div>
          <div className="upload-mode__meta">
            <strong>{t("keepExcept")}</strong>
            <span>{t("removeHint")}</span>
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={!selected || isPending}
            onClick={removePages}
          >
            {isPending ? t("removing") : t("removeButton")}
          </button>
          <div className="upload-actions__secondary">
            <button
              type="button"
              className="button button--secondary"
              disabled={!selected || isPending}
              onClick={() => {
                setSelected(null);
                setResult(null);
                setError(null);
              }}
            >
              {t("clearFile")}
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={!result}
              onClick={() => {
                if (result) {
                  downloadBlob(result.blob, result.fileName);
                }
              }}
            >
              {t("downloadPdf")}
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
              <span>{t("emptyStatRemove")}</span>
              <strong>{t("emptyStatRemoveValue")}</strong>
            </div>
            <div>
              <span>{t("emptyStatOutput")}</span>
              <strong>{t("emptyStatOutputValue")}</strong>
            </div>
          </div>
          <p>{t("emptyText")}</p>
        </div>
      ) : null}

      {result ? (
        <div className="upload-job">
          <div className="upload-job__head">
            <div>
              <strong>{result.fileName}</strong>
              <span>{formatBytes(result.blob.size)} {t("outputPdf")}</span>
            </div>
            <span className="upload-job__status upload-job__status--success">{t("success")}</span>
          </div>
          <div className="upload-job__result">
            <div className="upload-job__stats">
              <div>
                <span>{t("originalPages")}</span>
                <strong>{result.originalPageCount}</strong>
              </div>
              <div>
                <span>{t("removed")}</span>
                <strong>{result.removedPageCount}</strong>
              </div>
              <div>
                <span>{t("remaining")}</span>
                <strong>{result.remainingPageCount}</strong>
              </div>
              <div>
                <span>{t("removedRanges")}</span>
                <strong>{result.removedLabels.join(", ")}</strong>
              </div>
            </div>
            <div className="upload-job__hint upload-job__hint--success">
              <strong>{t("removedLocally")}</strong>
              <span>{t("removedHint")}</span>
            </div>
            <div className="upload-job__actions">
              <button
                type="button"
                className="button button--primary"
                onClick={() => downloadBlob(result.blob, result.fileName)}
              >
                {t("downloadPdf")}
              </button>
            </div>
          </div>
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
