"use client";

import {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition
} from "react";
import { downloadFilesAsZip } from "@/lib/download/download-zip";
import {
  CompressionMode,
  CompressionResult,
  compressionModes,
  compressPdfFile,
  formatBytes,
  getCompressionMode,
  getNextCompressionMode,
  inferCompressionMode
} from "@/lib/pdf/compress";
import { trackEvent } from "@/lib/analytics/events";

type UploadCardProps = {
  copy?: string;
  heading?: string;
  initialTarget?: string;
};

type UploadJobStatus = "queued" | "processing" | "success" | "error";
type QueueFilter = "all" | "needs-action" | "done" | "issues";

type UploadJob = {
  id: string;
  file: File;
  status: UploadJobStatus;
  mode: CompressionMode;
  targetBytes?: number;
  result?: CompressionResult;
  previewStatus?: "idle" | "rendering" | "ready" | "error";
  originalPreviewUrl?: string;
  compressedPreviewUrl?: string;
  previewError?: string;
  error?: string;
  errorTitle?: string;
  errorHint?: string;
};

type SuggestedAction = {
  mode: CompressionMode;
  label: string;
  reason: string;
};

const MAX_FILE_BYTES = 50 * 1024 * 1024;

const targetSizeOptions = [
  { label: "No target", value: 0 },
  { label: "Under 500 KB", value: 500 * 1024 },
  { label: "Under 1 MB", value: 1024 * 1024 },
  { label: "Under 2 MB", value: 2 * 1024 * 1024 },
  { label: "Under 5 MB", value: 5 * 1024 * 1024 }
];

function jobId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function createPdfError(fileName: string) {
  return `${fileName} is not a supported PDF file. Upload a .pdf document and try again.`;
}

function createEmptyFileError(fileName: string) {
  return `${fileName} is empty. Upload a PDF with actual document pages and try again.`;
}

function createFileTooLargeError(fileName: string) {
  return `${fileName} is larger than 50 MB. Try a smaller PDF or split the document before compressing it in the browser.`;
}

function normalizeCompressionError(error: unknown, file: File, mode: CompressionMode) {
  const fallback = {
    title: "Compression failed",
    message: "This PDF could not be processed in the current browser flow.",
    hint: "Try another compression mode, a smaller file, or split the document before compressing."
  };

  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message || "";
  const lowered = message.toLowerCase();

  if (lowered.includes("encrypted") || lowered.includes("password")) {
    return {
      title: "Protected PDF",
      message: `${file.name} appears to be password-protected or restricted.`,
      hint: "Unlock the PDF first, then upload it again for browser-side compression."
    };
  }

  if (lowered.includes("empty")) {
    return {
      title: "Empty PDF",
      message,
      hint: "Use a PDF with actual document pages before trying compression."
    };
  }

  if (lowered.includes("invalid") || lowered.includes("failed to parse") || lowered.includes("read")) {
    return {
      title: "Unreadable PDF",
      message: `${file.name} could not be read as a valid PDF.`,
      hint: "Try opening and re-exporting the file first, or upload a cleaner PDF copy."
    };
  }

  if (file.size > 25 * 1024 * 1024 && (mode === "extreme" || mode === "scanned")) {
    return {
      title: "Browser limit reached",
      message: `${file.name} is large for an aggressive browser-side compression pass.`,
      hint: "Split the PDF first, or try Strong mode before running a deeper pass."
    };
  }

  return {
    title: "Compression failed",
    message,
    hint:
      "Try a different mode first. If the file is scan-heavy or image-heavy, Scanned PDF mode usually gives the strongest browser-side path."
  };
}

function chooseStrongerMode(current: CompressionMode) {
  return getNextCompressionMode(current);
}

function chooseSuggestedMode(job: UploadJob) {
  if (!job.result) {
    return null;
  }

  if (job.result.likelyImageHeavy && job.mode !== "scanned") {
    return "scanned" as const;
  }

  return chooseStrongerMode(job.mode);
}

