import { PDFDocument } from "pdf-lib";

export type CompressionMode =
  | "light"
  | "balanced"
  | "strong"
  | "extreme"
  | "scanned";

export type CompressionModeOption = {
  id: CompressionMode;
  label: string;
  description: string;
  bestFor: string;
};

export type CompressionResult = {
  blob: Blob;
  fileName: string;
  mode: CompressionMode;
  pageCount: number;
  likelyImageHeavy: boolean;
  documentProfile: "clean-office" | "mixed" | "image-heavy" | "scanned-heavy";
  profileLabel: string;
  bytesPerPage: number;
  originalBytes: number;
  compressedBytes: number;
  savedBytes: number;
  reductionRatio: number;
  warning?: string;
  recommendation?: string;
  compressionDetails?: string;
};

type CompressionOptions = {
  targetBytes?: number;
  allowPortalLimitScan?: boolean;
};

export const compressionModes: CompressionModeOption[] = [
  {
    id: "light",
    label: "Light",
    description: "Keeps more visual quality with smaller structural cleanup.",
    bestFor: "Contracts, reports, clean office PDFs"
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Default trade-off between readability and file size.",
    bestFor: "Most common PDF sharing tasks"
  },
  {
    id: "strong",
    label: "Strong",
    description: "Pushes harder for smaller uploads and attachments.",
    bestFor: "Portals, forms, email attachments"
  },
  {
    id: "extreme",
    label: "Extreme",
    description: "Uses the smallest practical rebuild path in the browser.",
    bestFor: "Upload failures and tighter file limits"
  },
  {
    id: "scanned",
    label: "Scanned PDF",
    description: "Aggressive cleanup path for image-heavy or scanned documents.",
    bestFor: "Scans, statements, certificates, proofs"
  }
];

const modeOrder: CompressionMode[] = [
  "light",
  "balanced",
  "strong",
  "extreme",
  "scanned"
];

const modePassPlan: Record<
  CompressionMode,
  {
    optimizedPasses: number;
    rebuildPasses: number;
    multipassPasses: number;
  }
> = {
  light: {
    optimizedPasses: 1,
    rebuildPasses: 0,
    multipassPasses: 0
  },
  balanced: {
    optimizedPasses: 1,
    rebuildPasses: 1,
    multipassPasses: 0
  },
  strong: {
    optimizedPasses: 1,
    rebuildPasses: 2,
    multipassPasses: 1
  },
  extreme: {
    optimizedPasses: 2,
    rebuildPasses: 2,
    multipassPasses: 2
  },
  scanned: {
    optimizedPasses: 1,
    rebuildPasses: 3,
    multipassPasses: 2
  }
};

type RenderedImagePage = {
  imageBytes: Uint8Array;
  width: number;
  height: number;
};

type RenderCandidate = {
  label: string;
  quality: number;
  scale: number;
  grayscale?: boolean;
};

function shouldUseRenderedScannedPath(
  profile: CompressionResult["documentProfile"]
) {
  return profile === "image-heavy" || profile === "scanned-heavy";
}

function fallbackModeForScanned(
  profile: CompressionResult["documentProfile"]
): CompressionMode {
  if (profile === "clean-office") {
    return "strong";
  }

  return "extreme";
}

function classifyDocumentProfile(bytesPerPage: number, pageCount: number) {
  if (bytesPerPage >= 900_000 || (pageCount <= 6 && bytesPerPage >= 750_000)) {
    return {
      id: "scanned-heavy" as const,
      label: "Likely scanned PDF"
    };
  }

  if (bytesPerPage >= 450_000) {
    return {
      id: "image-heavy" as const,
      label: "Image-heavy PDF"
    };
  }

  if (bytesPerPage <= 160_000) {
    return {
      id: "clean-office" as const,
      label: "Clean office PDF"
    };
  }

  return {
    id: "mixed" as const,
    label: "Mixed-content PDF"
  };
}

function outputName(name: string) {
  return name.toLowerCase().endsWith(".pdf")
    ? name.replace(/\.pdf$/i, "-compressed.pdf")
    : `${name}-compressed.pdf`;
}

function buildWarning(
  mode: CompressionMode,
  originalBytes: number,
  compressedBytes: number,
  documentProfile: CompressionResult["documentProfile"]
) {
  if (compressedBytes >= originalBytes) {
    return "This PDF did not shrink much in the browser. Image-heavy files may need a stronger server-side compressor.";
  }

  if (documentProfile === "scanned-heavy" && mode !== "scanned") {
    return "This file looks closer to a scan than a text PDF. Standard modes may not shrink it enough.";
  }

  if (mode === "extreme" || mode === "scanned") {
    return "Aggressive browser-side compression can reduce visual quality on image-heavy PDFs.";
  }

  return undefined;
}

