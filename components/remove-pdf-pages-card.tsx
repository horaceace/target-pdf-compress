"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
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

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function normalizeRemoveError(error: unknown): RemovePagesError {
  if (!(error instanceof Error)) {
    return {
      title: "Remove pages failed",
      message: "The PDF could not be edited in the current browser flow.",
      hint: "Check the file and page numbers, then try again."
    };
  }

  const lowered = error.message.toLowerCase();

  if (lowered.includes("not a pdf")) {
    return {
      title: "Unsupported file",
      message: error.message,
      hint: "Upload a valid .pdf document before removing pages."
    };
  }

  if (lowered.includes("empty")) {
    return {
      title: "Empty PDF",
      message: error.message,
      hint: "Use a PDF that contains actual document pages."
    };
  }

  if (lowered.includes("page") || lowered.includes("range")) {
    return {
      title: "Invalid page selection",
      message: error.message,
      hint: "Use formats like 2, 4-6, 9 and leave at least one page in the output."
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
    title: "Remove pages failed",
    message: error.message,
    hint: "Try a cleaner PDF copy or a simpler page selection first."
  };
}

export function RemovePdfPagesCard() {
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
        title: "Unsupported file",
        message: `${file.name} is not a supported PDF file. Upload a .pdf document and try again.`,
        hint: "Only PDF files can be edited in this flow."
      });
      return;
    }

    if (file.size === 0) {
      setSelected(null);
      setError({
        title: "Empty PDF",
        message: `${file.name} is empty. Upload a PDF with actual document pages and try again.`,
        hint: "Use a PDF that contains actual pages before removing pages."
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
      const prepared = await prepareRemovePagesPdf(file);
      setSelected({
        file,
        pageCount: prepared.pageCount
      });
      setPageInput(prepared.pageCount > 1 ? "2" : "1");
      setError(null);
    } catch (loadError) {
      setSelected(null);
      setError(normalizeRemoveError(loadError));
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
        title: "No PDF selected",
        message: "Choose a PDF before removing pages.",
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
        setError(normalizeRemoveError(removeError));
      }
    });
  }

  return (
    <aside className="panel upload-card">
      <div className="upload-card__top">
        <div className="upload-card__header">
          <span className="eyebrow">Delete pages from a PDF</span>
          <h2>Remove PDF pages</h2>
          <p>Upload one PDF, enter pages to remove, and download a cleaned PDF in the browser.</p>
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
          <small>Remove pages like 2, 4-6, 9. Up to 50 MB in the browser flow.</small>
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
            <label htmlFor="remove-pages">Pages to remove</label>
            <input
              id="remove-pages"
              className="upload-mode__input"
              type="text"
              placeholder="2, 4-6, 9"
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
            />
          </div>
          <div className="upload-mode__meta">
            <strong>Keep every page except these</strong>
            <span>Use commas for multiple pages or ranges. The output must keep at least one page.</span>
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={!selected || isPending}
            onClick={removePages}
          >
            {isPending ? "Removing pages..." : "Remove pages"}
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
          <div className="upload-empty__badge">Cleaned PDF output</div>
          <div className="upload-empty__grid">
            <div>
              <span>Input</span>
              <strong>12 pages</strong>
            </div>
            <div>
              <span>Remove</span>
              <strong>2 pages</strong>
            </div>
            <div>
              <span>Output</span>
              <strong>10 pages</strong>
            </div>
          </div>
          <p>Upload a PDF to delete blank pages, extra cover sheets, or pages you do not need.</p>
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
                <span>Removed</span>
                <strong>{result.removedPageCount}</strong>
              </div>
              <div>
                <span>Remaining</span>
                <strong>{result.remainingPageCount}</strong>
              </div>
              <div>
                <span>Removed ranges</span>
                <strong>{result.removedLabels.join(", ")}</strong>
              </div>
            </div>
            <div className="upload-job__hint upload-job__hint--success">
              <strong>Pages removed locally</strong>
              <span>The cleaned PDF is ready to download. Run compression next if file size still matters.</span>
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

