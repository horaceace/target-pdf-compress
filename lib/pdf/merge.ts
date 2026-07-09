import { PDFDocument } from "pdf-lib";
import { ENCRYPTED_PASSWORD_REQUIRED, loadPdfStrict } from "./encryption";

export type MergeResult = {
  blob: Blob;
  fileName: string;
  totalFiles: number;
  totalBytes: number;
  mergedBytes: number;
  totalPages: number;
};

export async function mergePdfFiles(files: File[]): Promise<MergeResult> {
  if (files.length < 2) {
    throw new Error("Select at least two PDF files to merge.");
  }

  const merged = await PDFDocument.create();
  let totalBytes = 0;
  let totalPages = 0;

  for (const file of files) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error(`${file.name} is not a PDF file.`);
    }

    totalBytes += file.size;

    const bytes = new Uint8Array(await file.arrayBuffer());
    let source: PDFDocument;
    try {
      source = await loadPdfStrict(bytes, { updateMetadata: false });
    } catch (error) {
      if (error instanceof Error && error.message === ENCRYPTED_PASSWORD_REQUIRED) {
        throw new Error(
          `${file.name} is password-protected. Remove the open password first, then merge.`
        );
      }
      throw error;
    }
    totalPages += source.getPageCount();

    const copiedPages = await merged.copyPages(source, source.getPageIndices());
    copiedPages.forEach((page) => merged.addPage(page));
  }

  merged.setProducer("FileSmaller");
  merged.setCreator("FileSmaller");
  merged.setTitle("merged-pdf");

  const output = await merged.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    objectsPerTick: 25
  });

  return {
    blob: new Blob([output], { type: "application/pdf" }),
    fileName: "merged-pdf.pdf",
    totalFiles: files.length,
    totalBytes,
    mergedBytes: output.byteLength,
    totalPages
  };
}
