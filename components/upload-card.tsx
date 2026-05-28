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
  result?: CompressionResult;
  error?: string;
};

const MAX_FILE_BYTES = 50 * 1024 * 1024;

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

export function UploadCard({
  copy = "Batch-ready PDF compression",
  heading = "Compress PDF files",
  initialTarget
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const jobsRef = useRef<UploadJob[]>([]);
  const [mode, setMode] = useState<CompressionMode>(inferCompressionMode(initialTarget || copy));
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
      return acc;
    },
    { original: 0, compressed: 0, saved: 0 }
  );

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
          status: "error" as const,
          error: createPdfError(file.name)
        };
      }

      if (file.size === 0) {
        return {
          id: jobId(file),
          file,
          mode,
          status: "error" as const,
          error: createEmptyFileError(file.name)
        };
      }

      if (file.size > MAX_FILE_BYTES) {
        return {
          id: jobId(file),
          file,
          mode,
          status: "error" as const,
          error: createFileTooLargeError(file.name)
        };
      }

      return {
        id: jobId(file),
        file,
        mode,
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
          status: "error",
          error:
            "This browser does not support the current PDF compression flow. Try a modern Chrome, Edge, Safari, or Firefox build."
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

  async function processJob(id: string, selectedMode: CompressionMode, sourceFile?: File) {
    const currentJob = getJobSnapshot(id);
    const file = currentJob?.file ?? sourceFile;

    if (!file || currentJob?.status === "processing") {
      return;
    }

    updateJob(id, (job) => ({
      ...job,
      status: "processing",
      mode: selectedMode,
      error: undefined
    }));

    try {
      const result = await compressPdfFile(file, selectedMode);
      updateJob(id, (job) => ({
        ...job,
        status: "success",
        mode: selectedMode,
        result,
        error: undefined
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "This PDF could not be processed. Try another mode or a smaller file.";

      updateJob(id, (job) => ({
        ...job,
        status: "error",
        mode: selectedMode,
        error: message
      }));
    }
  }

  function processAll() {
    const queuedIds = jobs.filter((job) => job.status === "queued").map((job) => job.id);

    startTransition(async () => {
      for (const id of queuedIds) {
        await processJob(id, mode);
      }
    });
  }

  function tryStronger(job: UploadJob) {
    const strongerMode = chooseStrongerMode(job.mode);
    if (!strongerMode) {
      return;
    }

    startTransition(async () => {
      await processJob(job.id, strongerMode);
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
    successJobs.forEach((job) => downloadJob(job));
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
              Download all
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
        </div>
      ) : null}

      {hasJobs ? (
        <div className="upload-jobs">
          {jobs.map((job) => {
            const strongerMode = chooseStrongerMode(job.mode);
            const suggestedMode = chooseSuggestedMode(job);
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
                    </div>
                    <p className="upload-job__summary">
                      {resultSummary(job.result.mode, job.result.reductionRatio)}
                    </p>
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
                        disabled={!suggestedMode || processing}
                        onClick={() => {
                          if (!suggestedMode) {
                            return;
                          }

                          startTransition(async () => {
                            await processJob(job.id, suggestedMode);
                          });
                        }}
                      >
                        {suggestedMode
                          ? `Try ${getCompressionMode(suggestedMode).label}`
                          : "Strongest used"}
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

                {job.status === "error" ? <p className="upload-job__error">{job.error}</p> : null}
                {job.status === "error" ? (
                  <div className="upload-job__actions">
                    <button
                      type="button"
                      className="button button--secondary"
                      disabled={processing}
                      onClick={() => {
                        startTransition(async () => {
                          await processJob(job.id, job.mode);
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
