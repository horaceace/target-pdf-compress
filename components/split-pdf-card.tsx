"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
import { formatBytes } from "@/lib/pdf/compress";
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

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SplitPdfCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<SelectedPdf | null>(null);
  const [rangeInput, setRangeInput] = useState("1");
  const [parsedRanges, setParsedRanges] = useState<PageRange[]>([]);
  const [results, setResults] = useState<SplitResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  function resetResults() {
    setResults([]);
    setParsedRanges([]);
    setError(null);
  }

  function triggerPicker() {
    inputRef.current?.click();
  }

  async function loadFile(file: File) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSelected(null);
      setError(`${file.name} is not a supported PDF file. Upload a .pdf document and try again.`);
      return;
    }

    if (file.size === 0) {
      setSelected(null);
      setError(`${file.name} is empty. Upload a PDF with actual document pages and try again.`);
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setSelected(null);
      setError(
        `${file.name} is larger than 50 MB. Try a smaller PDF or compress it before splitting in the browser.`
      );
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
      setError(
        loadError instanceof Error
          ? loadError.message
          : "This PDF could not be read. Try another file."
      );
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
      setError("Choose a PDF before splitting pages.");
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
        setError(
          splitError instanceof Error
            ? splitError.message
            : "Split failed. Check the page ranges and try again."
        );
      }
    });
  }

  function downloadAll() {
    results.forEach((item) => downloadBlob(item.blob, item.fileName));
  }

  const totalOutputBytes = results.reduce((sum, item) => sum + item.blob.size, 0);

  return (
    <aside className="panel upload-card">
      <div className="upload-card__top">
        <div className="upload-card__header">
          <span className="eyebrow">Split one PDF into smaller files</span>
          <h2>Split PDF files</h2>
          <p>Upload one PDF, choose page ranges, and export separate PDF files in the browser.</p>
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
          <strong>Drop one PDF here</strong>
          <span>or click to choose a file</span>
          <small>Use formats like 1-3, 5, 7-9. Up to 50 MB in the current browser flow.</small>
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
            <label htmlFor="page-ranges">Page ranges</label>
            <input
              id="page-ranges"
              className="upload-mode__input"
              type="text"
              placeholder="1-3, 5, 7-9"
              value={rangeInput}
              onChange={(event) => setRangeInput(event.target.value)}
            />
          </div>
          <div className="upload-mode__meta">
            <strong>Split by page ranges</strong>
            <span>Use commas to separate multiple ranges. Example: 1-2, 4, 7-9.</span>
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={!selected || isPending}
            onClick={splitCurrentPdf}
          >
            {isPending ? "Splitting..." : "Split PDF"}
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
              Clear file
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={!results.length}
              onClick={downloadAll}
            >
              Download all
            </button>
          </div>
        </div>
      </div>

      {!selected ? (
        <div className="upload-empty">
          <div className="upload-empty__badge">Split preview</div>
          <div className="upload-empty__grid">
            <div>
              <span>Input</span>
              <strong>1 PDF</strong>
            </div>
            <div>
              <span>Ranges</span>
              <strong>1-3, 5, 7-9</strong>
            </div>
            <div>
              <span>Output</span>
              <strong>Multiple PDFs</strong>
            </div>
          </div>
          <p>Upload one PDF to split out selected pages for forms, uploads, or document sharing.</p>
        </div>
      ) : null}

      {parsedRanges.length ? (
        <div className="upload-job__hint">
          <strong>{parsedRanges.length} ranges ready</strong>
          <span>
            {parsedRanges.map((range) => (range.start === range.end ? `${range.start}` : `${range.start}-${range.end}`)).join(", ")}
          </span>
        </div>
      ) : null}

      {results.length ? (
        <div className="upload-summary">
          <div>
            <strong>{results.length}</strong>
            <span>split files</span>
          </div>
          <div>
            <strong>{formatBytes(totalOutputBytes)}</strong>
            <span>combined output size</span>
          </div>
          <div>
            <strong>{parsedRanges.map((range) => range.start === range.end ? `${range.start}` : `${range.start}-${range.end}`).join(", ")}</strong>
            <span>exported ranges</span>
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
                <span className="upload-job__status upload-job__status--success">ready</span>
              </div>
              <div className="upload-job__stats">
                <div>
                  <span>Pages</span>
                  <strong>{item.pageStart === item.pageEnd ? item.pageStart : `${item.pageStart}-${item.pageEnd}`}</strong>
                </div>
                <div>
                  <span>Output size</span>
                  <strong>{formatBytes(item.blob.size)}</strong>
                </div>
                <div>
                  <span>Total pages</span>
                  <strong>{item.pageTotal}</strong>
                </div>
              </div>
              <div className="upload-job__actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => downloadBlob(item.blob, item.fileName)}
                >
                  Download PDF
                </button>
                <a className="button button--secondary" href="/compress-pdf">
                  Compress this next
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {error ? <p className="upload-job__error">{error}</p> : null}
    </aside>
  );
}