function getSuggestedAction(job: UploadJob): SuggestedAction | null {
  if (!job.result) {
    return null;
  }

  const { result, mode } = job;
  const reductionPercent = Math.round(result.reductionRatio * 100);
  const targetMissed = job.targetBytes ? result.compressedBytes > job.targetBytes : false;
  const targetMet = job.targetBytes ? result.compressedBytes <= job.targetBytes : false;

  if (targetMet) {
    return null;
  }

  if (result.documentProfile === "scanned-heavy" && mode !== "scanned") {
    return {
      mode: "scanned",
      label: `Try ${getCompressionMode("scanned").label}`,
      reason: "This file behaves more like a scan. Scanned PDF mode is the best next step for image-heavy pages."
    };
  }

  if (result.documentProfile === "image-heavy" && reductionPercent < 18 && mode === "strong") {
    return {
      mode: "scanned",
      label: `Try ${getCompressionMode("scanned").label}`,
      reason: "Strong mode helped, but image-heavy files usually need the scanned path for a more aggressive browser-side pass."
    };
  }

  if (targetMissed && mode !== "scanned") {
    const nextMode = result.likelyImageHeavy ? "scanned" : chooseStrongerMode(mode);

    if (nextMode) {
      return {
        mode: nextMode,
        label: `Try ${getCompressionMode(nextMode).label}`,
        reason: `This result is still above the ${formatBytes(job.targetBytes!)} target. ${getCompressionMode(nextMode).label} is the next practical retry.`
      };
    }
  }

  if (reductionPercent < 10 && mode === "light") {
    return {
      mode: "balanced",
      label: `Try ${getCompressionMode("balanced").label}`,
      reason: "Light mode preserved readability, but the file barely moved. Balanced mode is the safest stronger retry."
    };
  }

  if (reductionPercent < 16 && mode === "balanced") {
    return {
      mode: "strong",
      label: `Try ${getCompressionMode("strong").label}`,
      reason: "Balanced mode did not reduce enough for tighter upload limits. Strong mode is the next practical step."
    };
  }

  if (reductionPercent < 22 && mode === "strong") {
    return {
      mode: "extreme",
      label: `Try ${getCompressionMode("extreme").label}`,
      reason: "This result may still miss stricter upload caps. Extreme mode pushes harder toward the smallest browser-side result."
    };
  }

  const strongerMode = chooseStrongerMode(mode);
  if (!strongerMode) {
    return null;
  }

  return {
    mode: strongerMode,
    label: `Try ${getCompressionMode(strongerMode).label}`,
    reason: `If you still need a smaller file, ${getCompressionMode(strongerMode).label} is the next stronger mode in this compression path.`
  };
}

function resultSummary(mode: CompressionMode, reductionRatio: number) {
  const percent = Math.round(reductionRatio * 100);

  if (mode === "light") {
    return percent > 20
      ? "Better readability with a lighter size reduction."
      : "Light mode favors readability over aggressive shrinking.";
  }

  if (mode === "balanced") {
    return percent > 25
      ? "Good default reduction for everyday PDF sharing."
      : "Balanced mode keeps a safer trade-off between size and clarity.";
  }

  if (mode === "strong") {
    return percent > 30
      ? "Strong mode is working well for upload limits and attachments."
      : "Strong mode is aimed at smaller uploads and tighter attachments.";
  }

  if (mode === "extreme") {
    return percent > 35
      ? "Extreme mode is pushing toward the smallest browser-side result."
      : "Extreme mode is best when upload limits matter more than visual quality.";
  }

  return percent > 25
    ? "Scanned PDF mode is helping on image-heavy pages."
    : "Scanned PDF mode is tuned for image-heavy files that resist lighter compression.";
}

function qualityHint(job: UploadJob) {
  const details = job.result?.compressionDetails?.toLowerCase();

  if (!job.result || job.result.mode !== "scanned" || !details) {
    return null;
  }

  if (details.includes("portal limit")) {
    return {
      tone: "target",
      title: "Smallest upload-first result",
      copy:
        "This path is tuned for strict size limits and may visibly reduce scan or image detail. Open the PDF once before submitting it."
    };
  }

  if (details.includes("smallest scan")) {
    return {
      tone: "neutral",
      title: "Balanced scan reduction",
      copy:
        "This default scanned path keeps more detail than the portal-limit path while still shrinking image-heavy pages strongly."
    };
  }

  if (details.includes("smaller scan")) {
    return {
      tone: "neutral",
      title: "Moderate scan reduction",
      copy:
        "This path reduces image-heavy pages while keeping a safer readability margin for scans and forms."
    };
  }

  return {
    tone: "neutral",
    title: "Quality-aware scan path",
    copy:
      "This scanned path is selected from multiple browser render settings based on the smallest practical result."
  };
}

function formatPagesLabel(pageCount: number) {
  return pageCount === 1 ? "1 page" : `${pageCount} pages`;
}

function formatTargetStatus(job: UploadJob) {
  if (!job.targetBytes || !job.result) {
    return null;
  }

  const difference = job.result.compressedBytes - job.targetBytes;

  if (difference <= 0) {
    return {
      met: true,
      title: `Under ${formatBytes(job.targetBytes)} target`,
      copy: `This result is ${formatBytes(Math.abs(difference))} below your selected upload limit.`
    };
  }

  return {
    met: false,
    title: `${formatBytes(difference)} over ${formatBytes(job.targetBytes)}`,
    copy: "Try a stronger mode, split the PDF, or use a smaller target only when the destination portal requires it."
  };
}

function needsAction(job: UploadJob) {
  if (job.status !== "success" || !job.result) {
    return false;
  }

  return Boolean(getSuggestedAction(job));
}

function analyticsModeParams(mode: CompressionMode, targetBytes?: number) {
  return {
    mode,
    target_size: targetBytes ? formatBytes(targetBytes) : "none",
    has_target: Boolean(targetBytes)
  };
}

