"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatBytes } from "@/lib/pdf/compress";
import { RotateAngle, RotateResult, prepareRotatePdf, rotatePdfPages } from "@/lib/pdf/rotate";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

type SelectedPdf = {
  file: File;
  pageCount: number;
};

type RotateError = {
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

export function RotatePdfCard() {
  const t = useTranslations("RotatePdfCard");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<SelectedPdf | null>(null);
  const [angle, setAngle] = useState<RotateAngle>(90);
  const [rangeInput, setRangeInput] = useState("");
  const [result, setResult] = useState<RotateResult | null>(null);
  const [error, setError] = useState<RotateError | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  function normalizeRotateError(rotateError: unknown): RotateError {
    if (!(rotateError instanceof Error)) {
      return {
        title: t("errors.rotateFailed"),
        message: t("errors.rotateFailedMessage"),
        hint: t("errors.rotateFailedHint")
      };
    }

    const lowered = rotateError.message.toLowerCase();

    if (lowered.includes("not a pdf")) {
      return {
        title: t("errors.unsupportedFile"),
        message: rotateError.message,
        hint: t("errors.unsupportedFileHint")
      };
    }

    if (lowered.includes("empty")) {
      return {
        title: t("errors.emptyPdf"),
        message: rotateError.message,
        hint: t("errors.emptyPdfHint")
      };
    }

    if (lowered.includes("page") || lowered.includes("range")) {
      return {
        title: t("errors.invalidRange"),
        message: rotateError.message,
        hint: t("errors.invalidRangeHint")
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
      title: t("errors.rotateFailed"),
      message: rotateError.message,
      hint: t("errors.rotateFailedHint")
    };
  }

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
      const prepared = await prepareRotatePdf(file);
      setSelected({
        file,
        pageCount: prepared.pageCount
      });
      setRangeInput("");
      setError(null);
    } catch (loadError) {
      setSelected(null);
      setError(normalizeRotateError(loadError));
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

  function rotatePages() {
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
        const nextResult = await rotatePdfPages(selected.file, angle, rangeInput);
        setResult(nextResult);
        setError(null);
      } catch (rotateError) {
        setResult(null);
        setError(normalizeRotateError(rotateError));
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
            <label htmlFor="rotate-angle">{t("rotationAngle")}</label>
            <select
              id="rotate-angle"
              value={angle}
              onChange={(event) => setAngle(Number(event.target.value) as RotateAngle)}
            >
              <option value={90}>{t("angle90")}</option>
              <option value={180}>{t("angle180")}</option>
              <option value={270}>{t("angle270")}</option>
            </select>
          </div>
          <div className="upload-mode__meta">
            <strong>{t("chooseAngle")}</strong>
            <span>{t("angleHint")}</span>
          </div>
        </div>

        <div className="upload-mode">
          <div className="upload-mode__row">
            <label htmlFor="rotate-pages">{t("pagesToRotate")}</label>
            <input
              id="rotate-pages"
              className="upload-mode__input"
              type="text"
              placeholder={t("pagesPlaceholder")}
              value={rangeInput}
              onChange={(event) => setRangeInput(event.target.value)}
            />
          </div>
          <div className="upload-mode__meta">
            <strong>{rangeInput.trim() ? t("rotateSelected") : t("rotateAll")}</strong>
            <span>{t("pagesHint")}</span>
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={!selected || isPending}
            onClick={rotatePages}
          >
            {isPending ? t("rotating") : t("rotateButton")}
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
              <span>{t("emptyStatPages")}</span>
              <strong>{t("emptyStatPagesValue")}</strong>
            </div>
            <div>
              <span>{t("emptyStatAngle")}</span>
              <strong>{t("emptyStatAngleValue")}</strong>
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
                <span>{t("totalPagesLabel")}</span>
                <strong>{result.pageCount}</strong>
              </div>
              <div>
                <span>{t("rotated")}</span>
                <strong>{result.rotatedPageCount}</strong>
              </div>
              <div>
                <span>{t("angle")}</span>
                <strong>{result.angle} deg</strong>
              </div>
              <div>
                <span>{t("range")}</span>
                <strong>{result.rangeLabel}</strong>
              </div>
            </div>
            <div className="upload-job__hint upload-job__hint--success">
              <strong>{t("rotatedLocally")}</strong>
              <span>{t("rotatedHint")}</span>
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
