import { PDFDocument } from "pdf-lib";

export type ImageFitMode = "original" | "contain" | "cover";

export type ImageToPdfResult = {
  blob: Blob;
  fileName: string;
  totalImages: number;
  totalBytes: number;
  outputBytes: number;
  pageCount: number;
};

function inferImageType(file: File) {
  const lowerName = file.name.toLowerCase();

  if (file.type === "image/jpeg" || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
    return "jpg" as const;
  }

  if (file.type === "image/png" || lowerName.endsWith(".png")) {
    return "png" as const;
  }

  throw new Error(`${file.name} is not a supported JPG or PNG image.`);
}

function drawImageOnPage(
  page: ReturnType<PDFDocument["addPage"]>,
  width: number,
  height: number,
  imageWidth: number,
  imageHeight: number,
  fitMode: ImageFitMode,
  draw: (x: number, y: number, drawWidth: number, drawHeight: number) => void
) {
  if (fitMode === "original") {
    draw(0, 0, imageWidth, imageHeight);
    return;
  }

  const widthRatio = width / imageWidth;
  const heightRatio = height / imageHeight;
  const scale = fitMode === "cover" ? Math.max(widthRatio, heightRatio) : Math.min(widthRatio, heightRatio);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  draw(x, y, drawWidth, drawHeight);
}

export async function imagesToPdf(
  files: File[],
  fitMode: ImageFitMode = "contain"
): Promise<ImageToPdfResult> {
  if (!files.length) {
    throw new Error("Select at least one JPG or PNG image to create a PDF.");
  }

  const pdf = await PDFDocument.create();
  let totalBytes = 0;

  for (const file of files) {
    const imageType = inferImageType(file);
    totalBytes += file.size;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const embedded =
      imageType === "jpg" ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);
    const imageWidth = embedded.width;
    const imageHeight = embedded.height;
    const page = pdf.addPage([imageWidth, imageHeight]);

    drawImageOnPage(
      page,
      imageWidth,
      imageHeight,
      imageWidth,
      imageHeight,
      fitMode,
      (x, y, drawWidth, drawHeight) => {
        page.drawImage(embedded, {
          x,
          y,
          width: drawWidth,
          height: drawHeight
        });
      }
    );
  }

  pdf.setProducer("FileSmaller");
  pdf.setCreator("FileSmaller");
  pdf.setTitle("images-to-pdf");

  const output = await pdf.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    objectsPerTick: 25
  });

  return {
    blob: new Blob([output], { type: "application/pdf" }),
    fileName: "images-to-pdf.pdf",
    totalImages: files.length,
    totalBytes,
    outputBytes: output.byteLength,
    pageCount: files.length
  };
}