function buildRecommendation(
  mode: CompressionMode,
  originalBytes: number,
  compressedBytes: number,
  pageCount: number,
  likelyImageHeavy: boolean,
  documentProfile: CompressionResult["documentProfile"]
) {
  const reduction = originalBytes > 0 ? (originalBytes - compressedBytes) / originalBytes : 0;

  if (
    reduction < 0.12 &&
    (documentProfile === "image-heavy" || documentProfile === "scanned-heavy") &&
    mode !== "scanned"
  ) {
    return "This PDF looks image-heavy. Try Scanned PDF mode for a stronger browser-side reduction path.";
  }

  if (reduction < 0.08 && (mode === "extreme" || mode === "scanned")) {
    return "This file is resisting browser-side compression. A server-side compressor may be needed for a much smaller result.";
  }

  if (documentProfile === "clean-office" && reduction < 0.1 && mode === "light") {
    return "This PDF already looks structurally light. Try Balanced or Strong mode only if upload limits still block you.";
  }

  if (pageCount > 30 && reduction < 0.18 && likelyImageHeavy && mode === "strong") {
    return "Long image-heavy PDFs often need Extreme or Scanned PDF mode to get under stricter upload caps.";
  }

  if (reduction > 0.55 && mode === "light") {
    return "This file shrank well even on Light mode. You may not need a stronger compression setting.";
  }

  return undefined;
}

async function saveOptimized(source: PDFDocument) {
  return source.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    addDefaultPage: false,
    objectsPerTick: 25
  });
}

async function rebuildMinimal(source: PDFDocument) {
  const rebuilt = await PDFDocument.create();
  const copiedPages = await rebuilt.copyPages(source, source.getPageIndices());

  copiedPages.forEach((page) => rebuilt.addPage(page));

  rebuilt.setTitle(source.getTitle() ?? "");
  rebuilt.setSubject(source.getSubject() ?? "");
  rebuilt.setProducer("FileSmaller");
  rebuilt.setCreator("FileSmaller");

  return rebuilt.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    addDefaultPage: false,
    objectsPerTick: 10
  });
}

async function multiPass(bytes: Uint8Array) {
  const secondPassDoc = await PDFDocument.load(bytes, {
    updateMetadata: false,
    ignoreEncryption: true
  });

  return secondPassDoc.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    addDefaultPage: false,
    objectsPerTick: 5
  });
}

async function renderPdfPagesToJpeg(
  sourceBytes: Uint8Array,
  quality: number,
  scale: number,
  grayscale = false
): Promise<RenderedImagePage[]> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("The stronger scanned PDF path is only available in the browser.");
  }

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.mjs",
      import.meta.url
    ).toString();
  }
  const loadingTask = pdfjs.getDocument({
    data: sourceBytes.slice(),
    useSystemFonts: true,
    isEvalSupported: false
  } as Parameters<typeof pdfjs.getDocument>[0]);
  const pdf = await loadingTask.promise;
  const pages: RenderedImagePage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
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

    if (grayscale) {
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = pixels.data;

      for (let index = 0; index < data.length; index += 4) {
        const value = Math.round(
          data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114
        );
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
      }

      context.putImageData(pixels, 0, 0);
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });

    if (!blob) {
      throw new Error("The browser could not export the scanned PDF pages as images.");
    }

    const imageBytes = new Uint8Array(await blob.arrayBuffer());
    pages.push({
      imageBytes,
      width: viewport.width,
      height: viewport.height
    });

    canvas.width = 0;
    canvas.height = 0;
    page.cleanup();
  }

  await loadingTask.destroy();
  return pages;
}

async function rebuildFromRenderedPages(
  sourceBytes: Uint8Array,
  candidate: RenderCandidate
) {
  const renderedPages = await renderPdfPagesToJpeg(
    sourceBytes,
    candidate.quality,
    candidate.scale,
    candidate.grayscale
  );
  const rebuilt = await PDFDocument.create();

  for (const renderedPage of renderedPages) {
    const image = await rebuilt.embedJpg(renderedPage.imageBytes);
    const page = rebuilt.addPage([renderedPage.width, renderedPage.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: renderedPage.width,
      height: renderedPage.height
    });
  }

  rebuilt.setProducer("FileSmaller");
  rebuilt.setCreator("FileSmaller");
  rebuilt.setTitle("scanned-pdf-compressed");

  return rebuilt.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    addDefaultPage: false,
    objectsPerTick: 10
  });
}

