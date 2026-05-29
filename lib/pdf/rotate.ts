import { PDFDocument, degrees } from "pdf-lib";
import { parsePageRanges } from "@/lib/pdf/split";

export type RotateAngle = 90 | 180 | 270;

export type RotatePrepareResult = {
  fileName: string;
  totalBytes: number;
  pageCount: number;
};

export type RotateResult = {
  fileName: string;
  blob: Blob;
  pageCount: number;
  rotatedPageCount: number;
  angle: RotateAngle;
  rangeLabel: string;
};

function outputName(name: string) {
  const base = name.toLowerCase().endsWith(".pdf") ? name.replace(/\.pdf$/i, "") : name;
  return `${base}-rotated.pdf`;
}

function expandRangeInput(input: string, pageCount: number) {
  const normalized = input.trim();
  const ranges = normalized
    ? parsePageRanges(normalized, pageCount)
    : [{ start: 1, end: pageCount }];

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

  return labels.join(", ");
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

export async function prepareRotatePdf(file: File): Promise<RotatePrepareResult> {
  const source = await loadPdf(file);

  return {
    fileName: file.name,
    totalBytes: file.size,
    pageCount: source.getPageCount()
  };
}

export async function rotatePdfPages(
  file: File,
  angle: RotateAngle,
  rangeInput: string
): Promise<RotateResult> {
  const source = await loadPdf(file);
  const pageCount = source.getPageCount();
  const pagesToRotate = expandRangeInput(rangeInput, pageCount);
  const rotateSet = new Set(pagesToRotate);
  const output = await PDFDocument.create();
  const copiedPages = await output.copyPages(source, source.getPageIndices());

  copiedPages.forEach((page, index) => {
    if (rotateSet.has(index + 1)) {
      const currentAngle = page.getRotation().angle;
      page.setRotation(degrees((currentAngle + angle) % 360));
    }

    output.addPage(page);
  });

  output.setProducer("FileSmaller");
  output.setCreator("FileSmaller");
  output.setTitle("rotate-pdf-pages");

  const saved = await output.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    addDefaultPage: false,
    objectsPerTick: 20
  });

  return {
    fileName: outputName(file.name),
    blob: new Blob([saved], { type: "application/pdf" }),
    pageCount,
    rotatedPageCount: pagesToRotate.length,
    angle,
    rangeLabel: pagesToRotate.length === pageCount ? "All pages" : compactPageLabels(pagesToRotate)
  };
}

