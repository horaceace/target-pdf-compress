import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import {
  PDFDocument,
  StandardFonts,
  rgb
} from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const fixturesDir = path.join(projectRoot, "test-fixtures", "pdf-compression");

const crcTable = new Uint32Array(256);

for (let index = 0; index < 256; index += 1) {
  let current = index;

  for (let bit = 0; bit < 8; bit += 1) {
    current = current & 1 ? 0xedb88320 ^ (current >>> 1) : current >>> 1;
  }

  crcTable[index] = current >>> 0;
}

function crc32(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function uint32Bytes(value) {
  const bytes = Buffer.alloc(4);
  bytes.writeUInt32BE(value >>> 0, 0);
  return bytes;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const payload = Buffer.concat([typeBytes, data]);

  return Buffer.concat([
    uint32Bytes(data.length),
    payload,
    uint32Bytes(crc32(payload))
  ]);
}

function createRgbPng(width, height, pixelAt) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  let offset = 0;

  for (let y = 0; y < height; y += 1) {
    raw[offset] = 0;
    offset += 1;

    for (let x = 0; x < width; x += 1) {
      const [red, green, blue] = pixelAt(x, y);
      raw[offset] = red;
      raw[offset + 1] = green;
      raw[offset + 2] = blue;
      offset += 3;
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(raw, { level: 6 })),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

function createNoisyImagePng(width, height, seed) {
  return createRgbPng(width, height, (x, y) => {
    const value = (x * 37 + y * 71 + seed * 131 + ((x * y) % 251)) % 256;
    return [
      value,
      (value * 3 + x + seed) % 256,
      (value * 5 + y * 2 + seed * 11) % 256
    ];
  });
}

function createScannedPagePng(width, height, seed) {
  return createRgbPng(width, height, (x, y) => {
    const paper = 232 + ((x * 3 + y * 5 + seed) % 18);
    const line = y % 56 >= 0 && y % 56 <= 3 && x > 72 && x < width - 70;
    const margin = x > 44 && x < 49;
    const speckle = (x * 17 + y * 23 + seed * 31) % 997 < 6;
    const mark = line || margin || speckle;
    const value = mark ? 80 + ((x + y + seed) % 42) : paper;

    return [value, value, Math.max(0, value - 8)];
  });
}

function createColorScanPng(width, height, seed) {
  return createRgbPng(width, height, (x, y) => {
    const paper = 218 + ((x * 7 + y * 11 + seed) % 26);
    const shadow = Math.round(18 * (x / width) + 10 * (y / height));
    const row = y % 74;
    const line = row >= 0 && row <= 4 && x > 110 && x < width - 92;
    const box =
      x > 118 &&
      x < width - 118 &&
      y > 188 &&
      y < height - 210 &&
      (x % 260 < 4 || y % 170 < 4);
    const stamp =
      (x - width * 0.72) ** 2 / 155 ** 2 + (y - height * 0.24) ** 2 / 78 ** 2 < 1 &&
      (x + y + seed) % 13 < 7;
    const speckle = (x * 19 + y * 29 + seed * 37 + ((x * y) % 113)) % 997 < 18;
    const ink = line || box || speckle;
    const base = Math.max(0, paper - shadow);

    if (stamp) {
      return [170 + ((x + seed) % 28), 62 + ((y + seed) % 18), 58 + ((x + y) % 22)];
    }

    if (ink) {
      const value = 54 + ((x * 3 + y * 5 + seed) % 58);
      return [value, Math.max(0, value - 3), Math.max(0, value - 12)];
    }

    return [
      Math.min(255, base + 10),
      Math.min(255, base + ((x + seed) % 10)),
      Math.max(0, base - 14 + ((y + seed) % 12))
    ];
  });
}

function createBlackWhiteScanPng(width, height, seed) {
  return createRgbPng(width, height, (x, y) => {
    const paper = 238 + ((x * 5 + y * 13 + seed) % 12);
    const row = y % 48;
    const textLine = row < 3 && x > 86 && x < width - 80;
    const tableLine =
      x > 72 &&
      x < width - 72 &&
      y > 144 &&
      y < height - 160 &&
      (x % 180 < 3 || y % 126 < 3);
    const punchedHole =
      (x - 62) ** 2 + (y - height * 0.28) ** 2 < 18 ** 2 ||
      (x - 62) ** 2 + (y - height * 0.54) ** 2 < 18 ** 2;
    const speckle = (x * 23 + y * 17 + seed * 41 + ((x + y) % 89)) % 1009 < 14;
    const mark = textLine || tableLine || punchedHole || speckle;
    const value = mark ? 28 + ((x + y + seed) % 46) : paper;

    return [value, value, value];
  });
}

async function savePdf(fileName, pdfDoc) {
  const bytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false
  });
  const filePath = path.join(fixturesDir, fileName);

  await writeFile(filePath, bytes);
  return { fileName, bytes: bytes.byteLength };
}

