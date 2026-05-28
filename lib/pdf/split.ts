import { PDFDocument } from "pdf-lib";

export type PageRange = {
  start: number;
  end: number;
};

export type SplitResultItem = {
  id: string;
  label: string;
  fileName: string;
  blob: Blob;
  pageStart: number;
  pageEnd: number;
  pageTotal: number;
};

export type SplitPrepareResult = {
  fileName: string;
  totalBytes: number;
  pageCount: number;
};

function splitOutputName(name: string, start: number, end: number) {
  const base = name.toLowerCase().endsWith(".pdf") ? name.replace(/\.pdf$/i, "") : name;
  return start === end ? `${base}-page-${start}.pdf` : `${base}-pages-${start}-${end}.pdf`;
}

export function parsePageRanges(input: string, pageCount: number): PageRange[] {
  const normalized = input.trim();

  if (!normalized) {
    throw new Error("Enter at least one page range. Use formats like 1-3, 5, 7-9.");
  }

  const segments = normalized
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (!segments.length) {
    throw new Error("Enter at least one page range. Use formats like 1-3, 5, 7-9.");
  }

  return segments.map((segment) => {
    const singleMatch = /^(\d+)$/.exec(segment);
    if (singleMatch) {
      const page = Number(singleMatch[1]);

      if (page < 1) {
        throw new Error(`Page ${page} is invalid. Page numbers start at 1.`);
      }

      if (page > pageCount) {
        throw new Error(`Page ${page} exceeds the total page count of ${pageCount}.`);
      }

      return { start: page, end: page };
    }

    const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(segment);
    if (!rangeMatch) {
      throw new Error(`"${segment}" is not a valid page range. Use formats like 1-3, 5, 7-9.`);
    }

    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);

    if (start < 1 || end < 1) {
      throw new Error(`"${segment}" is invalid. Page numbers start at 1.`);
    }

    if (start > end) {
      throw new Error(`"${segment}" is invalid. The start page cannot be greater than the end page.`);
    }

    if (end > pageCount) {
      throw new Error(`Page range ${segment} exceeds the total page count of ${pageCount}.`);
    }

    return { start, end };
  });
}

export async function prepareSplitPdf(file: File): Promise<SplitPrepareResult> {
  if (file.size === 0) {
    throw new Error("This PDF is empty. Upload a file with actual document pages and try again.");
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error(`${file.name} is not a PDF file.`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const source = await PDFDocument.load(bytes, {
    updateMetadata: false,
    ignoreEncryption: true
  });

  return {
    fileName: file.name,
    totalBytes: file.size,
    pageCount: source.getPageCount()
  };
}

export async function splitPdfByRanges(
  file: File,
  ranges: PageRange[]
): Promise<SplitResultItem[]> {
  if (!ranges.length) {
    throw new Error("Enter at least one page range before splitting the PDF.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const source = await PDFDocument.load(bytes, {
    updateMetadata: false,
    ignoreEncryption: true
  });
  const pageCount = source.getPageCount();

  return Promise.all(
    ranges.map(async (range, index) => {
      const output = await PDFDocument.create();
      const pageIndexes = Array.from(
        { length: range.end - range.start + 1 },
        (_, offset) => range.start - 1 + offset
      );
      const copiedPages = await output.copyPages(source, pageIndexes);

      copiedPages.forEach((page) => output.addPage(page));
      output.setProducer("FileSmaller");
      output.setCreator("FileSmaller");
      output.setTitle(`split-${range.start}-${range.end}`);

      const saved = await output.save({
        useObjectStreams: true,
        updateFieldAppearances: false,
        addDefaultPage: false,
        objectsPerTick: 20
      });

      return {
        id: `${range.start}-${range.end}-${index}`,
        label: range.start === range.end ? `Page ${range.start}` : `Pages ${range.start}-${range.end}`,
        fileName: splitOutputName(file.name, range.start, range.end),
        blob: new Blob([saved], { type: "application/pdf" }),
        pageStart: range.start,
        pageEnd: range.end,
        pageTotal: pageCount
      };
    })
  );
}
