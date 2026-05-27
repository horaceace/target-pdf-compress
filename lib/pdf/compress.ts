import { PDFDocument } from "pdf-lib";

export type CompressionResult = {
  blob: Blob;
  originalBytes: number;
  compressedBytes: number;
  modeLabel: string;
  downloadName: string;
};

function buildDownloadName(name: string) {
  if (!name.toLowerCase().endsWith(".pdf")) {
    return `${name}-compressed.pdf`;
  }

  return `${name.slice(0, -4)}-compressed.pdf`;
}

export function getTargetBytes(targetLabel: string) {
  return Number.POSITIVE_INFINITY;
}

export async function compressPdfInBrowser(
  file: File,
  modeLabel: string
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

  return {
    blob,
    originalBytes,
    compressedBytes,
    modeLabel,
    downloadName: buildDownloadName(file.name)
  };
}
