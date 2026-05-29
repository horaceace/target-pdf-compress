"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
import { formatBytes } from "@/lib/pdf/compress";
import { downloadFilesAsZip } from "@/lib/download/download-zip";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

type SelectedPdf = {
  file: File;
  pageCount: number;
};

type ImageQuality = "web" | "balanced" | "print";

type ConversionError = {
  title: string;
  message: string;
  hint?: string;
};

type ConvertedImage = {
  id: string;
  fileName: string;
  blob: Blob;
  pageNumber: number;
  width: number;
  height: number;
};

const qualityOptions: Record<
  ImageQuality,
  { label: string; scale: number; quality: number; description: string }
> = {
  web: {
    label: "Web JPG",
    scale: 1.15,
    quality: 0.72,
    description: "Smaller JPG files for uploads, previews, and sharing."
  },
  balanced: {
    label: "Balanced JPG",
    scale: 1.45,
    quality: 0.82,
    description: "Good default output for most page-to-image conversions."
  },
  print: {
    label: "Higher quality JPG",
    scale: 1.9,
    quality: 0.9,
    description: "Larger JPG files with better visual detail."
  }
};

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildImageName(fileName: string, pageNumber: number) {
  const base = fileName.toLowerCase().endsWith(".pdf") ? fileName.replace(/\.pdf$/i, "") : fileName;
  return `${base}-page-${pageNumber}.jpg`;
}

async function loadPdfPageCount(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.mjs",
      import.meta.url
    ).toString();
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({
    data: bytes,
    useSystemFonts: true,
    isEvalSupported: false
  } as Parameters<typeof pdfjs.getDocument>[0]);
  const pdf = await loadingTask.promise;
  const count = pdf.numPages;
  await loadingTask.destroy();
  return count;
}

async function convertPdfToJpg(file: File, imageQuality: ImageQuality): Promise<ConvertedImage[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.mjs",
      import.meta.url
    ).toString();
  }

  const qualityConfig = qualityOptions[imageQuality];
  const bytes = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({
    data: bytes,
    useSystemFonts: true,
    isEvalSupported: false
  } as Parameters<typeof pdfjs.getDocument>[0]);
  const pdf = await loadingTask.promise;
  const images: ConvertedImage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: qualityConfig.scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      throw new Error("Canvas rendering is not available in this browser.");
    }

    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));

    await page.render({
      canvas,
      canvasContext: context,
      viewport
    }).promise;

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", qualityConfig.quality);
    });

    if (!blob) {
      throw new Error("The browser could not export one of the PDF pages as JPG.");
    }

    images.push({
      id: `${pageNumber}-${blob.size}`,
      fileName: buildImageName(file.name, pageNumber),
      blob,
      pageNumber,
      width: canvas.width,
      height: canvas.height
    });

    canvas.width = 0;
    canvas.height = 0;
    page.cleanup();
  }

  await loadingTask.destroy();
  return images;
}

