"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatBytes } from "@/lib/pdf/compress";
import { ImageFitMode, ImageToPdfResult, imagesToPdf } from "@/lib/pdf/jpg-to-pdf";

type ImageItem = {
  id: string;
  file: File;
};

type JpgToPdfError = {
  title: string;
  message: string;
  hint?: string;
};

function imageId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 10)}`;
}

function isSupportedImage(file: File) {
  const lowerName = file.name.toLowerCase();
  return (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".png")
  );
}

function downloadPdf(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function JpgToPdfCard() {
  const t = useTranslations("JpgToPdfCard");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [fitMode, setFitMode] = useState<ImageFitMode>("contain");
  const [result, setResult] = useState<ImageToPdfResult | null>(null);
  const [error, setError] = useState<JpgToPdfError | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fitModeOptions: Record<
    ImageFitMode,
    { label: string; description: string }
  > = {
    original: {
      label: t("fitOriginal"),
      description: t("fitOriginalDesc")
    },
    contain: {
      label: t("fitInside"),
      description: t("fitInsideDesc")
    },
    cover: {
      label: t("fillPage"),
      description: t("fillPageDesc")
    }
  };

  function triggerPicker() {
    inputRef.current?.click();
  }

  function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    const unsupported = files.find((file) => !isSupportedImage(file));

    if (unsupported) {
      setError({
        title: t("errors.unsupportedImage"),
        message: `${unsupported.name} ${t("errors.unsupportedImageHint")}`,
        hint: "Upload JPG, JPEG, or PNG images only in this browser flow."
      });
      return;
    }

    const next = files.map((file) => ({
      id: imageId(file),
      file
    }));

    setItems((current) => [...current, ...next]);
    setResult(null);
    setError(null);
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

  function createPdf() {
    startTransition(async () => {
      try {
        const output = await imagesToPdf(
          items.map((item) => item.file),
          fitMode
        );
        setResult(output);
        setError(null);
        downloadPdf(output.blob, output.fileName);
      } catch (conversionError) {
        setResult(null);
        setError({
          title: t("errors.jpgToPdfFailed"),
          message:
            conversionError instanceof Error
              ? conversionError.message
              : t("errors.jpgToPdfFailedMessage"),
          hint: t("errors.jpgToPdfFailedHint")
        });
      }
    });
  }

  const fitMeta = fitModeOptions[fitMode];
  const totalInputBytes = items.reduce((sum, item) => sum + item.file.size, 0);

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
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            multiple
            onChange={onChange}
          />
        </div>

        <div className="upload-mode">
          <div className="upload-mode__row">
            <label htmlFor="image-fit-mode">{t("imagePageMode")}</label>
            <select
              id="image-fit-mode"
              value={fitMode}
              onChange={(event) => setFitMode(event.target.value as ImageFitMode)}
            >
              {Object.entries(fitModeOptions).map(([value, option]) => (
                <option key={value} value={value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="upload-mode__meta">
            <strong>{fitMeta.label}</strong>
            <span>{fitMeta.description}</span>
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={!items.length || isPending}
            onClick={createPdf}
          >
            {isPending ? t("creating") : t("createButton")}
          </button>
          <div className="upload-actions__secondary">
            <button
              type="button"
              className="button button--secondary"
              disabled={!items.length || isPending}
              onClick={() => {
                setItems([]);
                setResult(null);
                setError(null);
              }}
            >
              {t("clearImages")}
            </button>
          </div>
        </div>
      </div>

      {items.length ? (
        <div className="upload-summary">
          <div>
            <strong>{items.length}</strong>
            <span>{t("imagesSelected")}</span>
          </div>
          <div>
            <strong>{formatBytes(totalInputBytes)}</strong>
            <span>{t("totalInputSize")}</span>
          </div>
          <div>
            <strong>{fitMeta.label}</strong>
            <span>{t("pageMode")}</span>
          </div>
        </div>
      ) : (
        <div className="upload-empty">
          <div className="upload-empty__badge">{t("emptyBadge")}</div>
          <div className="upload-empty__grid">
            <div>
              <span>{t("emptyStatInput")}</span>
              <strong>{t("emptyStatInputValue")}</strong>
            </div>
            <div>
              <span>{t("emptyStatOutput")}</span>
              <strong>{t("emptyStatOutputValue")}</strong>
            </div>
            <div>
              <span>{t("emptyStatUseCase")}</span>
              <strong>{t("emptyStatUseCaseValue")}</strong>
            </div>
          </div>
          <p>{t("emptyText")}</p>
        </div>
      )}

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
      ) : null}

      {result ? (
        <div className="upload-summary">
          <div>
            <strong>{result.pageCount}</strong>
            <span>{t("pdfPages")}</span>
          </div>
          <div>
            <strong>{formatBytes(result.outputBytes)}</strong>
            <span>{t("outputPdfSize")}</span>
          </div>
          <div>
            <strong>{result.totalImages}</strong>
            <span>{t("imagesMerged")}</span>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="upload-job__next-step">
          <strong>{t("recommendedNextStep")}</strong>
          <span>{t("nextStepCopy")}</span>
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
