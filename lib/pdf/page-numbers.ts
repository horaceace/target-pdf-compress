import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export type PageNumberPosition =
  | "bottom-center"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "top-right"
  | "top-left";

export type PageNumberOptions = {
  startAt?: number;
  prefix?: string;
  fontSize?: number;
  position?: PageNumberPosition;
  fontFamily?: keyof typeof StandardFonts;
  color?: { r: number; g: number; b: number };
  marginX?: number;
  marginY?: number;
};

const FONT_KEYS: Array<keyof typeof StandardFonts> = [
  "Helvetica",
  "HelveticaBold",
  "TimesRoman",
  "TimesRomanBold",
  "Courier",
  "CourierBold",
];

export type PageNumbersResult = {
  blob: Blob;
  fileName: string;
  originalBytes: number;
  outputBytes: number;
  pageCount: number;
};

export async function addPageNumbers(
  pdfBytes: ArrayBuffer,
  options?: PageNumberOptions
): Promise<PageNumbersResult> {
  const pdf = await PDFDocument.load(pdfBytes);
  const pages = pdf.getPages();

  const startAt = options?.startAt ?? 1;
  const prefix = options?.prefix ?? "";
  const fontSize = options?.fontSize ?? 12;
  const position = options?.position ?? "bottom-center";
  const fontKey = options?.fontFamily ?? "Helvetica";
  const color = options?.color ?? { r: 0, g: 0, b: 0 };
  const marginX = options?.marginX ?? 36;
  const marginY = options?.marginY ?? 36;

  const resolvedKey = FONT_KEYS.includes(fontKey) ? fontKey : "Helvetica";
  const font = await pdf.embedFont(StandardFonts[resolvedKey]);
  const fontColor = rgb(
    Math.max(0, Math.min(1, color.r)),
    Math.max(0, Math.min(1, color.g)),
    Math.max(0, Math.min(1, color.b))
  );

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const num = startAt + i;
    const text = `${prefix}${num}`;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x: number;
    let y: number;

    switch (position) {
      case "bottom-center":
        x = (width - textWidth) / 2;
        y = marginY;
        break;
      case "bottom-right":
        x = width - textWidth - marginX;
        y = marginY;
        break;
      case "bottom-left":
        x = marginX;
        y = marginY;
        break;
      case "top-center":
        x = (width - textWidth) / 2;
        y = height - marginY - fontSize;
        break;
      case "top-right":
        x = width - textWidth - marginX;
        y = height - marginY - fontSize;
        break;
      case "top-left":
        x = marginX;
        y = height - marginY - fontSize;
        break;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: fontColor,
    });
  }

  pdf.setProducer("FileSmaller");
  const output = await pdf.save({ useObjectStreams: true, objectsPerTick: 25 });

  return {
    blob: new Blob([output], { type: "application/pdf" }),
    fileName: "numbered.pdf",
    originalBytes: pdfBytes.byteLength,
    outputBytes: output.byteLength,
    pageCount: pages.length,
  };
}
