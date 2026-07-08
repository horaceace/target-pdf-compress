"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatBytes } from "@/lib/pdf/compress";
import { MergeResult, mergePdfFiles } from "@/lib/pdf/merge";

type MergeItem = {
  id: string;
  file: File;
};

type MergeCardError = {
  title: string;
  message: string;
  hint?: string;
};

function fileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function MergePdfCard() {
  const t = useTranslations("MergePdfCard");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<MergeItem[]>([]);
  const [error, setError] = useState<MergeCardError | null>(null);
  const [result, setResult] = useState<MergeResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  function normalizeMergeError(mergeError: unknown): MergeCardError {
    if (!(mergeError instanceof Error)) {
      return {
        title: t("errors.mergeFailed"),
        message: t("errors.mergeFailedMessage"),
        hint: t("errors.mergeFailedHint")
      };
    }

    const lowered = mergeError.message.toLowerCase();

    if (lowered.includes("at least two")) {
      return {
        title: t("errors.needMoreFiles"),
        message: mergeError.message,
        hint: t("errors.needMoreFilesHint")
      };
    }

    if (lowered.includes("not a pdf")) {
      return {
        title: t("errors.unsupportedFile"),
        message: mergeError.message,
        hint: t("errors.unsupportedFileHint")
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
      title: t("errors.mergeFailed"),
      message: mergeError.message,
      hint: t("errors.mergeFailedHint")
    };
  }

  function triggerPicker() {
    inputRef.current?.click();
  }

  function addFiles(fileList: FileList | File[]) {
    const next = Array.from(fileList).map((file) => ({
      id: fileId(file),
      file
    }));

    setItems((current) => [...current, ...next]);
    setError(null);
    setResult(null);
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) {
      addFiles(event.target.files);
      event.target.value = "";
    }
  }

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) {
      return;
    }

    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function download(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function mergeAll() {
    startTransition(async () => {
      try {
        const result = await mergePdfFiles(items.map((item) => item.file));
        setError(null);
        setResult(result);
        download(result.blob, result.fileName);
      } catch (mergeError) {
        setError(normalizeMergeError(mergeError));
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
          onDragEnter={(event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (event.dataTransfer.files?.length) {
              addFiles(event.dataTransfer.files);
            }
          }}
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
            multiple
            onChange={onChange}
          />
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={items.length < 2 || isPending}
            onClick={mergeAll}
          >
            {isPending ? t("merging") : t("mergeButton")}
          </button>
          <div className="upload-actions__secondary">
            <button
              type="button"
              className="button button--secondary"
              disabled={!items.length || isPending}
              onClick={() => setItems([])}
            >
              {t("clearList")}
            </button>
          </div>
        </div>
      </div>

      {items.length ? (
        <div className="upload-jobs">
          {items.map((item, index) => (
            <article className="upload-job" key={item.id}>
              <div className="upload-job__head">
                <div>
                  <strong>{item.file.name}</strong>
                  <span>{formatBytes(item.file.size)}</span>
                </div>
                <span className="upload-job__status upload-job__status--queued">#{index + 1}</span>
              </div>
              <div className="upload-job__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={index === 0}
                  onClick={() => moveItem(index, -1)}
                >
                  {t("moveUp")}
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, 1)}
                >
                  {t("moveDown")}
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => removeItem(item.id)}
                >
                  {t("remove")}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="upload-empty">
          <div className="upload-empty__badge">{t("emptyBadge")}</div>
          <div className="upload-empty__grid">
            <div>
              <span>{t("emptyStatFiles")}</span>
              <strong>{t("emptyStatFilesValue")}</strong>
            </div>
            <div>
              <span>{t("emptyStatOutput")}</span>
              <strong>{t("emptyStatOutputValue")}</strong>
            </div>
            <div>
              <span>{t("emptyStatOrder")}</span>
              <strong>{t("emptyStatOrderValue")}</strong>
            </div>
          </div>
          <p>{t("emptyText")}</p>
        </div>
      )}

      {result ? (
        <div className="upload-summary">
          <div>
            <strong>{result.totalFiles}</strong>
            <span>{t("summaryMergedFiles")}</span>
          </div>
          <div>
            <strong>{formatBytes(result.totalBytes)}</strong>
            <span>{t("summaryTotalInputSize")}</span>
          </div>
          <div>
            <strong>{formatBytes(result.mergedBytes)}</strong>
            <span>{t("summaryMergedOutputSize")}</span>
          </div>
          <div>
            <strong>{result.totalPages}</strong>
            <span>{t("summaryMergedPages")}</span>
          </div>
          <div>
            <strong>{result.fileName}</strong>
            <span>{t("summaryOutputFile")}</span>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="upload-job__actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => download(result.blob, result.fileName)}
          >
            {t("downloadMerged")}
          </button>
          <a className="button button--secondary" href="/compress-pdf">
            {t("compressNext")}
          </a>
        </div>
      ) : null}

      {result ? (
        <div className="upload-job__next-step">
          <strong>{t("recommendedNextStep")}</strong>
          <span>{t("nextStepCopy")}</span>
        </div>
      ) : null}

      {items.length ? (
        <div className="upload-job__hint upload-job__hint--neutral">
          <strong>{items.length} {t("filesInMergeOrder")}</strong>
          <span>{t("hintText")}</span>
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
