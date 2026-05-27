import { PDFDocument } from "pdf-lib";

export type CompressionResult = {
  blob: Blob;
  originalBytes: number;
  compressedBytes: number;
  targetLabel: string;
  reachedTarget: boolean;
  downloadName: string;
};

const targetToBytesMap: Record<string, number> = {
  "100KB": 100 * 1024,
  "200KB": 200 * 1024,
  "300KB": 300 * 1024,
  "500KB": 500 * 1024,
  "1MB": 1024 * 1024,
  "2MB": 2 * 1024 * 1024,
  "Under 1MB": 1024 * 1024,
  "smaller size with better clarity": Number.POSITIVE_INFINITY
};

function buildDownloadName(name: string) {
  if (!name.toLowerCase().endsWith(".pdf")) {
    return `${name}-compressed.pdf`;
  }

  return `${name.slice(0, -4)}-compressed.pdf`;
}

export function getTargetBytes(targetLabel: string) {
  return targetToBytesMap[targetLabel] ?? Number.POSITIVE_INFINITY;
}

export async function compressPdfInBrowser(
  file: File,
  targetLabel: string
): Promise<CompressionResult> {
  const input = await file.arrayBuffer();
  const source = await PDFDocument.load(input);
  const output = await source.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    addDefaultPage: false
  });

  const blob = new Blob([output], { type: "application/pdf" });
  const compressedBytes = blob.size;
  const originalBytes = file.size;
  const targetBytes = getTargetBytes(targetLabel);

  return {
    blob,
    originalBytes,
    compressedBytes,
    targetLabel,
    reachedTarget: compressedBytes <= targetBytes,
    downloadName: buildDownloadName(file.name)
  };
}
