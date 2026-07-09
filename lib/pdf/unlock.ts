import { PDFDocument } from "pdf-lib";
import { loadPdfForUnlock } from "./encryption";

export type UnlockResult = {
  blob: Blob;
  fileName: string;
  originalBytes: number;
  outputBytes: number;
  pageCount: number;
  /** True when owner-style restrictions were stripped via ignoreEncryption rebuild */
  wasEncrypted: boolean;
  /** True when the file had no encryption flag / opened normally */
  wasPlain: boolean;
};

/**
 * Remove owner-level restrictions when the PDF can be opened without a user password.
 * Does NOT crack open-passwords — throws ENCRYPTED_PDF_PASSWORD_REQUIRED in that case.
 */
export async function unlockPdf(pdfBytes: ArrayBuffer): Promise<UnlockResult> {
  const bytes = new Uint8Array(pdfBytes);
  const loaded = await loadPdfForUnlock(bytes);

  if (loaded.kind === "password-required") {
    throw new Error("ENCRYPTED_PDF_PASSWORD_REQUIRED");
  }

  const source = loaded.doc;
  const rebuilt = await PDFDocument.create();
  const pages = await rebuilt.copyPages(source, source.getPageIndices());
  pages.forEach((page) => rebuilt.addPage(page));
  rebuilt.setProducer("FileSmaller");
  rebuilt.setCreator("FileSmaller");

  const output = await rebuilt.save({ useObjectStreams: true, objectsPerTick: 25 });
  const wasEncrypted = loaded.kind === "restrictions-removed";

  return {
    blob: new Blob([output], { type: "application/pdf" }),
    fileName: wasEncrypted ? "restrictions-removed.pdf" : "document.pdf",
    originalBytes: pdfBytes.byteLength,
    outputBytes: output.byteLength,
    pageCount: pages.length,
    wasEncrypted,
    wasPlain: loaded.kind === "plain"
  };
}
