"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatBytes } from "@/lib/pdf/compress";
import { ReorderResult, prepareReorderPdf, reorderPdfPages } from "@/lib/pdf/reorder";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

type SelectedPdf = {
  file: File;
  pageCount: number;
};

type ReorderError = {
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

function normalizeReorderError(t: TFunc, error: unknown): ReorderError {
  if (!(error instanceof Error)) {
    return {
      title: t("errors.reorderFailed"),
      message: t("errors.reorderFailedMessage"),
      hint: t("errors.reorderFailedHint")
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

  if (lowered.includes("duplicate") || lowered.includes("page") || lowered.includes("range")) {
    return {
      title: t("errors.invalidOrder"),
      message: error.message,
      hint: t("errors.invalidOrderHint")
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
    title: t("errors.reorderFailed"),
    message: error.message,
    hint: t("errors.reorderFailedHint")
  };
}

export function ReorderPdfCard() {
  const t = useTranslations("ReorderPdfCard");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<SelectedPdf | null>(null);
  const [orderInput, setOrderInput] = useState("2,1");
  const [result, setResult] = useState<ReorderResult | null>(null);
  const [error, setError] = useState<ReorderError | null>(null);
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
        hint: "Upload a valid .pdf document before reordering pages."
      });
      return;
    }

    if (file.size === 0) {
      setSelected(null);
      setError({
        title: t("errors.emptyPdf"),
        message: `${file.name} ${t("errors.emptyPdfHint")}`,
        hint: "Use a PDF that contains actual pages before reordering."
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
      const prepared = await prepareReorderPdf(file);
      setSelected({
        file,
        pageCount: prepared.pageCount
      });
      setOrderInput(prepared.pageCount > 1 ? `2,1${prepared.pageCount > 2 ? `,3-${prepared.pageCount}` : ""}` : "1");
      setError(null);
    } catch (loadError) {
      setSelected(null);
      setError(normalizeReorderError(t, loadError));
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

  function reorderPages() {
    if (!selected) {
      setError({
        title: t("errors.noPdfSelected"),
        message: t("errors.noPdfSelectedHint"),
        hint: "Upload one PDF first, then enter the output page order."
      });
      return;
    }

    startTransition(async () => {
      try {
        const nextResult = await reorderPdfPages(selected.file, orderInput);
        setResult(nextResult);
        setError(null);
      } catch (reorderError) {
        setResult(null);
        setError(normalizeReorderError(t, reorderError));
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
            <label htmlFor="page-order">{t("newPageOrder")}</label>
            <input
              id="page-order"
              className="upload-mode__input"
              type="text"
              placeholder={t("orderPlaceholder")}
              value={orderInput}
              onChange={(event) => setOrderInput(event.target.value)}
            />
          </div>
          <div className="upload-mode__meta">
            <strong>{t("outputOrder")}</strong>
            <span>{t("orderHint")}</span>
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={!selected || isPending}
            onClick={reorderPages}
          >
            {isPending ? t("reordering") : t("reorderButton")}
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
              <span>{t("emptyStatOrder")}</span>
              <strong>{t("emptyStatOrderValue")}</strong>
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
                <span>{t("outputPages")}</span>
                <strong>{result.outputPageCount}</strong>
              </div>
              <div>
                <span>{t("newOrder")}</span>
                <strong>{result.orderLabels.join(", ")}</strong>
              </div>
            </div>
            <div className="upload-job__hint upload-job__hint--success">
              <strong>{t("reorderedLocally")}</strong>
              <span>{t("reorderedHint")}</span>
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