function scannedRenderCandidates(
  profile: CompressionResult["documentProfile"],
  bytesPerPage: number,
  options: CompressionOptions = {}
): RenderCandidate[] {
  const base: RenderCandidate[] = [
    { label: "balanced scan", quality: 0.72, scale: 1.35 },
    { label: "smaller scan", quality: 0.62, scale: 1.15 },
    { label: "smallest scan", quality: 0.52, scale: 0.95 },
    { label: "grayscale scan", quality: 0.56, scale: 1.05, grayscale: true }
  ];
  const shouldTryPortalLimit =
    Boolean(options.allowPortalLimitScan) ||
    Boolean(options.targetBytes && options.targetBytes < bytesPerPage);

  if (shouldTryPortalLimit && (profile === "scanned-heavy" || bytesPerPage > 2_000_000)) {
    return [
      ...base,
      { label: "portal limit scan", quality: 0.44, scale: 0.82 },
      { label: "portal grayscale scan", quality: 0.46, scale: 0.88, grayscale: true }
    ];
  }

  return base;
}

async function rebuildBestRenderedCandidate(
  sourceBytes: Uint8Array,
  candidates: RenderCandidate[]
) {
  const renderedCandidates: Array<{
    candidate: RenderCandidate;
    bytes: Uint8Array;
  }> = [];

  for (const candidate of candidates) {
    const bytes = await rebuildFromRenderedPages(sourceBytes, candidate);
    renderedCandidates.push({ candidate, bytes });
  }

  return renderedCandidates.reduce((best, current) =>
    current.bytes.byteLength < best.bytes.byteLength ? current : best
  );
}

async function runOptimizedPasses(source: PDFDocument, count: number) {
  const candidates: Uint8Array[] = [];
  let workingDoc = source;

  for (let index = 0; index < count; index += 1) {
    const bytes = await saveOptimized(workingDoc);
    candidates.push(bytes);
    workingDoc = await PDFDocument.load(bytes, {
      updateMetadata: false,
      ignoreEncryption: true
    });
  }

  return candidates;
}

async function runRebuildPasses(source: PDFDocument, count: number) {
  const candidates: Uint8Array[] = [];
  let workingDoc = source;

  for (let index = 0; index < count; index += 1) {
    const bytes = await rebuildMinimal(workingDoc);
    candidates.push(bytes);
    workingDoc = await PDFDocument.load(bytes, {
      updateMetadata: false,
      ignoreEncryption: true
    });
  }

  return candidates;
}

async function runMultiPasses(bytes: Uint8Array, count: number) {
  const candidates: Uint8Array[] = [];
  let current = bytes;

  for (let index = 0; index < count; index += 1) {
    current = await multiPass(current);
    candidates.push(current);
  }

  return candidates;
}

