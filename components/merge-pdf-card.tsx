"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
import { formatBytes } from "@/lib/pdf/compress";
import { MergeResult, mergePdfFiles } from "@/lib/pdf/merge";

type MergeItem = {
  id: string;
  file: File;
};

function fileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function MergePdfCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<MergeItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MergeResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        setError(
          mergeError instanceof Error
            ? mergeError.message
            : "Merge failed. Try again with valid PDF files."
        );
      }
    });
  }

  return (
    <aside className="panel upload-card">
      <div className="upload-card__top">
        <div className="upload-card__header">
          <span className="eyebrow">Combine files into one PDF</span>
          <h2>Merge PDF files</h2>
          <p>Upload multiple PDFs, reorder them, and merge everything into one file.</p>
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
          <strong>Drop PDF files here</strong>
          <span>or click to choose files</span>
          <small>Upload at least two files to merge.</small>
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
            {isPending ? "Merging..." : "Merge PDF files"}
          </button>
          <div className="upload-actions__secondary">
            <button
              type="button"
              className="button button--secondary"
              disabled={!items.length || isPending}
              onClick={() => setItems([])}
            >
              Clear list
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
      ) : (
        <div className="upload-empty">
          <div className="upload-empty__badge">Merge preview</div>
          <div className="upload-empty__grid">
            <div>
              <span>Files</span>
              <strong>3 PDFs</strong>
            </div>
            <div>
              <span>Output</span>
              <strong>1 merged file</strong>
            </div>
            <div>
              <span>Order</span>
              <strong>Reorder before merge</strong>
            </div>
          </div>
          <p>Upload two or more PDF files to build one merged document in your chosen order.</p>
        </div>
      )}

      {result ? (
        <div className="upload-summary">
          <div>
            <strong>{result.totalFiles}</strong>
            <span>merged files</span>
          </div>
          <div>
            <strong>{formatBytes(result.totalBytes)}</strong>
            <span>total input size</span>
          </div>
          <div>
            <strong>{result.fileName}</strong>
            <span>merged output</span>
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
            Download merged PDF
          </button>
          <a className="button button--secondary" href="/compress-pdf">
            Compress this next
          </a>
        </div>
      ) : null}

      {result ? <p className="upload-job__recommendation">Merged file ready: {result.fileName}</p> : null}
      {error ? <p className="upload-job__error">{error}</p> : null}
    </aside>
  );
}
