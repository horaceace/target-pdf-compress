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
import { useTranslations } from "next-intl";
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
import { getBrowserLimitAction } from "@/lib/pdf/browser-limit-action.mjs";
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

function jobId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

type TFunc = ReturnType<typeof useTranslations>;

function getTranslatedModeLabel(t: TFunc, mode: CompressionMode) {
  const keyMap: Record<CompressionMode, string> = {
    light: "modes.light.label",
    balanced: "modes.balanced.label",
    strong: "modes.strong.label",
    extreme: "modes.extreme.label",
    scanned: "modes.scanned.label"
  };
  return t(keyMap[mode]);
}

function getTranslatedProfileLabel(t: TFunc, profile: string) {
  const keyMap: Record<string, string> = {
    "scanned-heavy": "profiles.scanned-heavy",
    "image-heavy": "profiles.image-heavy",
    "clean-office": "profiles.clean-office",
    mixed: "profiles.mixed"
  };
  return t(keyMap[profile] || profile);
}

function createPdfError(t: TFunc, fileName: string) {
  return t("errors.unsupportedFile", { fileName });
}

function createEmptyFileError(t: TFunc, fileName: string) {
  return t("errors.emptyFile", { fileName });
}

function createFileTooLargeError(t: TFunc, fileName: string) {
  return t("errors.fileTooLarge", { fileName });
}

function normalizeCompressionError(t: TFunc, error: unknown, file: File, mode: CompressionMode) {
  const fallback = {
    title: t("errors.compressionFailedTitle"),
    message: t("errors.compressionFailedMessage"),
    hint: t("errors.compressionFailedHint")
  };

  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message || "";
  const lowered = message.toLowerCase();

  if (
    lowered.includes("encrypted") ||
    lowered.includes("password") ||
    message.includes("ENCRYPTED_PDF_PASSWORD_REQUIRED")
  ) {
    return {
      title: t("errors.protectedPdfTitle"),
      message: t("errors.protectedPdfMessage", { fileName: file.name }),
      hint: t("errors.protectedPdfHint")
    };
  }

  if (lowered.includes("empty")) {
    return {
      title: t("errors.emptyPdfTitle"),
      message,
      hint: t("errors.emptyPdfHint")
    };
  }

  if (lowered.includes("invalid") || lowered.includes("failed to parse") || lowered.includes("read")) {
    return {
      title: t("errors.unreadablePdfTitle"),
      message: t("errors.unreadablePdfMessage", { fileName: file.name }),
      hint: t("errors.unreadablePdfHint")
    };
  }

  if (file.size > 25 * 1024 * 1024 && (mode === "extreme" || mode === "scanned")) {
    return {
      title: t("errors.browserLimitTitle"),
      message: t("errors.browserLimitMessage", { fileName: file.name }),
      hint: t("errors.browserLimitHint")
    };
  }

  return {
    title: t("errors.compressionFailedTitle"),
    message,
    hint: t("errors.compressionFailedFallbackHint")
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

function getSuggestedAction(t: TFunc, job: UploadJob): SuggestedAction | null {
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
      label: t("tryLabel", { mode: getTranslatedModeLabel(t, "scanned") }),
      reason: t("suggestedAction.tryScannedScan")
    };
  }

  if (result.documentProfile === "image-heavy" && reductionPercent < 18 && mode === "strong") {
    return {
      mode: "scanned",
      label: t("tryLabel", { mode: getTranslatedModeLabel(t, "scanned") }),
      reason: t("suggestedAction.tryScannedImage")
    };
  }

  if (targetMissed && mode !== "scanned") {
    const nextMode = result.likelyImageHeavy ? "scanned" : chooseStrongerMode(mode);

    if (nextMode) {
      return {
        mode: nextMode,
        label: t("tryLabel", { mode: getTranslatedModeLabel(t, nextMode) }),
        reason: t("suggestedAction.tryNextAboveTarget", {
          target: formatBytes(job.targetBytes!),
          mode: getTranslatedModeLabel(t, nextMode)
        })
      };
    }
  }

  if (reductionPercent < 10 && mode === "light") {
    return {
      mode: "balanced",
      label: t("tryLabel", { mode: getTranslatedModeLabel(t, "balanced") }),
      reason: t("suggestedAction.tryBalanced")
    };
  }

  if (reductionPercent < 16 && mode === "balanced") {
    return {
      mode: "strong",
      label: t("tryLabel", { mode: getTranslatedModeLabel(t, "strong") }),
      reason: t("suggestedAction.tryStrong")
    };
  }

  if (reductionPercent < 22 && mode === "strong") {
    return {
      mode: "extreme",
      label: t("tryLabel", { mode: getTranslatedModeLabel(t, "extreme") }),
      reason: t("suggestedAction.tryExtreme")
    };
  }

  const strongerMode = chooseStrongerMode(mode);
  if (!strongerMode) {
    return null;
  }

  return {
    mode: strongerMode,
    label: t("tryLabel", { mode: getTranslatedModeLabel(t, strongerMode) }),
    reason: t("suggestedAction.tryStronger", { mode: getTranslatedModeLabel(t, strongerMode) })
  };
}

