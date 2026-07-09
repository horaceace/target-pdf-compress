import { PDFDocument } from "pdf-lib";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt-lite";

export interface ProtectResult {
  blob: Blob;
  fileName: string;
  pageCount: number;
  originalBytes: number;
  outputBytes: number;
}

export async function protectPdf(
  pdfBytes: ArrayBuffer,
  userPassword: string,
  ownerPassword?: string
): Promise<ProtectResult> {
  const pdf = await PDFDocument.load(pdfBytes);
  const pageCount = pdf.getPageCount();

  const input = new Uint8Array(pdfBytes);
  const encrypted = await encryptPDF(input, userPassword, ownerPassword || null);

  const blob = new Blob([encrypted], { type: "application/pdf" });
  return {
    blob,
    fileName: "protected.pdf",
    pageCount,
    originalBytes: pdfBytes.byteLength,
    outputBytes: encrypted.byteLength,
  };
}