async function createCleanOfficePdf() {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  for (let pageIndex = 0; pageIndex < 5; pageIndex += 1) {
    const page = pdf.addPage([612, 792]);

    page.drawText("FileSmaller benchmark office document", {
      x: 54,
      y: 730,
      size: 18,
      font: bold,
      color: rgb(0.11, 0.2, 0.19)
    });

    page.drawText(`Page ${pageIndex + 1}`, {
      x: 54,
      y: 704,
      size: 10,
      font: regular,
      color: rgb(0.42, 0.48, 0.46)
    });

    for (let lineIndex = 0; lineIndex < 28; lineIndex += 1) {
      page.drawText(
        "This sample is a text-heavy PDF used to check structural compression behavior.",
        {
          x: 54,
          y: 660 - lineIndex * 19,
          size: 10,
          font: regular,
          color: rgb(0.16, 0.18, 0.18)
        }
      );
    }
  }

  return pdf;
}

async function createMixedContentPdf() {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  for (let pageIndex = 0; pageIndex < 4; pageIndex += 1) {
    const page = pdf.addPage([612, 792]);

    page.drawText("FileSmaller mixed-content benchmark", {
      x: 54,
      y: 730,
      size: 18,
      font: bold,
      color: rgb(0.1, 0.18, 0.18)
    });

    for (let cardIndex = 0; cardIndex < 6; cardIndex += 1) {
      const x = 54 + (cardIndex % 2) * 252;
      const y = 610 - Math.floor(cardIndex / 2) * 146;
      const shade = 0.08 + cardIndex * 0.08;

      page.drawRectangle({
        x,
        y,
        width: 214,
        height: 92,
        color: rgb(0.86 - shade * 0.2, 0.94 - shade * 0.08, 0.91 - shade * 0.05)
      });
      page.drawText(`Chart block ${cardIndex + 1}`, {
        x: x + 14,
        y: y + 60,
        size: 11,
        font: bold,
        color: rgb(0.16, 0.26, 0.24)
      });
      page.drawText("Text plus simple vector graphics.", {
        x: x + 14,
        y: y + 38,
        size: 9,
        font: regular,
        color: rgb(0.32, 0.38, 0.36)
      });
    }
  }

  return pdf;
}

async function createImageHeavyPdf() {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  for (let pageIndex = 0; pageIndex < 3; pageIndex += 1) {
    const page = pdf.addPage([612, 792]);
    const imageBytes = createNoisyImagePng(900, 1100, pageIndex + 1);
    const image = await pdf.embedPng(imageBytes);

    page.drawImage(image, {
      x: 42,
      y: 92,
      width: 528,
      height: 646
    });

    page.drawText(`Synthetic image-heavy page ${pageIndex + 1}`, {
      x: 54,
      y: 730,
      size: 13,
      font: regular,
      color: rgb(0.1, 0.12, 0.12)
    });
  }

  return pdf;
}

async function createScannedLikePdf() {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Courier);

  for (let pageIndex = 0; pageIndex < 3; pageIndex += 1) {
    const page = pdf.addPage([612, 792]);
    const scanBytes = createScannedPagePng(1050, 1350, pageIndex + 3);
    const scan = await pdf.embedPng(scanBytes);

    page.drawImage(scan, {
      x: 36,
      y: 36,
      width: 540,
      height: 720
    });

    page.drawText("SYNTHETIC SCAN SAMPLE", {
      x: 70,
      y: 710,
      size: 9,
      font: regular,
      color: rgb(0.18, 0.18, 0.16),
      opacity: 0.65
    });
  }

  return pdf;
}

async function createScannedColorPdf() {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Courier);

  for (let pageIndex = 0; pageIndex < 4; pageIndex += 1) {
    const page = pdf.addPage([612, 792]);
    const scanBytes = createColorScanPng(1250, 1600, pageIndex + 11);
    const scan = await pdf.embedPng(scanBytes);

    page.drawImage(scan, {
      x: 26,
      y: 26,
      width: 560,
      height: 728
    });

    page.drawText("SYNTHETIC COLOR SCAN", {
      x: 82,
      y: 716,
      size: 9,
      font: regular,
      color: rgb(0.2, 0.18, 0.15),
      opacity: 0.55
    });
  }

  return pdf;
}

async function createScannedBlackWhitePdf() {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Courier);

  for (let pageIndex = 0; pageIndex < 4; pageIndex += 1) {
    const page = pdf.addPage([612, 792]);
    const scanBytes = createBlackWhiteScanPng(1200, 1550, pageIndex + 29);
    const scan = await pdf.embedPng(scanBytes);

    page.drawImage(scan, {
      x: 30,
      y: 28,
      width: 552,
      height: 713
    });

    page.drawText("SYNTHETIC BW SCAN", {
      x: 86,
      y: 706,
      size: 9,
      font: regular,
      color: rgb(0.16, 0.16, 0.16),
      opacity: 0.5
    });
  }

  return pdf;
}

async function main() {
  await mkdir(fixturesDir, { recursive: true });

  const generated = [];
  generated.push(await savePdf("sample-clean-office.pdf", await createCleanOfficePdf()));
  generated.push(await savePdf("sample-mixed-content.pdf", await createMixedContentPdf()));
  generated.push(await savePdf("sample-image-heavy.pdf", await createImageHeavyPdf()));
  generated.push(await savePdf("sample-scanned-like.pdf", await createScannedLikePdf()));
  generated.push(await savePdf("sample-scanned-color.pdf", await createScannedColorPdf()));
  generated.push(await savePdf("sample-scanned-bw.pdf", await createScannedBlackWhitePdf()));

  console.log("Generated synthetic compression fixtures:");
  for (const item of generated) {
    console.log(`- ${item.fileName}: ${item.bytes} bytes`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