function getBrowserLimitActionForJob(job: UploadJob) {
  if (!job.result) {
    return null;
  }

  return getBrowserLimitAction({
    mode: job.mode,
    targetBytes: job.targetBytes,
    compressedBytes: job.result.compressedBytes,
    reductionRatio: job.result.reductionRatio,
    documentProfile: job.result.documentProfile
  });
}

function resultSummary(t: TFunc, mode: CompressionMode, reductionRatio: number) {
  const percent = Math.round(reductionRatio * 100);

  if (mode === "light") {
    return percent > 20 ? t("resultSummary.lightGood") : t("resultSummary.lightDefault");
  }

  if (mode === "balanced") {
    return percent > 25 ? t("resultSummary.balancedGood") : t("resultSummary.balancedDefault");
  }

  if (mode === "strong") {
    return percent > 30 ? t("resultSummary.strongGood") : t("resultSummary.strongDefault");
  }

  if (mode === "extreme") {
    return percent > 35 ? t("resultSummary.extremeGood") : t("resultSummary.extremeDefault");
  }

  return percent > 25 ? t("resultSummary.scannedGood") : t("resultSummary.scannedDefault");
}

function qualityHint(job: UploadJob) {
  const details = job.result?.compressionDetails?.toLowerCase();

  if (!job.result || job.result.mode !== "scanned" || !details) {
    return null;
  }

  if (details.includes("portal limit")) {
    return {
      tone: "target" as const,
      titleKey: "qualityHint.portalLimitTitle",
      copyKey: "qualityHint.portalLimitCopy"
    };
  }

  if (details.includes("smallest scan")) {
    return {
      tone: "neutral" as const,
      titleKey: "qualityHint.balancedScanTitle",
      copyKey: "qualityHint.balancedScanCopy"
    };
  }

  if (details.includes("smaller scan")) {
    return {
      tone: "neutral" as const,
      titleKey: "qualityHint.moderateScanTitle",
      copyKey: "qualityHint.moderateScanCopy"
    };
  }

  return {
    tone: "neutral" as const,
    titleKey: "qualityHint.qualityAwareTitle",
    copyKey: "qualityHint.qualityAwareCopy"
  };
}

function formatTargetStatus(t: TFunc, job: UploadJob) {
  if (!job.targetBytes || !job.result) {
    return null;
  }

  const difference = job.result.compressedBytes - job.targetBytes;

  if (difference <= 0) {
    return {
      met: true,
      title: t("targetStatus.underTarget", { target: formatBytes(job.targetBytes) }),
      copy: t("targetStatus.underTargetCopy", { difference: formatBytes(Math.abs(difference)) })
    };
  }

  return {
    met: false,
    title: t("targetStatus.overTarget", {
      difference: formatBytes(difference),
      target: formatBytes(job.targetBytes)
    }),
    copy: t("targetStatus.overTargetCopy"),
    nextSteps: [
      t("targetStatus.nextTryStronger"),
      t("targetStatus.nextSplit"),
      t("targetStatus.nextBrowserLimit")
    ]
  };
}

function needsAction(job: UploadJob, t: TFunc) {
  if (job.status !== "success" || !job.result) {
    return false;
  }

  return Boolean(getSuggestedAction(t, job) || getBrowserLimitActionForJob(job));
}

