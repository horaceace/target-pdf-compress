import { PDFDocument } from "pdf-lib";
import { PageRange, parsePageRanges } from "@/lib/pdf/split";

export type RemovePagesPrepareResult = {
  fileName: string;
  totalBytes: number;
  pageCount: number;
};

export type RemovePagesResult = {
  fileName: string;
  blob: Blob;
  originalPageCount: number;
  removedPageCount: number;
  remainingPageCount: number;
  removedLabels: string[];
};

function outputName(name: string) {
  const base = name.toLowerCase().endsWith(".pdf") ? name.replace(/\.pdf$/i, "") : name;
  return `${base}-pages-removed.pdf`;
}

function expandRanges(ranges: PageRange[]) {
  return Array.from(
    new Set(
      ranges.flatMap((range) =>
        Array.from({ length: range.end - range.start + 1 }, (_, offset) => range.start + offset)
      )
    )
  ).sort((a, b) => a - b);
}

function compactPageLabels(pages: number[]) {
  const labels: string[] = [];
  let start = pages[0];
  let previous = pages[0];

  for (let index = 1; index <= pages.length; index += 1) {
    const current = pages[index];

    if (current === previous + 1) {
      previous = current;
      continue;
    }

    labels.push(start === previous ? `${start}` : `${start}-${previous}`);
    start = current;
    previous = current;
  }

  return labels;
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

export async function prepareRemovePagesPdf(file: File): Promise<RemovePagesPrepareResult> {
  const source = await loadPdf(file);

  return {
    fileName: file.name,
    totalBytes: file.size,
    pageCount: source.getPageCount()
  };
}

export async function removePdfPages(file: File, rangeInput: string): Promise<RemovePagesResult> {
  const source = await loadPdf(file);
  const pageCount = source.getPageCount();
  const ranges = parsePageRanges(rangeInput, pageCount);
  const pagesToRemove = expandRanges(ranges);

  if (pagesToRemove.length >= pageCount) {
    throw new Error("You cannot remove every page. Leave at least one page in the output PDF.");
  }

  const pagesToKeep = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (page) => !pagesToRemove.includes(page)
  );
  const output = await PDFDocument.create();
  const copiedPages = await output.copyPages(
    source,
    pagesToKeep.map((page) => page - 1)
  );

  copiedPages.forEach((page) => output.addPage(page));
  output.setProducer("FileSmaller");
  output.setCreator("FileSmaller");
  output.setTitle("remove-pdf-pages");

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
    removedPageCount: pagesToRemove.length,
    remainingPageCount: pagesToKeep.length,
    removedLabels: compactPageLabels(pagesToRemove)
  };
}

