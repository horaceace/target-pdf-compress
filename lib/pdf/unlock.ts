import { PDFDocument } from "pdf-lib";

export type UnlockResult = {
  blob: Blob;
  fileName: string;
  originalBytes: number;
  outputBytes: number;
  pageCount: number;
  wasEncrypted: boolean;
};

export async function unlockPdf(pdfBytes: ArrayBuffer): Promise<UnlockResult> {
  let wasEncrypted = false;

  // First try loading normally — if it succeeds, the file wasn't encrypted
  let pdf: PDFDocument;
  try {
    pdf = await PDFDocument.load(pdfBytes);
  } catch {
    // Try with ignoreEncryption for password-free encrypted PDFs
    pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    wasEncrypted = true;
  }

  // Double-check: if loaded without error but isEncrypted is still true
  if (pdf.isEncrypted && !wasEncrypted) {
    // Re-load with ignoreEncryption
    pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    wasEncrypted = true;
  }

  const pages = pdf.getPages();
  pdf.setProducer("FileSmaller");
  const output = await pdf.save({ useObjectStreams: true, objectsPerTick: 25 });

  return {
    blob: new Blob([output], { type: "application/pdf" }),
    fileName: wasEncrypted ? "unlocked.pdf" : "document.pdf",
    originalBytes: pdfBytes.byteLength,
    outputBytes: output.byteLength,
    pageCount: pages.length,
    wasEncrypted,
  };
}