function getQueueModeHint(jobs: UploadJob[], selectedMode: CompressionMode, targetBytes: number) {
  if (!jobs.length) {
    return null;
  }

  const validJobs = jobs.filter((job) => job.status !== "error");
  const largestJob = validJobs.reduce<UploadJob | null>((largest, job) => {
    if (!largest || job.file.size > largest.file.size) {
      return job;
    }
    return largest;
  }, null);
  const largePdfCount = validJobs.filter((job) => job.file.size >= 2 * 1024 * 1024).length;
  const strictTarget = targetBytes > 0 && targetBytes <= 1024 * 1024;
  const anyScannedResults = validJobs.some(
    (job) =>
      job.result &&
      (job.result.documentProfile === "image-heavy" ||
        job.result.documentProfile === "scanned-heavy")
  );

  if (anyScannedResults && selectedMode !== "scanned") {
    return {
      titleKey: "queueHint.imageHeavyTitle",
      copyKey: "queueHint.imageHeavyCopy",
      params: {} as Record<string, number>
    };
  }

  if (largePdfCount > 0 && selectedMode !== "scanned") {
    return {
      titleKey: "queueHint.largePdfsTitle",
      copyKey: "queueHint.largePdfsCopy",
      params: { count: largePdfCount } as Record<string, number>
    };
  }

  if (strictTarget && largestJob && largestJob.file.size > targetBytes * 2 && selectedMode === "light") {
    return {
      titleKey: "queueHint.strictTargetTitle",
      copyKey: "queueHint.strictTargetCopy",
      params: {} as Record<string, number>
    };
  }

  return null;
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
  copy,
  heading,
  initialTarget
}: UploadCardProps) {
  const t = useTranslations("UploadCard");
  const tc = useTranslations("Compression");

  const defaultCopy = t("defaultCopy");
  const defaultHeading = t("defaultHeading");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const jobsRef = useRef<UploadJob[]>([]);
  const [mode, setMode] = useState<CompressionMode>(inferCompressionMode(initialTarget || copy || defaultCopy));
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
  const actionJobs = jobs.filter((job) => needsAction(job, t));

  const targetSizeOptions = useMemo(() => [
    { label: t("targetSizes.noTarget"), value: 0 },
    { label: t("targetSizes.under500KB"), value: 500 * 1024 },
    { label: t("targetSizes.under1MB"), value: 1024 * 1024 },
    { label: t("targetSizes.under2MB"), value: 2 * 1024 * 1024 },
    { label: t("targetSizes.under5MB"), value: 5 * 1024 * 1024 }
  ], [t]);

  const queueModeHint = getQueueModeHint(jobs, mode, targetBytes);

  const visibleJobs = jobs.filter((job) => {
    if (queueFilter === "needs-action") {
      return needsAction(job, t);
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
          error: createPdfError(t, file.name),
          errorTitle: t("errors.unsupportedFileTitle"),
          errorHint: t("errors.unsupportedFileHint")
        };
      }

      if (file.size === 0) {
        return {
          id: jobId(file),
          file,
          mode,
          targetBytes,
          status: "error" as const,
          error: createEmptyFileError(t, file.name),
          errorTitle: t("errors.emptyPdfShortTitle"),
          errorHint: t("errors.emptyPdfShortHint")
        };
      }

      if (file.size > MAX_FILE_BYTES) {
        return {
          id: jobId(file),
          file,
          mode,
          targetBytes,
          status: "error" as const,
          error: createFileTooLargeError(t, file.name),
          errorTitle: t("errors.fileTooLargeTitle"),
          errorHint: t("errors.fileTooLargeHint")
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
          errorTitle: t("errors.browserNotSupportedTitle"),
          error: t("errors.browserNotSupportedMessage"),
          errorHint: t("errors.browserNotSupportedHint")
        }
      ]);
      return;
    }

    const items = buildJobs(fileList);

    if (!items.length) {
      return;
    }

    setQueueFilter("all");
    setQueueNotice(t("queueNoticeAdded", { count: items.length }));
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
        targetBytes: selectedTargetBytes || undefined,
        allowPortalLimitScan:
          selectedMode === "scanned" &&
          Boolean(selectedTargetBytes) &&
          (selectedTargetBytes <= 1024 * 1024 || selectedTargetBytes < file.size * 0.45)
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
      } else if (
        getBrowserLimitAction({
          mode: selectedMode,
          targetBytes: selectedTargetBytes,
          compressedBytes: result.compressedBytes,
          reductionRatio: result.reductionRatio,
          documentProfile: result.documentProfile
        })
      ) {
        trackEvent("browser_limit_reached", {
          file_size: file.size,
          compressed_bytes: result.compressedBytes,
          reduction_percent: Math.round(result.reductionRatio * 100),
          document_profile: result.documentProfile,
          compression_path: result.compressionDetails ?? "pdf-lib",
          ...analyticsModeParams(selectedMode, selectedTargetBytes)
        });
      }
    } catch (error) {
      const normalized = normalizeCompressionError(t, error, file, selectedMode);

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

    setQueueNotice(t("queueNoticeCompressing", {
      count: queuedIds.length,
      mode: getTranslatedModeLabel(tc, mode)
    }));

    startTransition(async () => {
      for (const id of queuedIds) {
        await processJob(id, mode, undefined, targetBytes);
      }
      setQueueNotice(t("queueNoticeProcessed", {
        count: queuedIds.length,
        mode: getTranslatedModeLabel(tc, mode)
      }));
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
        action: getSuggestedAction(t, job)
      }))
      .filter((item): item is { job: UploadJob; action: SuggestedAction } => Boolean(item.action));

    if (!retryPlan.length) {
      return;
    }

    trackEvent("bulk_try_stronger_clicked", {
      file_count: retryPlan.length
    });

    const modeLabels = Array.from(
      new Set(retryPlan.map((item) => getTranslatedModeLabel(tc, item.action.mode)))
    ).join(", ");
    setQueueNotice(t("queueNoticeRetrying", {
      count: retryPlan.length,
      modes: modeLabels
    }));

    startTransition(async () => {
      for (const item of retryPlan) {
        await processJob(
          item.job.id,
          item.action.mode,
          undefined,
          item.job.targetBytes ?? targetBytes
        );
      }
      setQueueNotice(t("queueNoticeRetried", {
        count: retryPlan.length,
        modes: modeLabels
      }));
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

    setQueueNotice(t("queueNoticeRetryingIssues", { count: retryJobs.length }));

    startTransition(async () => {
      for (const job of retryJobs) {
        await processJob(job.id, job.mode, undefined, job.targetBytes ?? targetBytes);
      }
      setQueueNotice(t("queueNoticeRetriedIssues", { count: retryJobs.length }));
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
        previewError: error instanceof Error ? error.message : t("errors.previewRenderFailed")
      }));
      trackEvent("preview_failed", {
        file_size: job.file.size,
        error_message: error instanceof Error ? error.message : t("errors.previewRenderFailed"),
        ...analyticsModeParams(job.result.mode, job.targetBytes)
      });
    }
  }

  return (
    <aside className="panel upload-card">
      <div className="upload-card__top">
        <div className="upload-card__header">
          <span className="eyebrow">{copy || defaultCopy}</span>
          <h2>{heading || defaultHeading}</h2>
          <p>{t("tagline")}</p>
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
          <strong>{t("dropzoneHeading")}</strong>
          <span>{t("dropzoneSubtext")}</span>
          <small>{t("dropzoneHint")}</small>
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
            <span className="upload-mode__label">{t("modeLabel")}</span>
          </div>
          <div className="compression-mode-grid" role="radiogroup" aria-label={t("modeAriaLabel")}>
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
                <strong>{tc(`modes.${item.id}.label`)}</strong>
                <span>{tc(`modes.${item.id}.bestFor`)}</span>
              </button>
            ))}
          </div>
          <div className="upload-mode__meta">
            <strong>{tc(`modes.${mode}.bestFor`)}</strong>
            <span>{tc(`modes.${mode}.description`)}</span>
          </div>
        </div>

        <div className="upload-mode">
          <div className="upload-mode__row">
            <label htmlFor="target-size">{t("targetSizeLabel")}</label>
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
            <strong>{targetBytes ? t("aimForTarget", { target: formatBytes(targetBytes) }) : t("maxPracticalReduction")}</strong>
            <span>
              {targetBytes ? t("targetSizeMetaWithTarget") : t("targetSizeMetaNoTarget")}
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
            {processing ? t("compressButtonProcessing") : hasJobs ? t("compressButtonFiles") : t("compressButtonChoose")}
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
              {t("clearList")}
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={!successJobs.length}
              onClick={downloadAll}
            >
              {t("downloadZipButton")}
            </button>
          </div>
        </div>
      </div>

      {!hasJobs ? (
        <div className="upload-empty">
          <div className="upload-empty__badge">{t("emptyBadge")}</div>
          <div className="upload-empty__grid">
            <div>
              <span>{t("emptyBefore")}</span>
              <strong>8.4 MB</strong>
            </div>
            <div>
              <span>{t("emptyAfter")}</span>
              <strong>2.1 MB</strong>
            </div>
            <div>
              <span>{t("emptySaved")}</span>
              <strong>75%</strong>
            </div>
          </div>
          <p>{t("emptyText")}</p>
        </div>
      ) : null}

      {hasJobs ? (
        <div className="upload-queue-bar">
          <div className="upload-queue-bar__stats" aria-label={t("queueAriaLabel")}>
            <span>
              <strong>{jobs.length}</strong> {t("queueTotal")}
            </span>
            <span>
              <strong>{successJobs.length}</strong> {t("queueDone")}
            </span>
            <span>
              <strong>{actionJobs.length}</strong> {t("queueNeedAction")}
            </span>
            <span>
              <strong>{queuedJobs.length}</strong> {t("queueWaiting")}
            </span>
            {errorJobs.length ? (
              <span className="upload-queue-bar__error">
                <strong>{errorJobs.length}</strong> {t("queueIssue")}
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
              {t("compressRemaining")}
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={!successJobs.length}
              onClick={downloadAll}
            >
              {t("downloadZipButton")}
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
              {t("clear")}
            </button>
          </div>
          <div className="upload-queue-bar__actions upload-queue-bar__actions--secondary">
            <button
              type="button"
              className="button button--secondary"
              disabled={!actionJobs.some((job) => job.status === "success" && job.result) || processing}
              onClick={tryStrongerForActionJobs}
            >
              {t("tryRecommendedModes")}
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={!errorJobs.length || processing}
              onClick={retryIssueJobs}
            >
              {t("retryIssues")}
            </button>
          </div>
          {queueNotice ? (
            <div className="upload-queue-notice" role="status">
              {queueNotice}
            </div>
          ) : null}
          {queueModeHint ? (
            <div className="upload-queue-hint">
              <strong>{t(queueModeHint.titleKey, queueModeHint.params)}</strong>
              <span>{t(queueModeHint.copyKey, queueModeHint.params)}</span>
            </div>
          ) : null}
          <div className="upload-queue-filter" role="tablist" aria-label={t("filterAriaLabel")}>
            {([
              { id: "all" as const, labelKey: "filterAll", count: jobs.length },
              { id: "needs-action" as const, labelKey: "filterNeedsAction", count: actionJobs.length },
              { id: "done" as const, labelKey: "filterDone", count: successJobs.length },
              { id: "issues" as const, labelKey: "filterIssues", count: errorJobs.length }
            ]).map((item) => (
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
                {t(item.labelKey)}
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
            <span>{t("summaryCompressedFiles")}</span>
          </div>
          <div>
            <strong>{formatBytes(totals.saved)}</strong>
            <span>{t("summaryTotalSaved")}</span>
          </div>
          <div>
            <strong>{formatBytes(totals.compressed)}</strong>
            <span>{t("summaryCurrentSize")}</span>
          </div>
          <div>
            <strong>{totalReduction}%</strong>
            <span>{t("summaryAvgReduction")}</span>
          </div>
          <div>
            <strong>{totals.pages}</strong>
            <span>{t("summaryProcessedPages")}</span>
          </div>
        </div>
      ) : null}

      {hasJobs ? (
        <div className="upload-jobs">
          {!visibleJobs.length ? (
            <div className="upload-jobs__empty">
              <strong>{t("noFilesInView")}</strong>
              <span>{t("switchFiltersHint")}</span>
            </div>
          ) : null}
          {visibleJobs.map((job) => {
            const strongerMode = chooseStrongerMode(job.mode);
            const suggestedMode = chooseSuggestedMode(job);
            const suggestedAction = getSuggestedAction(t, job);
            const browserLimitAction = getBrowserLimitActionForJob(job);
            const targetStatus = formatTargetStatus(t, job);
            const selectedQualityHint = qualityHint(job);
            const compactResult = jobs.length > 1 && job.status === "success" && Boolean(job.result);
            return (
              <article className="upload-job" key={job.id}>
                <div className="upload-job__head">
                  <div>
                    <strong>{job.file.name}</strong>
                    <span>
                      {formatBytes(job.file.size)} · {getTranslatedModeLabel(tc, job.mode)}
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
                            {" "}{t("resultSmaller")}
                          </span>
                          <span>
                            <strong>{formatBytes(job.result.compressedBytes)}</strong>
                            {" "}{t("resultAfter")}
                          </span>
                          <span>
                            <strong>{formatBytes(job.result.savedBytes)}</strong>
                            {" "}{t("resultSaved")}
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
                            <strong>{targetStatus.title}</strong>
                            {!targetStatus.met ? (
                              <span className="upload-job__compact-target-copy">
                                {targetStatus.copy}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                        {selectedQualityHint ? (
                          <div className="upload-job__compact-quality">
                            <strong>{t(selectedQualityHint.titleKey)}</strong>
                            <span>{t("compareHint")}</span>
                          </div>
                        ) : null}
                        <div className="upload-job__compact-actions">
                          <button
                            type="button"
                            className="button button--primary"
                            onClick={() => downloadJob(job)}
                          >
                            {t("downloadButton")}
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
                            {suggestedAction ? suggestedAction.label : t("strongestUsed")}
                          </button>
                          <button
                            type="button"
                            className="button button--secondary"
                            disabled={job.previewStatus === "rendering"}
                            onClick={() => {
                              void previewJob(job);
                            }}
                          >
                            {job.previewStatus === "rendering" ? t("rendering") : t("compare")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="upload-job__outcome">
                          <div>
                            <span className="upload-job__outcome-label">{t("compressedResult")}</span>
                            <strong>{Math.round(job.result.reductionRatio * 100)}% {t("smallerLabel")}</strong>
                            <span>
                              {formatBytes(job.result.originalBytes)} to {formatBytes(job.result.compressedBytes)}
                            </span>
                          </div>
                          <div className="upload-job__outcome-save">
                            <span>{t("savedLabel")}</span>
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
                            {!targetStatus.met && targetStatus.nextSteps?.length ? (
                              <div className="upload-job__target-next">
                                <strong>{t("targetStatus.nextTitle")}</strong>
                                <ol>
                                  {targetStatus.nextSteps.map((step) => (
                                    <li key={step}>{step}</li>
                                  ))}
                                </ol>
                                {suggestedAction ? (
                                  <button
                                    type="button"
                                    className="button button--primary button--sm"
                                    disabled={processing}
                                    onClick={() => {
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
                                    {suggestedAction.label}
                                  </button>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div className="upload-job__target-status upload-job__target-status--neutral">
                            <strong>{t("readyToDownload")}</strong>
                            <span>{t("noTargetSelected")}</span>
                          </div>
                        )}
                        <div className="upload-job__stats">
                          <div>
                            <span>{t("statBefore")}</span>
                            <strong>{formatBytes(job.result.originalBytes)}</strong>
                          </div>
                          <div>
                            <span>{t("statAfter")}</span>
                            <strong>{formatBytes(job.result.compressedBytes)}</strong>
                          </div>
                          <div>
                            <span>{t("statSaved")}</span>
                            <strong>{formatBytes(job.result.savedBytes)}</strong>
                          </div>
                          <div>
                            <span>{t("statReduction")}</span>
                            <strong>{Math.round(job.result.reductionRatio * 100)}%</strong>
                          </div>
                          <div>
                            <span>{t("statMode")}</span>
                            <strong>{getTranslatedModeLabel(tc, job.result.mode)}</strong>
                          </div>
                          <div>
                            <span>{t("statPages")}</span>
                            <strong>{job.result.pageCount}</strong>
                          </div>
                          <div>
                            <span>{t("statProfile")}</span>
                            <strong>{getTranslatedProfileLabel(tc, job.result.documentProfile)}</strong>
                          </div>
                          {job.targetBytes ? (
                            <div>
                              <span>{t("statTarget")}</span>
                              <strong>{formatBytes(job.targetBytes)}</strong>
                            </div>
                          ) : null}
                        </div>
                        <p className="upload-job__summary">
                          {resultSummary(t, job.result.mode, job.result.reductionRatio)}
                        </p>
                        {job.result.warning ? <p className="upload-job__warning">{tc(job.result.warning.key, job.result.warning.params as Record<string, string | number>)}</p> : null}
                        {job.result.recommendation ? (
                          <p className="upload-job__recommendation">{tc(job.result.recommendation.key, job.result.recommendation.params as Record<string, string | number>)}</p>
                        ) : null}
                        {selectedQualityHint ? (
                          <div
                            className={`upload-job__quality-callout ${
                              selectedQualityHint.tone === "target"
                                ? "upload-job__quality-callout--target"
                                : "upload-job__quality-callout--neutral"
                            }`}
                          >
                            <div>
                              <strong>{t(selectedQualityHint.titleKey)}</strong>
                              <span>{t(selectedQualityHint.copyKey)}</span>
                            </div>
                            <button
                              type="button"
                              className="button button--secondary"
                              disabled={job.previewStatus === "rendering"}
                              onClick={() => {
                                void previewJob(job);
                              }}
                            >
                              {job.previewStatus === "rendering" ? t("rendering") : t("compareFirstPage")}
                            </button>
                          </div>
                        ) : null}
                        {suggestedAction ? (
                          <div className="upload-job__next-step">
                            <strong>{t("recommendedNextStep")}</strong>
                            <span>{suggestedAction.reason}</span>
                          </div>
                        ) : null}
                        {browserLimitAction ? (
                          <div
                            className={`upload-job__browser-limit upload-job__browser-limit--${browserLimitAction.severity}`}
                          >
                            <strong>{browserLimitAction.title}</strong>
                            <span>{browserLimitAction.copy}</span>
                          </div>
                        ) : null}
                        <div className="upload-job__actions">
                          <button
                            type="button"
                            className="button button--primary"
                            onClick={() => downloadJob(job)}
                          >
                            {t("downloadPdf")}
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
                            {suggestedAction ? suggestedAction.label : t("strongestUsed")}
                          </button>
                          {strongerMode && suggestedMode !== strongerMode ? (
                            <button
                              type="button"
                              className="button button--secondary"
                              disabled={processing}
                              onClick={() => tryStronger(job)}
                            >
                              {t("tryLabel", { mode: getTranslatedModeLabel(tc, strongerMode) })}
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
                            {job.previewStatus === "rendering" ? t("renderingPreview") : t("compareFirstPage")}
                          </button>
                        </div>
                        <details className="upload-job__details">
                          <summary>{t("technicalDetails")}</summary>
                          <div className="upload-job__details-body">
                            <div className="upload-job__hint upload-job__hint--neutral">
                              <strong>
                                {t("pageCount", { count: job.result.pageCount })} · {formatBytes(job.result.bytesPerPage)} per page
                              </strong>
                              <span>{t("technicalHint")}</span>
                            </div>
                            {job.result.likelyImageHeavy ? (
                              <div className="upload-job__hint">
                                <strong>{t("scannedHintTitle")}</strong>
                                <span>{t("scannedHintText")}</span>
                              </div>
                            ) : null}
                            {job.result.compressionDetails ? (
                              <div className="upload-job__hint upload-job__hint--neutral">
                                <strong>{t("compressionPathLabel")}</strong>
                                <span>{job.result.compressionDetails}</span>
                              </div>
                            ) : null}
                          </div>
                        </details>
                      </>
                    )}
                    {job.originalPreviewUrl && job.compressedPreviewUrl ? (
                      <div className="upload-job__preview-grid">
                        <figure className="upload-job__preview">
                          <img alt={t("originalPreviewAlt", { name: job.file.name })} src={job.originalPreviewUrl} />
                          <figcaption>{t("originalPreviewCaption")}</figcaption>
                        </figure>
                        <figure className="upload-job__preview">
                          <img alt={t("compressedPreviewAlt", { name: job.result.fileName })} src={job.compressedPreviewUrl} />
                          <figcaption>{t("compressedPreviewCaption")}</figcaption>
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
                    <strong>{job.errorTitle ?? t("errors.compressionFailedTitle")}</strong>
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
                      {t("retryCompression")}
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
