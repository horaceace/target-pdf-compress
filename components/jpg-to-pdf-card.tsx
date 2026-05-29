"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
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

const fitModeOptions: Record<
  ImageFitMode,
  { label: string; description: string }
> = {
  original: {
    label: "Original size",
    description: "Keep each image at its original dimensions on its own PDF page."
  },
  contain: {
    label: "Fit inside page",
    description: "Keep the full image visible and centered on each PDF page."
  },
  cover: {
    label: "Fill page",
    description: "Fill the page area completely, which may crop some edges on wide or tall images."
  }
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [fitMode, setFitMode] = useState<ImageFitMode>("contain");
  const [result, setResult] = useState<ImageToPdfResult | null>(null);
  const [error, setError] = useState<JpgToPdfError | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  function triggerPicker() {
    inputRef.current?.click();
  }

  function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    const unsupported = files.find((file) => !isSupportedImage(file));

    if (unsupported) {
      setError({
        title: "Unsupported image",
        message: `${unsupported.name} is not a supported JPG or PNG image.`,
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
          title: "JPG to PDF failed",
          message:
            conversionError instanceof Error
              ? conversionError.message
              : "The selected images could not be turned into a PDF in the browser.",
          hint: "Try fewer images first, or replace any very large source image."
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
          <span className="eyebrow">Turn JPG images into one PDF</span>
          <h2>JPG to PDF</h2>
          <p>Upload JPG or PNG files, set the page order, and export one combined PDF.</p>
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
          <strong>Drop JPG or PNG files here</strong>
          <span>or click to choose images</span>
          <small>Every uploaded image becomes one PDF page in the final file.</small>
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
            <label htmlFor="image-fit-mode">Image page mode</label>
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
            {isPending ? "Creating PDF..." : "Convert JPG to PDF"}
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
              Clear images
            </button>
          </div>
        </div>
      </div>

      {items.length ? (
        <div className="upload-summary">
          <div>
            <strong>{items.length}</strong>
            <span>images selected</span>
          </div>
          <div>
            <strong>{formatBytes(totalInputBytes)}</strong>
            <span>total input size</span>
          </div>
          <div>
            <strong>{fitMeta.label}</strong>
            <span>page mode</span>
          </div>
        </div>
      ) : (
        <div className="upload-empty">
          <div className="upload-empty__badge">JPG to PDF preview</div>
          <div className="upload-empty__grid">
            <div>
              <span>Input</span>
              <strong>Multiple images</strong>
            </div>
            <div>
              <span>Output</span>
              <strong>1 combined PDF</strong>
            </div>
            <div>
              <span>Use case</span>
              <strong>Receipts, forms, screenshots</strong>
            </div>
          </div>
          <p>Use this when you need one PDF from multiple screenshots, receipts, scans, or exported JPG pages.</p>
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
                  Move up
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, 1)}
                >
                  Move down
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
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
            <span>pdf pages</span>
          </div>
          <div>
            <strong>{formatBytes(result.outputBytes)}</strong>
            <span>output pdf size</span>
          </div>
          <div>
            <strong>{result.totalImages}</strong>
            <span>images merged</span>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="upload-job__next-step">
          <strong>Recommended next step</strong>
          <span>Download the PDF now, then use Compress PDF if you need a smaller upload-ready file afterward.</span>
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
