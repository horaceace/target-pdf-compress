import { PDFDocument } from "pdf-lib";
import { PageRange, parsePageRanges } from "@/lib/pdf/split";

export type ReorderPrepareResult = {
  fileName: string;
  totalBytes: number;
  pageCount: number;
};

export type ReorderResult = {
  fileName: string;
  blob: Blob;
  originalPageCount: number;
  outputPageCount: number;
  orderLabels: string[];
};

function outputName(name: string) {
  const base = name.toLowerCase().endsWith(".pdf") ? name.replace(/\.pdf$/i, "") : name;
  return `${base}-reordered.pdf`;
}

function expandRanges(ranges: PageRange[]) {
  return ranges.flatMap((range) =>
    Array.from({ length: range.end - range.start + 1 }, (_, offset) => range.start + offset)
  );
}

async function loadPdf(file: File) {
  if (file.size === 0) {
    throw new Error("This PDF is empty. Upload a file with actual document pages and try again.");
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error(`${file.name} is not a PDF file.`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  return PDFDocument.load(bytes, {
    updateMetadata: false,
    ignoreEncryption: true
  });
}

export async function prepareReorderPdf(file: File): Promise<ReorderPrepareResult> {
  const source = await loadPdf(file);

  return {
    fileName: file.name,
    totalBytes: file.size,
    pageCount: source.getPageCount()
  };
}

export async function reorderPdfPages(file: File, orderInput: string): Promise<ReorderResult> {
  const source = await loadPdf(file);
  const pageCount = source.getPageCount();
  const ranges = parsePageRanges(orderInput, pageCount);
  const pageOrder = expandRanges(ranges);

  if (!pageOrder.length) {
    throw new Error("Enter at least one page number or range before reordering.");
  }

  const uniquePages = new Set(pageOrder);
  if (uniquePages.size !== pageOrder.length) {
    throw new Error("Page order contains duplicates. List each output page only once.");
  }

  const output = await PDFDocument.create();
  const copiedPages = await output.copyPages(
    source,
    pageOrder.map((page) => page - 1)
  );

  copiedPages.forEach((page) => output.addPage(page));
  output.setProducer("FileSmaller");
  output.setCreator("FileSmaller");
  output.setTitle("reorder-pdf-pages");

  const saved = await output.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    addDefaultPage: false,
    objectsPerTick: 20
  });

  return {
    fileName: outputName(file.name),
    blob: new Blob([saved], { type: "application/pdf" }),
    originalPageCount: pageCount,
    outputPageCount: pageOrder.length,
    orderLabels: pageOrder.map(String)
  };
}