export async function compressPdfFile(
  file: File,
  mode: CompressionMode,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  if (file.size === 0) {
    throw new Error("This PDF is empty. Upload a file with actual document pages and try again.");
  }

  const sourceBytes = new Uint8Array(await file.arrayBuffer());
  const source = await PDFDocument.load(sourceBytes, {
    updateMetadata: false,
    ignoreEncryption: true
  });
  const pageCount = source.getPageCount();
  const bytesPerPage = pageCount > 0 ? file.size / pageCount : file.size;
  const profile = classifyDocumentProfile(bytesPerPage, pageCount);
  const likelyImageHeavy = bytesPerPage > 450_000;

  const requestedScannedMode = mode === "scanned";
  const shouldRunRenderedScannedPath =
    requestedScannedMode && shouldUseRenderedScannedPath(profile.id);
  const shouldCompareRenderedScannedPath =
    requestedScannedMode && !shouldRunRenderedScannedPath;
  const effectiveMode = shouldRunRenderedScannedPath
    ? "scanned"
    : requestedScannedMode
      ? fallbackModeForScanned(profile.id)
      : mode;

  if (shouldRunRenderedScannedPath) {
    const renderCandidates = scannedRenderCandidates(profile.id, bytesPerPage, options);
    const rebuiltFromImages = await rebuildBestRenderedCandidate(sourceBytes, renderCandidates);
    const compressedBytes = rebuiltFromImages.bytes.byteLength;
    const originalBytes = file.size;
    const savedBytes = Math.max(0, originalBytes - compressedBytes);
    const reductionRatio =
      originalBytes > 0 ? Number((savedBytes / originalBytes).toFixed(4)) : 0;

    return {
      blob: new Blob([rebuiltFromImages.bytes], { type: "application/pdf" }),
      fileName: outputName(file.name),
      mode: effectiveMode,
      pageCount,
      likelyImageHeavy,
      documentProfile: profile.id,
      profileLabel: profile.label,
      bytesPerPage,
      originalBytes,
      compressedBytes,
      savedBytes,
      reductionRatio,
      warning: buildWarning(effectiveMode, originalBytes, compressedBytes, profile.id),
      recommendation: buildRecommendation(
        effectiveMode,
        originalBytes,
        compressedBytes,
        pageCount,
        likelyImageHeavy,
        profile.id
      ),
      compressionDetails: `${rebuiltFromImages.candidate.label}: scale ${rebuiltFromImages.candidate.scale}, JPEG quality ${rebuiltFromImages.candidate.quality}`
    };
  }

  const plan = modePassPlan[effectiveMode];
  const candidates: Uint8Array[] = [];

  candidates.push(...(await runOptimizedPasses(source, plan.optimizedPasses)));
  candidates.push(...(await runRebuildPasses(source, plan.rebuildPasses)));

  if (plan.multipassPasses > 0 && candidates.length > 0) {
    const smallestCurrent = candidates.reduce((best, current) =>
      current.byteLength < best.byteLength ? current : best
    );
    candidates.push(...(await runMultiPasses(smallestCurrent, plan.multipassPasses)));
  }

  let comparedRenderedCandidate: Awaited<ReturnType<typeof rebuildBestRenderedCandidate>> | null =
    null;

  if (shouldCompareRenderedScannedPath) {
    const renderCandidates = scannedRenderCandidates(profile.id, bytesPerPage, options);
    comparedRenderedCandidate = await rebuildBestRenderedCandidate(sourceBytes, renderCandidates);
    candidates.push(comparedRenderedCandidate.bytes);
  }

  const best = candidates.reduce((smallest, current) =>
    current.byteLength < smallest.byteLength ? current : smallest
  );
  const selectedRenderedCandidate =
    comparedRenderedCandidate && best === comparedRenderedCandidate.bytes
      ? comparedRenderedCandidate.candidate
      : null;

  const compressedBytes = best.byteLength;
  const originalBytes = file.size;
  const savedBytes = Math.max(0, originalBytes - compressedBytes);
  const reductionRatio =
    originalBytes > 0 ? Number((savedBytes / originalBytes).toFixed(4)) : 0;
  const skippedScannedPath = requestedScannedMode && !shouldRunRenderedScannedPath;
  const warning =
    skippedScannedPath && !selectedRenderedCandidate
      ? `Scanned PDF mode was skipped because this file looks more like a ${profile.label.toLowerCase()}. FileSmaller used ${getCompressionMode(effectiveMode).label} instead.`
      : buildWarning(effectiveMode, originalBytes, compressedBytes, profile.id);

  return {
    blob: new Blob([best], { type: "application/pdf" }),
    fileName: outputName(file.name),
    mode: effectiveMode,
    pageCount,
    likelyImageHeavy,
    documentProfile: profile.id,
    profileLabel: profile.label,
    bytesPerPage,
    originalBytes,
    compressedBytes,
    savedBytes,
    reductionRatio,
    warning,
    recommendation: buildRecommendation(
      effectiveMode,
      originalBytes,
      compressedBytes,
      pageCount,
      likelyImageHeavy,
      profile.id
    ),
    compressionDetails: selectedRenderedCandidate
      ? `${selectedRenderedCandidate.label}: scale ${selectedRenderedCandidate.scale}, JPEG quality ${selectedRenderedCandidate.quality}${selectedRenderedCandidate.grayscale ? ", grayscale" : ""}`
      : undefined
  };
}

export function getCompressionMode(mode: CompressionMode) {
  return compressionModes.find((item) => item.id === mode) ?? compressionModes[1];
}

export function getNextCompressionMode(mode: CompressionMode) {
  const index = modeOrder.indexOf(mode);
  return index >= 0 && index < modeOrder.length - 1 ? modeOrder[index + 1] : null;
}

export function inferCompressionMode(input?: string): CompressionMode {
  const normalized = (input ?? "").toLowerCase();

  if (normalized.includes("scan")) {
    return "scanned";
  }
  if (normalized.includes("read")) {
    return "light";
  }
  if (normalized.includes("resume")) {
    return "balanced";
  }
  if (normalized.includes("upload") || normalized.includes("email")) {
    return "strong";
  }

  return "balanced";
}

export function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
