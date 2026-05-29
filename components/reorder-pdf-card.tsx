"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
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

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function normalizeReorderError(error: unknown): ReorderError {
  if (!(error instanceof Error)) {
    return {
      title: "Reorder failed",
      message: "The PDF could not be reordered in the current browser flow.",
      hint: "Check the file and page order, then try again."
    };
  }

  const lowered = error.message.toLowerCase();

  if (lowered.includes("not a pdf")) {
    return {
      title: "Unsupported file",
      message: error.message,
      hint: "Upload a valid .pdf document before reordering pages."
    };
  }

  if (lowered.includes("empty")) {
    return {
      title: "Empty PDF",
      message: error.message,
      hint: "Use a PDF that contains actual document pages."
    };
  }

  if (lowered.includes("duplicate") || lowered.includes("page") || lowered.includes("range")) {
    return {
      title: "Invalid page order",
      message: error.message,
      hint: "Use formats like 3,1,2,4-6 and list each output page only once."
    };
  }

  if (lowered.includes("encrypted") || lowered.includes("password")) {
    return {
      title: "Protected PDF",
      message: "This PDF appears to be password-protected or restricted.",
      hint: "Unlock the file first, then upload it again."
    };
  }

  return {
    title: "Reorder failed",
    message: error.message,
    hint: "Try a cleaner PDF copy or a simpler page order first."
  };
}

export function ReorderPdfCard() {
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
        title: "Unsupported file",
        message: `${file.name} is not a supported PDF file. Upload a .pdf document and try again.`,
        hint: "Only PDF files can be reordered in this flow."
      });
      return;
    }

    if (file.size === 0) {
      setSelected(null);
      setError({
        title: "Empty PDF",
        message: `${file.name} is empty. Upload a PDF with actual document pages and try again.`,
        hint: "Use a PDF that contains actual pages before reordering."
      });
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setSelected(null);
      setError({
        title: "File too large",
        message: `${file.name} is larger than 50 MB. Try a smaller PDF or split it first.`,
        hint: "The current browser flow is designed for smaller document tasks."
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
      setError(normalizeReorderError(loadError));
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
        title: "No PDF selected",
        message: "Choose a PDF before reordering pages.",
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
        setError(normalizeReorderError(reorderError));
      }
    });
  }

  return (
    <aside className="panel upload-card">
      <div className="upload-card__top">
        <div className="upload-card__header">
          <span className="eyebrow">Rearrange pages in a PDF</span>
          <h2>Reorder PDF pages</h2>
          <p>Upload one PDF, type the new page order, and download a reordered PDF in the browser.</p>
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
          <strong>Drop one PDF here</strong>
          <span>or click to choose a file</span>
          <small>Use page order like 3,1,2,4-6. Up to 50 MB in the browser flow.</small>
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
              <span>selected file</span>
            </div>
            <div>
              <strong>{formatBytes(selected.file.size)}</strong>
              <span>file size</span>
            </div>
            <div>
              <strong>{selected.pageCount}</strong>
              <span>total pages</span>
            </div>
          </div>
        ) : null}

        <div className="upload-mode">
          <div className="upload-mode__row">
            <label htmlFor="page-order">New page order</label>
            <input
              id="page-order"
              className="upload-mode__input"
              type="text"
              placeholder="3,1,2,4-6"
              value={orderInput}
              onChange={(event) => setOrderInput(event.target.value)}
            />
          </div>
          <div className="upload-mode__meta">
            <strong>Output pages in this order</strong>
            <span>Use commas for exact order. Ranges expand forward, so 4-6 means pages 4, 5, 6.</span>
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={!selected || isPending}
            onClick={reorderPages}
          >
            {isPending ? "Reordering..." : "Reorder pages"}
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
              Clear file
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
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {!selected ? (
        <div className="upload-empty">
          <div className="upload-empty__badge">Reordered PDF output</div>
          <div className="upload-empty__grid">
            <div>
              <span>Input</span>
              <strong>1, 2, 3</strong>
            </div>
            <div>
              <span>Order</span>
              <strong>3, 1, 2</strong>
            </div>
            <div>
              <span>Output</span>
              <strong>3 pages</strong>
            </div>
          </div>
          <p>Upload a PDF to move pages into the order needed for applications, reports, or forms.</p>
        </div>
      ) : null}

      {result ? (
        <div className="upload-job">
          <div className="upload-job__head">
            <div>
              <strong>{result.fileName}</strong>
              <span>{formatBytes(result.blob.size)} output PDF</span>
            </div>
            <span className="upload-job__status upload-job__status--success">success</span>
          </div>
          <div className="upload-job__result">
            <div className="upload-job__stats">
              <div>
                <span>Original pages</span>
                <strong>{result.originalPageCount}</strong>
              </div>
              <div>
                <span>Output pages</span>
                <strong>{result.outputPageCount}</strong>
              </div>
              <div>
                <span>New order</span>
                <strong>{result.orderLabels.join(", ")}</strong>
              </div>
            </div>
            <div className="upload-job__hint upload-job__hint--success">
              <strong>Pages reordered locally</strong>
              <span>The reordered PDF is ready to download. Compress it next if file size still matters.</span>
            </div>
            <div className="upload-job__actions">
              <button
                type="button"
                className="button button--primary"
                onClick={() => downloadBlob(result.blob, result.fileName)}
              >
                Download PDF
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

