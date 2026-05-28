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
  originalBytes: number;
  compressedBytes: number;
  savedBytes: number;
  reductionRatio: number;
  warning?: string;
  recommendation?: string;
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

function outputName(name: string) {
  return name.toLowerCase().endsWith(".pdf")
    ? name.replace(/\.pdf$/i, "-compressed.pdf")
    : `${name}-compressed.pdf`;
}

function buildWarning(mode: CompressionMode, originalBytes: number, compressedBytes: number) {
  if (compressedBytes >= originalBytes) {
    return "This PDF did not shrink much in the browser. Image-heavy files may need a stronger server-side compressor.";
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
  likelyImageHeavy: boolean
) {
  const reduction = originalBytes > 0 ? (originalBytes - compressedBytes) / originalBytes : 0;

  if (reduction < 0.12 && likelyImageHeavy && mode !== "scanned") {
    return "This PDF looks image-heavy. Try Scanned PDF mode for a stronger browser-side reduction path.";
  }

  if (reduction < 0.08 && (mode === "extreme" || mode === "scanned")) {
    return "This file is resisting browser-side compression. A server-side compressor may be needed for a much smaller result.";
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
  mode: CompressionMode
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
  const likelyImageHeavy = bytesPerPage > 450_000;
  const plan = modePassPlan[mode];
  const candidates: Uint8Array[] = [];

  candidates.push(...(await runOptimizedPasses(source, plan.optimizedPasses)));
  candidates.push(...(await runRebuildPasses(source, plan.rebuildPasses)));

  if (plan.multipassPasses > 0 && candidates.length > 0) {
    const smallestCurrent = candidates.reduce((best, current) =>
      current.byteLength < best.byteLength ? current : best
    );
    candidates.push(...(await runMultiPasses(smallestCurrent, plan.multipassPasses)));
  }

  const best = candidates.reduce((smallest, current) =>
    current.byteLength < smallest.byteLength ? current : smallest
  );

  const compressedBytes = best.byteLength;
  const originalBytes = file.size;
  const savedBytes = Math.max(0, originalBytes - compressedBytes);
  const reductionRatio =
    originalBytes > 0 ? Number((savedBytes / originalBytes).toFixed(4)) : 0;

  return {
    blob: new Blob([best], { type: "application/pdf" }),
    fileName: outputName(file.name),
    mode,
    pageCount,
    likelyImageHeavy,
    originalBytes,
    compressedBytes,
    savedBytes,
    reductionRatio,
    warning: buildWarning(mode, originalBytes, compressedBytes),
    recommendation: buildRecommendation(
      mode,
      originalBytes,
      compressedBytes,
      pageCount,
      likelyImageHeavy
    )
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
