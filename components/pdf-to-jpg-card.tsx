"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
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

const qualityConfigMap: Record<ImageQuality, { scale: number; quality: number }> = {
  web: { scale: 1.15, quality: 0.72 },
  balanced: { scale: 1.45, quality: 0.82 },
  print: { scale: 1.9, quality: 0.9 }
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

async function convertPdfToJpg(
  file: File,
  imageQuality: ImageQuality,
  t: (key: string, values?: Record<string, string | number>) => string
): Promise<ConvertedImage[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.mjs",
      import.meta.url
    ).toString();
  }

  const qualityConfig = qualityConfigMap[imageQuality];
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
      throw new Error(t("errors.canvasNotAvailable"));
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
      throw new Error(t("errors.pageExportFailed"));
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
  const t = useTranslations("PdfToJpgCard");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<SelectedPdf | null>(null);
  const [imageQuality, setImageQuality] = useState<ImageQuality>("balanced");
  const [results, setResults] = useState<ConvertedImage[]>([]);
  const [error, setError] = useState<ConversionError | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  const qualityOptions: Record<
    ImageQuality,
    { label: string; scale: number; quality: number; description: string }
  > = {
    web: {
      ...qualityConfigMap.web,
      label: t("qualityWeb"),
      description: t("qualityWebDesc")
    },
    balanced: {
      ...qualityConfigMap.balanced,
      label: t("qualityBalanced"),
      description: t("qualityBalancedDesc")
    },
    print: {
      ...qualityConfigMap.print,
      label: t("qualityHigh"),
      description: t("qualityHighDesc")
    }
  };

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
        title: t("errors.unsupportedFile"),
        message: `${file.name} ${t("errors.unsupportedFileHint")}`,
        hint: "Only PDF files can be converted to JPG in this flow."
      });
      return;
    }

    if (file.size === 0) {
      setSelected(null);
      setError({
        title: t("errors.emptyPdf"),
        message: `${file.name} ${t("errors.emptyPdfHint")}`,
        hint: "Use a PDF that contains actual pages before converting."
      });
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setSelected(null);
      setError({
        title: t("errors.fileTooLarge"),
        message: `${file.name} is larger than 50 MB. ${t("errors.fileTooLargeHint")}`,
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
        title: t("errors.unreadablePdf"),
        message:
          loadError instanceof Error
            ? loadError.message
            : `${file.name} ${t("errors.unreadablePdfHint")}`,
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
        title: t("errors.noPdfSelected"),
        message: t("errors.noPdfSelectedHint"),
        hint: "Upload one PDF first, then start the conversion."
      });
      return;
    }

    startTransition(async () => {
      try {
        const converted = await convertPdfToJpg(selected.file, imageQuality, t);
        setResults(converted);
        setError(null);
      } catch (conversionError) {
        setResults([]);
        setError({
          title: t("errors.conversionFailed"),
          message:
            conversionError instanceof Error
              ? conversionError.message
              : t("errors.conversionFailedMessage"),
          hint: t("errors.conversionFailedHint")
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
              <span>{t("pagesToExport")}</span>
            </div>
          </div>
        ) : null}

        <div className="upload-mode">
          <div className="upload-mode__row">
            <label htmlFor="jpg-quality">{t("jpgOutputMode")}</label>
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
            {isPending ? t("converting") : t("convertButton")}
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
              {t("clearFile")}
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={!results.length}
              onClick={downloadAll}
            >
              {t("downloadZip")}
            </button>
          </div>
        </div>
      </div>

      {!selected ? (
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
      ) : null}

      {results.length ? (
        <div className="upload-summary">
          <div>
            <strong>{results.length}</strong>
            <span>{t("jpgFiles")}</span>
          </div>
          <div>
            <strong>{formatBytes(totalOutputBytes)}</strong>
            <span>{t("combinedOutputSize")}</span>
          </div>
          <div>
            <strong>{qualityMeta.label}</strong>
            <span>{t("jpgModeUsed")}</span>
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
                  <span>{t("pageN", { n: item.pageNumber })}</span>
                </div>
                <span className="upload-job__status upload-job__status--success">{t("ready")}</span>
              </div>
              <div className="upload-job__stats">
                <div>
                  <span>{t("outputSize")}</span>
                  <strong>{formatBytes(item.blob.size)}</strong>
                </div>
                <div>
                  <span>{t("dimensions")}</span>
                  <strong>{item.width} &times; {item.height}</strong>
                </div>
                <div>
                  <span>{t("page")}</span>
                  <strong>{item.pageNumber}</strong>
                </div>
              </div>
              <div className="upload-job__actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => downloadBlob(item.blob, item.fileName)}
                >
                  {t("downloadJpg")}
                </button>
                <a className="button button--secondary" href="/compress-pdf">
                  {t("compressPdfNext")}
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {results.length ? (
        <div className="upload-job__next-step">
          <strong>{t("recommendedNextStep")}</strong>
          <span>{t("nextStepCopy")}</span>
        </div>
      ) : null}

      {selected ? (
        <div className="upload-job__hint upload-job__hint--neutral">
          <strong>{selected.pageCount} {t("totalPagesLoaded")}</strong>
          <span>{t("pdfToJpgHint")}</span>
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
