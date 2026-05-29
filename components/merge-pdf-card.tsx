"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<MergeItem[]>([]);
  const [error, setError] = useState<MergeCardError | null>(null);
  const [result, setResult] = useState<MergeResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  function normalizeMergeError(mergeError: unknown): MergeCardError {
    if (!(mergeError instanceof Error)) {
      return {
        title: "Merge failed",
        message: "The selected files could not be merged in the current browser flow.",
        hint: "Check the files and try again with valid PDFs."
      };
    }

    const lowered = mergeError.message.toLowerCase();

    if (lowered.includes("at least two")) {
      return {
        title: "Need more files",
        message: mergeError.message,
        hint: "Add at least two PDF files before starting the merge."
      };
    }

    if (lowered.includes("not a pdf")) {
      return {
        title: "Unsupported file",
        message: mergeError.message,
        hint: "Remove non-PDF files from the list and keep only .pdf documents."
      };
    }

    if (lowered.includes("encrypted") || lowered.includes("password")) {
      return {
        title: "Protected PDF",
        message: "One of these files appears to be password-protected or restricted.",
        hint: "Unlock the file first, then upload it again for merging."
      };
    }

    return {
      title: "Merge failed",
      message: mergeError.message,
      hint: "Try fewer files first, or re-export the PDFs if one of them looks broken."
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

  const totalPagesHint =
    items.length > 1
      ? "Merge the files in your chosen order, then compress the merged output if you still need a smaller upload."
      : "Add more PDF files to build one final merged document.";

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
            <strong>{formatBytes(result.mergedBytes)}</strong>
            <span>merged output size</span>
          </div>
          <div>
            <strong>{result.totalPages}</strong>
            <span>merged pages</span>
          </div>
          <div>
            <strong>{result.fileName}</strong>
            <span>output file</span>
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

      {result ? (
        <div className="upload-job__next-step">
          <strong>Recommended next step</strong>
          <span>Download the merged file now, or open Compress PDF next if the final document still feels too large for upload limits.</span>
        </div>
      ) : null}

      {items.length ? (
        <div className="upload-job__hint upload-job__hint--neutral">
          <strong>{items.length} files in merge order</strong>
          <span>{totalPagesHint}</span>
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
