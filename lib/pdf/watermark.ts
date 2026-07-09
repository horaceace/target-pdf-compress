import { PDFDocument, rgb, StandardFonts, RotationTypes } from "pdf-lib";

export type WatermarkType = "text" | "image";

export type TextWatermarkOptions = {
  text: string;
  fontSize?: number;
  opacity?: number;
  rotation?: number;
  color?: { r: number; g: number; b: number };
};

export type ImageWatermarkOptions = {
  opacity?: number;
  scale?: number;
};

export type WatermarkResult = {
  blob: Blob;
  fileName: string;
  originalBytes: number;
  outputBytes: number;
  pageCount: number;
};

function wrapRgb(c?: { r: number; g: number; b: number }) {
  const c2 = c ?? { r: 0.6, g: 0.6, b: 0.6 };
  return rgb(
    Math.max(0, Math.min(1, c2.r)),
    Math.max(0, Math.min(1, c2.g)),
    Math.max(0, Math.min(1, c2.b))
  );
}

export async function addTextWatermark(
  pdfBytes: ArrayBuffer,
  options: TextWatermarkOptions
): Promise<WatermarkResult> {
  const pdf = await PDFDocument.load(pdfBytes);
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const fontSize = options.fontSize ?? 48;
  const opacity = options.opacity ?? 0.15;
  const rotation = options.rotation ?? 45;
  const color = wrapRgb(options.color);
  const text = options.text || "WATERMARK";

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    // Diagonal center placement
    const cx = width / 2;
    const cy = height / 2;

    page.drawText(text, {
      x: cx - textWidth / 2,
      y: cy - textHeight / 2,
      size: fontSize,
      font,
      color,
      opacity,
      rotate: {
        type: RotationTypes.Degrees,
        angle: rotation,
      },
    });
  }

  pdf.setProducer("FileSmaller");
  const output = await pdf.save({ useObjectStreams: true, objectsPerTick: 25 });

  return {
    blob: new Blob([output], { type: "application/pdf" }),
    fileName: "watermarked.pdf",
    originalBytes: pdfBytes.byteLength,
    outputBytes: output.byteLength,
    pageCount: pages.length,
  };
}

export async function addImageWatermark(
  pdfBytes: ArrayBuffer,
  imageBytes: ArrayBuffer,
  imageType: "png" | "jpg",
  options?: ImageWatermarkOptions
): Promise<WatermarkResult> {
  const pdf = await PDFDocument.load(pdfBytes);
  const pages = pdf.getPages();

  const embedded =
    imageType === "jpg"
      ? await pdf.embedJpg(new Uint8Array(imageBytes))
      : await pdf.embedPng(new Uint8Array(imageBytes));

  const opacity = options?.opacity ?? 0.2;
  const scale = options?.scale ?? 0.3;

  for (const page of pages) {
    const { width, height } = page.getSize();
    const imgW = embedded.width * scale;
    const imgH = embedded.height * scale;
    const x = (width - imgW) / 2;
    const y = (height - imgH) / 2;

    page.drawImage(embedded, {
      x,
      y,
      width: imgW,
      height: imgH,
      opacity,
    });
  }

  pdf.setProducer("FileSmaller");
  const output = await pdf.save({ useObjectStreams: true, objectsPerTick: 25 });

  return {
    blob: new Blob([output], { type: "application/pdf" }),
    fileName: "watermarked.pdf",
    originalBytes: pdfBytes.byteLength,
    outputBytes: output.byteLength,
    pageCount: pages.length,
  };
}
