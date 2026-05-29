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

type UploadCardProps = {
  copy?: string;
  heading?: string;
  initialTarget?: string;
};

type UploadJobStatus = "queued" | "processing" | "success" | "error";

type UploadJob = {
  id: string;
  file: File;
  status: UploadJobStatus;
  mode: CompressionMode;
  targetBytes?: number;
  result?: CompressionResult;
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
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  const modeMeta = useMemo(() => getCompressionMode(mode), [mode]);
  const hasJobs = jobs.length > 0;
  const processing = jobs.some((job) => job.status === "processing") || isPending;
  const successJobs = jobs.filter((job) => job.status === "success" && job.result);

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

    setJobs((current) => [...current, ...items]);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) {
      queueFiles(event.target.files);
      event.target.value = "";
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files?.length) {
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

    try {
      const result = await compressPdfFile(file, selectedMode);
      updateJob(id, (job) => ({
        ...job,
        status: "success",
        mode: selectedMode,
        targetBytes: selectedTargetBytes,
        result,
        error: undefined
      }));
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
    }
  }

  function processAll() {
    const queuedIds = jobs
      .filter((job) => job.status === "queued" || (job.status === "success" && job.mode !== mode))
      .map((job) => job.id);

    startTransition(async () => {
      for (const id of queuedIds) {
        await processJob(id, mode, undefined, targetBytes);
      }
    });
  }

  function tryStronger(job: UploadJob) {
    const strongerMode = chooseStrongerMode(job.mode);
    if (!strongerMode) {
      return;
    }

    startTransition(async () => {
      await processJob(job.id, strongerMode, undefined, job.targetBytes ?? targetBytes);
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
  }

  function downloadAll() {
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
            <label htmlFor="compression-mode">Compression mode</label>
            <select
              id="compression-mode"
              value={mode}
              onChange={(event) => setMode(event.target.value as CompressionMode)}
            >
              {compressionModes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
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
              onChange={(event) => setTargetBytes(Number(event.target.value))}
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
              onClick={() => setJobs([])}
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
          {jobs.map((job) => {
            const strongerMode = chooseStrongerMode(job.mode);
            const suggestedMode = chooseSuggestedMode(job);
            const suggestedAction = getSuggestedAction(job);
            const targetStatus = formatTargetStatus(job);
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
                    {targetStatus ? (
                      <div
                        className={`upload-job__hint ${
                          targetStatus.met ? "upload-job__hint--success" : "upload-job__hint--target"
                        }`}
                      >
                        <strong>{targetStatus.title}</strong>
                        <span>{targetStatus.copy}</span>
                      </div>
                    ) : null}
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
                    </div>
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