export function PdfToJpgCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<SelectedPdf | null>(null);
  const [imageQuality, setImageQuality] = useState<ImageQuality>("balanced");
  const [results, setResults] = useState<ConvertedImage[]>([]);
  const [error, setError] = useState<ConversionError | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  function resetState() {
    setResults([]);
    setError(null);
  }

  function triggerPicker() {
    inputRef.current?.click();
  }

  async function loadFile(file: File) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSelected(null);
      setError({
        title: "Unsupported file",
        message: `${file.name} is not a supported PDF file. Upload a .pdf document and try again.`,
        hint: "Only PDF files can be converted to JPG in this flow."
      });
      return;
    }

    if (file.size === 0) {
      setSelected(null);
      setError({
        title: "Empty PDF",
        message: `${file.name} is empty. Upload a PDF with actual document pages and try again.`,
        hint: "Use a PDF that contains actual pages before converting."
      });
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setSelected(null);
      setError({
        title: "File too large",
        message: `${file.name} is larger than 50 MB. Try a smaller PDF or split it before converting pages in the browser.`,
        hint: "Large files take longer because every page has to be rendered in the browser."
      });
      return;
    }

    try {
      const pageCount = await loadPdfPageCount(file);
      setSelected({ file, pageCount });
      resetState();
    } catch (loadError) {
      setSelected(null);
      setError({
        title: "Unreadable PDF",
        message:
          loadError instanceof Error
            ? loadError.message
            : "This PDF could not be read for page conversion.",
        hint: "Try a cleaner PDF copy or re-export the file before converting."
      });
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

  function downloadAll() {
    if (!selected || !results.length) {
      return;
    }

    void downloadFilesAsZip(
      `${selected.file.name.replace(/\.pdf$/i, "") || "pdf-to-jpg"}-jpg-pages.zip`,
      results.map((item) => ({
        fileName: item.fileName,
        blob: item.blob
      }))
    );
  }

  function convertCurrentPdf() {
    if (!selected) {
      setError({
        title: "No PDF selected",
        message: "Choose a PDF before converting pages to JPG.",
        hint: "Upload one PDF first, then start the conversion."
      });
      return;
    }

    startTransition(async () => {
      try {
        const converted = await convertPdfToJpg(selected.file, imageQuality);
        setResults(converted);
        setError(null);
      } catch (conversionError) {
        setResults([]);
        setError({
          title: "Conversion failed",
          message:
            conversionError instanceof Error
              ? conversionError.message
              : "The PDF could not be converted to JPG in the browser.",
          hint: "Try a different quality level or a smaller PDF first."
        });
      }
    });
  }

  const totalOutputBytes = results.reduce((sum, item) => sum + item.blob.size, 0);
  const qualityMeta = qualityOptions[imageQuality];

  return (
    <aside className="panel upload-card">
      <div className="upload-card__top">
        <div className="upload-card__header">
          <span className="eyebrow">Convert PDF pages into JPG images</span>
          <h2>PDF to JPG</h2>
          <p>Upload one PDF, render each page in the browser, and download JPG files.</p>
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
          <small>Each page will be exported as a JPG image. Up to 50 MB in the current browser flow.</small>
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
              <span>pages to export</span>
            </div>
          </div>
        ) : null}

        <div className="upload-mode">
          <div className="upload-mode__row">
            <label htmlFor="jpg-quality">JPG output mode</label>
            <select
              id="jpg-quality"
              value={imageQuality}
              onChange={(event) => setImageQuality(event.target.value as ImageQuality)}
            >
              {Object.entries(qualityOptions).map(([value, option]) => (
                <option key={value} value={value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="upload-mode__meta">
            <strong>{qualityMeta.label}</strong>
            <span>{qualityMeta.description}</span>
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={!selected || isPending}
            onClick={convertCurrentPdf}
          >
            {isPending ? "Converting..." : "Convert PDF to JPG"}
          </button>
          <div className="upload-actions__secondary">
            <button
              type="button"
              className="button button--secondary"
              disabled={!selected || isPending}
              onClick={() => {
                setSelected(null);
                resetState();
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
              Download ZIP
            </button>
          </div>
        </div>
      </div>

      {!selected ? (
        <div className="upload-empty">
          <div className="upload-empty__badge">PDF to JPG preview</div>
          <div className="upload-empty__grid">
            <div>
              <span>Input</span>
              <strong>1 PDF</strong>
            </div>
            <div>
              <span>Output</span>
              <strong>One JPG per page</strong>
            </div>
            <div>
              <span>Use case</span>
              <strong>Preview, upload, share</strong>
            </div>
          </div>
          <p>Use this when you need page images for previews, CMS uploads, sharing, or extracting visuals from a PDF.</p>
        </div>
      ) : null}

      {results.length ? (
        <div className="upload-summary">
          <div>
            <strong>{results.length}</strong>
            <span>jpg files</span>
          </div>
          <div>
            <strong>{formatBytes(totalOutputBytes)}</strong>
            <span>combined output size</span>
          </div>
          <div>
            <strong>{qualityMeta.label}</strong>
            <span>jpg mode used</span>
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
                  <span>Page {item.pageNumber}</span>
                </div>
                <span className="upload-job__status upload-job__status--success">ready</span>
              </div>
              <div className="upload-job__stats">
                <div>
                  <span>Output size</span>
                  <strong>{formatBytes(item.blob.size)}</strong>
                </div>
                <div>
                  <span>Dimensions</span>
                  <strong>{item.width} × {item.height}</strong>
                </div>
                <div>
                  <span>Page</span>
                  <strong>{item.pageNumber}</strong>
                </div>
              </div>
              <div className="upload-job__actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => downloadBlob(item.blob, item.fileName)}
                >
                  Download JPG
                </button>
                <a className="button button--secondary" href="/compress-pdf">
                  Compress PDF next
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {results.length ? (
        <div className="upload-job__next-step">
          <strong>Recommended next step</strong>
          <span>Download the JPG files now, or use a lower JPG output mode next time if you need smaller image files for web uploads.</span>
        </div>
      ) : null}

      {selected ? (
        <div className="upload-job__hint upload-job__hint--neutral">
          <strong>{selected.pageCount} total pages loaded</strong>
          <span>PDF to JPG works best when you need page previews, image uploads, or one image file per page instead of another PDF.</span>
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