async function renderFirstPagePreview(source: Blob | File) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Preview rendering is only available in the browser.");
  }

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.mjs",
      import.meta.url
    ).toString();
  }

  const bytes = new Uint8Array(await source.arrayBuffer());
  const loadingTask = pdfjs.getDocument({
    data: bytes.slice(),
    useSystemFonts: true,
    isEvalSupported: false
  } as Parameters<typeof pdfjs.getDocument>[0]);
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 0.42 });
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

  const previewUrl = canvas.toDataURL("image/jpeg", 0.82);

  canvas.width = 0;
  canvas.height = 0;
  page.cleanup();
  await loadingTask.destroy();

  return previewUrl;
}

export function UploadCard({
  copy = "Batch-ready PDF compression",
  heading = "Compress PDF files",
  initialTarget
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const jobsRef = useRef<UploadJob[]>([]);
  const [mode, setMode] = useState<CompressionMode>(inferCompressionMode(initialTarget || copy));
  const [targetBytes, setTargetBytes] = useState(0);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [queueNotice, setQueueNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  const modeMeta = useMemo(() => getCompressionMode(mode), [mode]);
  const hasJobs = jobs.length > 0;
  const processing = jobs.some((job) => job.status === "processing") || isPending;
  const successJobs = jobs.filter((job) => job.status === "success" && job.result);
  const queuedJobs = jobs.filter((job) => job.status === "queued");
  const errorJobs = jobs.filter((job) => job.status === "error");
  const actionJobs = jobs.filter(needsAction);
  const visibleJobs = jobs.filter((job) => {
    if (queueFilter === "needs-action") {
      return needsAction(job);
    }

    if (queueFilter === "done") {
      return job.status === "success";
    }

    if (queueFilter === "issues") {
      return job.status === "error";
    }

    return true;
  });

  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  const totals = successJobs.reduce(
    (acc, job) => {
      if (!job.result) {
        return acc;
      }

      acc.original += job.result.originalBytes;
      acc.compressed += job.result.compressedBytes;
      acc.saved += job.result.savedBytes;
      acc.pages += job.result.pageCount;
      return acc;
    },
    { original: 0, compressed: 0, saved: 0, pages: 0 }
  );

  const totalReduction =
    totals.original > 0 ? Math.round((totals.saved / totals.original) * 100) : 0;

  function updateJob(id: string, updater: (job: UploadJob) => UploadJob) {
    setJobs((current) => current.map((job) => (job.id === id ? updater(job) : job)));
  }

  function buildJobs(fileList: FileList | File[]) {
    return Array.from(fileList).map((file) => {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        return {
          id: jobId(file),
          file,
          mode,
          targetBytes,
          status: "error" as const,
          error: createPdfError(file.name),
          errorTitle: "Unsupported file",
          errorHint: "Upload a real .pdf file before starting compression."
        };
      }

      if (file.size === 0) {
        return {
          id: jobId(file),
          file,
          mode,
          targetBytes,
          status: "error" as const,
          error: createEmptyFileError(file.name),
          errorTitle: "Empty PDF",
          errorHint: "Use a PDF that contains actual document pages."
        };
      }

      if (file.size > MAX_FILE_BYTES) {
        return {
          id: jobId(file),
          file,
          mode,
          targetBytes,
          status: "error" as const,
          error: createFileTooLargeError(file.name),
          errorTitle: "File too large",
          errorHint: "Split the file first or try a smaller PDF in the browser flow."
        };
      }

      return {
        id: jobId(file),
        file,
        mode,
        targetBytes,
        status: "queued" as const
      };
    });
  }

  function queueFiles(fileList: FileList | File[]) {
    if (typeof window === "undefined" || typeof FileReader === "undefined") {
      setJobs((current) => [
        ...current,
        {
          id: `browser-support-${Date.now()}`,
          file: new File([], "unsupported-browser.pdf", { type: "application/pdf" }),
          mode,
          targetBytes,
          status: "error",
          errorTitle: "Browser not supported",
          error:
            "This browser does not support the current PDF compression flow. Try a modern Chrome, Edge, Safari, or Firefox build.",
          errorHint: "Switch to a modern browser with FileReader and current PDF APIs enabled."
        }
      ]);
      return;
    }

    const items = buildJobs(fileList);

    if (!items.length) {
      return;
    }

    setQueueFilter("all");
    setQueueNotice(`${items.length} file${items.length === 1 ? "" : "s"} added to the queue.`);
    setJobs((current) => [...current, ...items]);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) {
      trackEvent("file_selected", {
        file_count: event.target.files.length,
        source: "file_picker",
        ...analyticsModeParams(mode, targetBytes)
      });
      queueFiles(event.target.files);
      event.target.value = "";
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files?.length) {
      trackEvent("file_selected", {
        file_count: event.dataTransfer.files.length,
        source: "dropzone",
        ...analyticsModeParams(mode, targetBytes)
      });
      queueFiles(event.dataTransfer.files);
    }
  }

  function triggerFilePicker() {
    inputRef.current?.click();
  }

  function getJobSnapshot(id: string) {
    return jobsRef.current.find((job) => job.id === id);
  }

  async function processJob(
    id: string,
    selectedMode: CompressionMode,
    sourceFile?: File,
    selectedTargetBytes = targetBytes
  ) {
    const currentJob = getJobSnapshot(id);
    const file = currentJob?.file ?? sourceFile;

    if (!file || currentJob?.status === "processing") {
      return;
    }

    updateJob(id, (job) => ({
      ...job,
      status: "processing",
      mode: selectedMode,
      targetBytes: selectedTargetBytes,
      error: undefined,
      errorTitle: undefined,
      errorHint: undefined
    }));

    trackEvent("compression_started", {
      file_size: file.size,
      ...analyticsModeParams(selectedMode, selectedTargetBytes)
    });

    try {
      const result = await compressPdfFile(file, selectedMode, {
        targetBytes: selectedTargetBytes || undefined
      });
      const targetMet = selectedTargetBytes ? result.compressedBytes <= selectedTargetBytes : false;
      updateJob(id, (job) => ({
        ...job,
        status: "success",
        mode: selectedMode,
        targetBytes: selectedTargetBytes,
        result,
        error: undefined
      }));
      trackEvent("compression_success", {
        file_size: file.size,
        original_bytes: result.originalBytes,
        compressed_bytes: result.compressedBytes,
        saved_bytes: result.savedBytes,
        reduction_percent: Math.round(result.reductionRatio * 100),
        page_count: result.pageCount,
        document_profile: result.documentProfile,
        target_met: targetMet,
        compression_path: result.compressionDetails ?? "pdf-lib",
        ...analyticsModeParams(selectedMode, selectedTargetBytes)
      });

      if (targetMet) {
        trackEvent("target_size_met", {
          compressed_bytes: result.compressedBytes,
          target_bytes: selectedTargetBytes,
          ...analyticsModeParams(selectedMode, selectedTargetBytes)
        });
      }
    } catch (error) {
      const normalized = normalizeCompressionError(error, file, selectedMode);

      updateJob(id, (job) => ({
        ...job,
        status: "error",
        mode: selectedMode,
        targetBytes: selectedTargetBytes,
        error: normalized.message,
        errorTitle: normalized.title,
        errorHint: normalized.hint
      }));
      trackEvent("compression_failed", {
        file_size: file.size,
        error_title: normalized.title,
        ...analyticsModeParams(selectedMode, selectedTargetBytes)
      });
    }
  }

  function processAll() {
    const queuedIds = jobs
      .filter((job) => job.status === "queued" || (job.status === "success" && job.mode !== mode))
      .map((job) => job.id);

    if (!queuedIds.length) {
      return;
    }

    setQueueNotice(`Compressing ${queuedIds.length} file${queuedIds.length === 1 ? "" : "s"} with ${getCompressionMode(mode).label}.`);

    startTransition(async () => {
      for (const id of queuedIds) {
        await processJob(id, mode, undefined, targetBytes);
      }
      setQueueNotice(`${queuedIds.length} file${queuedIds.length === 1 ? "" : "s"} processed with ${getCompressionMode(mode).label}.`);
    });
  }

  function tryStronger(job: UploadJob) {
    const strongerMode = chooseStrongerMode(job.mode);
    if (!strongerMode) {
      return;
    }

    trackEvent("try_stronger_clicked", {
      from_mode: job.mode,
      to_mode: strongerMode,
      file_size: job.file.size,
      compressed_bytes: job.result?.compressedBytes,
      ...analyticsModeParams(strongerMode, job.targetBytes ?? targetBytes)
    });

    startTransition(async () => {
      await processJob(job.id, strongerMode, undefined, job.targetBytes ?? targetBytes);
    });
  }

  function tryStrongerForActionJobs() {
    const retryPlan = jobs
      .filter((job) => job.status === "success" && job.result)
      .map((job) => ({
        job,
        action: getSuggestedAction(job)
      }))
      .filter((item): item is { job: UploadJob; action: SuggestedAction } => Boolean(item.action));

    if (!retryPlan.length) {
      return;
    }

    trackEvent("bulk_try_stronger_clicked", {
      file_count: retryPlan.length
    });

    const modeLabels = Array.from(
      new Set(retryPlan.map((item) => getCompressionMode(item.action.mode).label))
    ).join(", ");
    setQueueNotice(`Retrying ${retryPlan.length} file${retryPlan.length === 1 ? "" : "s"} with ${modeLabels}.`);

    startTransition(async () => {
      for (const item of retryPlan) {
        await processJob(
          item.job.id,
          item.action.mode,
          undefined,
          item.job.targetBytes ?? targetBytes
        );
      }
      setQueueNotice(`${retryPlan.length} file${retryPlan.length === 1 ? "" : "s"} retried with ${modeLabels}.`);
    });
  }

  function retryIssueJobs() {
    const retryJobs = jobs.filter((job) => job.status === "error");

    if (!retryJobs.length) {
      return;
    }

    trackEvent("bulk_retry_issues_clicked", {
      file_count: retryJobs.length
    });

    setQueueNotice(`Retrying ${retryJobs.length} issue${retryJobs.length === 1 ? "" : "s"}.`);

    startTransition(async () => {
      for (const job of retryJobs) {
        await processJob(job.id, job.mode, undefined, job.targetBytes ?? targetBytes);
      }
      setQueueNotice(`${retryJobs.length} issue${retryJobs.length === 1 ? "" : "s"} retried.`);
    });
  }

  function downloadJob(job: UploadJob) {
    if (!job.result) {
      return;
    }

    const url = URL.createObjectURL(job.result.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = job.result.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    trackEvent("download_clicked", {
      file_size: job.file.size,
      compressed_bytes: job.result.compressedBytes,
      reduction_percent: Math.round(job.result.reductionRatio * 100),
      ...analyticsModeParams(job.result.mode, job.targetBytes)
    });
  }

  function downloadAll() {
    trackEvent("download_zip_clicked", {
      file_count: successJobs.length,
      total_saved_bytes: totals.saved,
      total_compressed_bytes: totals.compressed
    });
    void downloadFilesAsZip(
      "compressed-pdf-files.zip",
      successJobs
        .filter((job) => job.result)
        .map((job) => ({
          fileName: job.result!.fileName,
          blob: job.result!.blob
        }))
    );
  }

  async function previewJob(job: UploadJob) {
    if (!job.result || job.previewStatus === "rendering") {
      return;
    }

    updateJob(job.id, (current) => ({
      ...current,
      previewStatus: "rendering",
      previewError: undefined
    }));
    trackEvent("preview_clicked", {
      file_size: job.file.size,
      compressed_bytes: job.result.compressedBytes,
      ...analyticsModeParams(job.result.mode, job.targetBytes)
    });

    try {
      const [originalPreviewUrl, compressedPreviewUrl] = await Promise.all([
        renderFirstPagePreview(job.file),
        renderFirstPagePreview(job.result.blob)
      ]);
      updateJob(job.id, (current) => ({
        ...current,
        previewStatus: "ready",
        originalPreviewUrl,
        compressedPreviewUrl,
        previewError: undefined
      }));
      trackEvent("preview_success", {
        file_size: job.file.size,
        compressed_bytes: job.result.compressedBytes,
        ...analyticsModeParams(job.result.mode, job.targetBytes)
      });
    } catch (error) {
      updateJob(job.id, (current) => ({
        ...current,
        previewStatus: "error",
        previewError: error instanceof Error ? error.message : "Preview could not be rendered."
      }));
      trackEvent("preview_failed", {
        file_size: job.file.size,
        error_message: error instanceof Error ? error.message : "Preview could not be rendered.",
        ...analyticsModeParams(job.result.mode, job.targetBytes)
      });
    }
  }

  return (
    <aside className="panel upload-card">
      <div className="upload-card__top">
        <div className="upload-card__header">
          <span className="eyebrow">{copy}</span>
          <h2>{heading}</h2>
          <p>Upload, compress, download.</p>
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
          onClick={triggerFilePicker}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              triggerFilePicker();
            }
          }}
        >
          <strong>Drop PDF files here</strong>
          <span>or click to choose files</span>
          <small>PDF only. Batch upload supported. Up to 50 MB per file in the current browser flow.</small>
          <input
            ref={inputRef}
            className="upload-dropzone__input"
            type="file"
            accept="application/pdf,.pdf"
            multiple
            onChange={onInputChange}
          />
        </div>

        <div className="upload-mode">
          <div className="upload-mode__row">
            <span className="upload-mode__label">Compression mode</span>
          </div>
          <div className="compression-mode-grid" role="radiogroup" aria-label="Compression mode">
            {compressionModes.map((item) => (
              <button
                aria-checked={mode === item.id}
                className={`compression-mode-pill${
                  mode === item.id ? " compression-mode-pill--active" : ""
                }`}
                key={item.id}
                onClick={() => {
                  if (item.id !== mode) {
                    trackEvent("compression_mode_changed", {
                      from_mode: mode,
                      to_mode: item.id,
                      ...analyticsModeParams(item.id, targetBytes)
                    });
                  }
                  setMode(item.id);
                }}
                role="radio"
                type="button"
              >
                <strong>{item.label}</strong>
                <span>{item.bestFor}</span>
              </button>
            ))}
          </div>
          <div className="upload-mode__meta">
            <strong>{modeMeta.bestFor}</strong>
            <span>{modeMeta.description}</span>
          </div>
        </div>

        <div className="upload-mode">
          <div className="upload-mode__row">
            <label htmlFor="target-size">Target size</label>
            <select
              id="target-size"
              value={targetBytes}
              onChange={(event) => {
                const nextTargetBytes = Number(event.target.value);
                setTargetBytes(nextTargetBytes);
                trackEvent("target_size_changed", {
                  target_size: nextTargetBytes ? formatBytes(nextTargetBytes) : "none",
                  target_bytes: nextTargetBytes
                });
              }}
            >
              {targetSizeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="upload-mode__meta">
            <strong>{targetBytes ? `Aim for ${formatBytes(targetBytes)}` : "Maximum practical reduction"}</strong>
            <span>
              {targetBytes
                ? "The browser will show whether the result fits your selected upload limit and suggest the next stronger retry when needed."
                : "Use this when you only need the smallest practical browser-side result, not a fixed portal limit."}
            </span>
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={processing}
            onClick={hasJobs ? processAll : triggerFilePicker}
          >
            {processing ? "Compressing..." : hasJobs ? "Compress files" : "Choose PDF files"}
          </button>
          <div className="upload-actions__secondary">
            <button
              type="button"
              className="button button--secondary"
              disabled={!hasJobs || processing}
              onClick={() => {
                setQueueFilter("all");
                setQueueNotice(null);
                setJobs([]);
              }}
            >
              Clear list
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={!successJobs.length}
              onClick={downloadAll}
            >
              Download ZIP
            </button>
          </div>
        </div>
      </div>

      {!hasJobs ? (
        <div className="upload-empty">
          <div className="upload-empty__badge">Results will appear here</div>
          <div className="upload-empty__grid">
            <div>
              <span>Before</span>
              <strong>8.4 MB</strong>
            </div>
            <div>
              <span>After</span>
              <strong>2.1 MB</strong>
            </div>
            <div>
              <span>Saved</span>
              <strong>75%</strong>
            </div>
          </div>
          <p>Upload a PDF to see file size reduction, download actions, and stronger compression options.</p>
        </div>
      ) : null}

      {hasJobs ? (
        <div className="upload-queue-bar">
          <div className="upload-queue-bar__stats" aria-label="Compression queue status">
            <span>
              <strong>{jobs.length}</strong> total
            </span>
            <span>
              <strong>{successJobs.length}</strong> done
            </span>
            <span>
              <strong>{actionJobs.length}</strong> need action
            </span>
            <span>
              <strong>{queuedJobs.length}</strong> waiting
            </span>
            {errorJobs.length ? (
              <span className="upload-queue-bar__error">
                <strong>{errorJobs.length}</strong> issue{errorJobs.length === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
          <div className="upload-queue-bar__actions">
            <button
              type="button"
              className="button button--secondary"
              disabled={!queuedJobs.length || processing}
              onClick={processAll}
            >
              Compress remaining
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={!successJobs.length}
              onClick={downloadAll}
            >
              Download ZIP
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={processing}
              onClick={() => {
                setQueueFilter("all");
                setQueueNotice(null);
                setJobs([]);
              }}
            >
              Clear
            </button>
          </div>
          <div className="upload-queue-bar__actions upload-queue-bar__actions--secondary">
            <button
              type="button"
              className="button button--secondary"
              disabled={!actionJobs.some((job) => job.status === "success" && job.result) || processing}
              onClick={tryStrongerForActionJobs}
            >
              Try stronger needs action
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={!errorJobs.length || processing}
              onClick={retryIssueJobs}
            >
              Retry issues
            </button>
          </div>
          {queueNotice ? (
            <div className="upload-queue-notice" role="status">
              {queueNotice}
            </div>
          ) : null}
          <div className="upload-queue-filter" role="tablist" aria-label="Filter compression results">
            {[
              { id: "all" as const, label: "All", count: jobs.length },
              { id: "needs-action" as const, label: "Needs action", count: actionJobs.length },
              { id: "done" as const, label: "Done", count: successJobs.length },
              { id: "issues" as const, label: "Issues", count: errorJobs.length }
            ].map((item) => (
              <button
                aria-selected={queueFilter === item.id}
                className={`upload-queue-filter__button${
                  queueFilter === item.id ? " upload-queue-filter__button--active" : ""
                }`}
                disabled={!item.count && item.id !== "all"}
                key={item.id}
                onClick={() => {
                  setQueueFilter(item.id);
                  trackEvent("queue_filter_changed", {
                    filter: item.id,
                    result_count: item.count
                  });
                }}
                role="tab"
                type="button"
              >
                {item.label}
                <span>{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {successJobs.length ? (
        <div className="upload-summary">
          <div>
            <strong>{successJobs.length}</strong>
            <span>compressed files</span>
          </div>
          <div>
            <strong>{formatBytes(totals.saved)}</strong>
            <span>total saved</span>
          </div>
          <div>
            <strong>{formatBytes(totals.compressed)}</strong>
            <span>current total size</span>
          </div>
          <div>
            <strong>{totalReduction}%</strong>
            <span>average reduction</span>
          </div>
          <div>
            <strong>{totals.pages}</strong>
            <span>processed pages</span>
          </div>
        </div>
      ) : null}

      {hasJobs ? (
        <div className="upload-jobs">
          {!visibleJobs.length ? (
            <div className="upload-jobs__empty">
              <strong>No files in this view</strong>
              <span>Switch filters to see the rest of the compression queue.</span>
            </div>
          ) : null}
          {visibleJobs.map((job) => {
            const strongerMode = chooseStrongerMode(job.mode);
            const suggestedMode = chooseSuggestedMode(job);
            const suggestedAction = getSuggestedAction(job);
            const targetStatus = formatTargetStatus(job);
            const selectedQualityHint = qualityHint(job);
            const compactResult = jobs.length > 1 && job.status === "success" && Boolean(job.result);
            return (
              <article className="upload-job" key={job.id}>
                <div className="upload-job__head">
                  <div>
                    <strong>{job.file.name}</strong>
                    <span>
                      {formatBytes(job.file.size)} · {getCompressionMode(job.mode).label}
                    </span>
                  </div>
                  <span className={`upload-job__status upload-job__status--${job.status}`}>
                    {job.status}
                  </span>
                </div>

                {job.result ? (
                  <div className="upload-job__result">
                    {compactResult ? (
                      <div className="upload-job__compact-result">
                        <div className="upload-job__compact-metrics">
                          <span>
                            <strong>{Math.round(job.result.reductionRatio * 100)}%</strong>
                            smaller
                          </span>
                          <span>
                            <strong>{formatBytes(job.result.compressedBytes)}</strong>
                            after
                          </span>
                          <span>
                            <strong>{formatBytes(job.result.savedBytes)}</strong>
                            saved
                          </span>
                        </div>
                        {targetStatus ? (
                          <div
                            className={`upload-job__compact-target ${
                              targetStatus.met
                                ? "upload-job__compact-target--success"
                                : "upload-job__compact-target--missed"
                            }`}
                          >
                            {targetStatus.title}
                          </div>
                        ) : null}
                        <div className="upload-job__compact-actions">
                          <button
                            type="button"
                            className="button button--primary"
                            onClick={() => downloadJob(job)}
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            className="button button--secondary"
                            disabled={!suggestedAction || processing}
                            onClick={() => {
                              if (!suggestedAction) {
                                return;
                              }

                              startTransition(async () => {
                                await processJob(
                                  job.id,
                                  suggestedAction.mode,
                                  undefined,
                                  job.targetBytes ?? targetBytes
                                );
                              });
                            }}
                          >
                            {suggestedAction ? suggestedAction.label : "Strongest used"}
                          </button>
                          <button
                            type="button"
                            className="button button--secondary"
                            disabled={job.previewStatus === "rendering"}
                            onClick={() => {
                              void previewJob(job);
                            }}
                          >
                            {job.previewStatus === "rendering" ? "Rendering" : "Compare"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="upload-job__outcome">
                          <div>
                            <span className="upload-job__outcome-label">Compressed result</span>
                            <strong>{Math.round(job.result.reductionRatio * 100)}% smaller</strong>
                            <span>
                              {formatBytes(job.result.originalBytes)} to {formatBytes(job.result.compressedBytes)}
                            </span>
                          </div>
                          <div className="upload-job__outcome-save">
                            <span>Saved</span>
                            <strong>{formatBytes(job.result.savedBytes)}</strong>
                          </div>
                        </div>
                        {targetStatus ? (
                          <div
                            className={`upload-job__target-status ${
                              targetStatus.met
                                ? "upload-job__target-status--success"
                                : "upload-job__target-status--missed"
                            }`}
                          >
                            <strong>{targetStatus.title}</strong>
                            <span>{targetStatus.copy}</span>
                          </div>
                        ) : (
                          <div className="upload-job__target-status upload-job__target-status--neutral">
                            <strong>Ready to download</strong>
                            <span>No fixed target size was selected for this compression run.</span>
                          </div>
                        )}
                        <div className="upload-job__stats">
                          <div>
                            <span>Before</span>
                            <strong>{formatBytes(job.result.originalBytes)}</strong>
                          </div>
                          <div>
                            <span>After</span>
                            <strong>{formatBytes(job.result.compressedBytes)}</strong>
                          </div>
                          <div>
                            <span>Saved</span>
                            <strong>{formatBytes(job.result.savedBytes)}</strong>
                          </div>
                          <div>
                            <span>Reduction</span>
                            <strong>{Math.round(job.result.reductionRatio * 100)}%</strong>
                          </div>
                          <div>
                            <span>Mode</span>
                            <strong>{getCompressionMode(job.result.mode).label}</strong>
                          </div>
                          <div>
                            <span>Pages</span>
                            <strong>{job.result.pageCount}</strong>
                          </div>
                          <div>
                            <span>Profile</span>
                            <strong>{job.result.profileLabel}</strong>
                          </div>
                          {job.targetBytes ? (
                            <div>
                              <span>Target</span>
                              <strong>{formatBytes(job.targetBytes)}</strong>
                            </div>
                          ) : null}
                        </div>
                        <p className="upload-job__summary">
                          {resultSummary(job.result.mode, job.result.reductionRatio)}
                        </p>
                        {job.result.warning ? <p className="upload-job__warning">{job.result.warning}</p> : null}
                        {job.result.recommendation ? (
                          <p className="upload-job__recommendation">{job.result.recommendation}</p>
                        ) : null}
                        {suggestedAction ? (
                          <div className="upload-job__next-step">
                            <strong>Recommended next step</strong>
                            <span>{suggestedAction.reason}</span>
                          </div>
                        ) : null}
                        <div className="upload-job__actions">
                          <button
                            type="button"
                            className="button button--primary"
                            onClick={() => downloadJob(job)}
                          >
                            Download PDF
                          </button>
                          <button
                            type="button"
                            className="button button--secondary"
                            disabled={!suggestedAction || processing}
                            onClick={() => {
                              if (!suggestedAction) {
                                return;
                              }

                              startTransition(async () => {
                                await processJob(
                                  job.id,
                                  suggestedAction.mode,
                                  undefined,
                                  job.targetBytes ?? targetBytes
                                );
                              });
                            }}
                          >
                            {suggestedAction ? suggestedAction.label : "Strongest used"}
                          </button>
                          {strongerMode && suggestedMode !== strongerMode ? (
                            <button
                              type="button"
                              className="button button--secondary"
                              disabled={processing}
                              onClick={() => tryStronger(job)}
                            >
                              Try {getCompressionMode(strongerMode).label}
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="button button--secondary"
                            disabled={job.previewStatus === "rendering"}
                            onClick={() => {
                              void previewJob(job);
                            }}
                          >
                            {job.previewStatus === "rendering" ? "Rendering preview" : "Compare first page"}
                          </button>
                        </div>
                        <details className="upload-job__details">
                          <summary>Technical details</summary>
                          <div className="upload-job__details-body">
                            <div className="upload-job__hint upload-job__hint--neutral">
                              <strong>
                                {formatPagesLabel(job.result.pageCount)} · {formatBytes(job.result.bytesPerPage)} per page
                              </strong>
                              <span>
                                FileSmaller is using page count and bytes-per-page signals to decide whether this PDF behaves more like a clean office file, a mixed document, or a scan.
                              </span>
                            </div>
                            {job.result.likelyImageHeavy ? (
                              <div className="upload-job__hint">
                                <strong>Looks like a scanned or image-heavy PDF</strong>
                                <span>
                                  Larger bytes per page usually means this file is driven more by images than text.
                                </span>
                              </div>
                            ) : null}
                            {job.result.compressionDetails ? (
                              <div className="upload-job__hint upload-job__hint--neutral">
                                <strong>Compression path</strong>
                                <span>{job.result.compressionDetails}</span>
                              </div>
                            ) : null}
                            {selectedQualityHint ? (
                              <div
                                className={`upload-job__hint ${
                                  selectedQualityHint.tone === "target" ? "upload-job__hint--target" : "upload-job__hint--neutral"
                                }`}
                              >
                                <strong>{selectedQualityHint.title}</strong>
                                <span>{selectedQualityHint.copy}</span>
                              </div>
                            ) : null}
                          </div>
                        </details>
                      </>
                    )}
                    {job.originalPreviewUrl && job.compressedPreviewUrl ? (
                      <div className="upload-job__preview-grid">
                        <figure className="upload-job__preview">
                          <img alt={`Original first-page preview of ${job.file.name}`} src={job.originalPreviewUrl} />
                          <figcaption>Original first page</figcaption>
                        </figure>
                        <figure className="upload-job__preview">
                          <img alt={`Compressed first-page preview of ${job.result.fileName}`} src={job.compressedPreviewUrl} />
                          <figcaption>Compressed first page</figcaption>
                        </figure>
                      </div>
                    ) : null}
                    {job.previewError ? (
                      <p className="upload-job__warning">{job.previewError}</p>
                    ) : null}
                  </div>
                ) : null}

                {job.status === "error" ? (
                  <div className="upload-job__error">
                    <strong>{job.errorTitle ?? "Compression failed"}</strong>
                    <span>{job.error}</span>
                    {job.errorHint ? <small>{job.errorHint}</small> : null}
                  </div>
                ) : null}
                {job.status === "error" ? (
                  <div className="upload-job__actions">
                    <button
                      type="button"
                      className="button button--secondary"
                      disabled={processing}
                      onClick={() => {
                        startTransition(async () => {
                          await processJob(job.id, job.mode, undefined, job.targetBytes ?? targetBytes);
                        });
                      }}
                    >
                      Retry compression
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </aside>
  );
}
