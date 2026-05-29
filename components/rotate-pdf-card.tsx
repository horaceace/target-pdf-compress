"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
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

function normalizeRotateError(error: unknown): RotateError {
  if (!(error instanceof Error)) {
    return {
      title: "Rotate failed",
      message: "The PDF could not be rotated in the current browser flow.",
      hint: "Check the file and page range, then try again."
    };
  }

  const lowered = error.message.toLowerCase();

  if (lowered.includes("not a pdf")) {
    return {
      title: "Unsupported file",
      message: error.message,
      hint: "Upload a valid .pdf document before rotating pages."
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
      title: "Invalid page range",
      message: error.message,
      hint: "Leave the field blank for all pages, or use formats like 1, 3-5."
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
    title: "Rotate failed",
    message: error.message,
    hint: "Try a cleaner PDF copy or a simpler page range first."
  };
}

export function RotatePdfCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<SelectedPdf | null>(null);
  const [angle, setAngle] = useState<RotateAngle>(90);
  const [rangeInput, setRangeInput] = useState("");
  const [result, setResult] = useState<RotateResult | null>(null);
  const [error, setError] = useState<RotateError | null>(null);
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
        hint: "Only PDF files can be rotated in this flow."
      });
      return;
    }

    if (file.size === 0) {
      setSelected(null);
      setError({
        title: "Empty PDF",
        message: `${file.name} is empty. Upload a PDF with actual document pages and try again.`,
        hint: "Use a PDF that contains actual pages before rotating."
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
        title: "No PDF selected",
        message: "Choose a PDF before rotating pages.",
        hint: "Upload one PDF first, then choose an angle and optional page range."
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
          <span className="eyebrow">Turn PDF pages upright</span>
          <h2>Rotate PDF pages</h2>
          <p>Upload one PDF, rotate all pages or selected pages, and download the fixed file.</p>
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
          <small>Rotate all pages or selected ranges like 1, 3-5. Up to 50 MB.</small>
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
            <label htmlFor="rotate-angle">Rotation angle</label>
            <select
              id="rotate-angle"
              value={angle}
              onChange={(event) => setAngle(Number(event.target.value) as RotateAngle)}
            >
              <option value={90}>90 degrees clockwise</option>
              <option value={180}>180 degrees</option>
              <option value={270}>270 degrees clockwise</option>
            </select>
          </div>
          <div className="upload-mode__meta">
            <strong>Choose the correction angle</strong>
            <span>Use 90 degrees for sideways scans, 180 degrees for upside-down pages.</span>
          </div>
        </div>

        <div className="upload-mode">
          <div className="upload-mode__row">
            <label htmlFor="rotate-pages">Pages to rotate</label>
            <input
              id="rotate-pages"
              className="upload-mode__input"
              type="text"
              placeholder="Leave blank for all pages"
              value={rangeInput}
              onChange={(event) => setRangeInput(event.target.value)}
            />
          </div>
          <div className="upload-mode__meta">
            <strong>{rangeInput.trim() ? "Rotate selected pages" : "Rotate all pages"}</strong>
            <span>Leave blank to rotate the whole PDF, or use formats like 1, 3-5.</span>
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={!selected || isPending}
            onClick={rotatePages}
          >
            {isPending ? "Rotating..." : "Rotate PDF"}
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
          <div className="upload-empty__badge">Rotated PDF output</div>
          <div className="upload-empty__grid">
            <div>
              <span>Pages</span>
              <strong>All</strong>
            </div>
            <div>
              <span>Angle</span>
              <strong>90 deg</strong>
            </div>
            <div>
              <span>Output</span>
              <strong>Fixed PDF</strong>
            </div>
          </div>
          <p>Upload a PDF to rotate sideways pages before submitting, merging, or compressing.</p>
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
                <span>Total pages</span>
                <strong>{result.pageCount}</strong>
              </div>
              <div>
                <span>Rotated</span>
                <strong>{result.rotatedPageCount}</strong>
              </div>
              <div>
                <span>Angle</span>
                <strong>{result.angle} deg</strong>
              </div>
              <div>
                <span>Range</span>
                <strong>{result.rangeLabel}</strong>
              </div>
            </div>
            <div className="upload-job__hint upload-job__hint--success">
              <strong>Pages rotated locally</strong>
              <span>The fixed PDF is ready to download. Run compression next if file size still matters.</span>
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

