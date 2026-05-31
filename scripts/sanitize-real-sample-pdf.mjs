import { mkdir, open, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

function usage() {
  return [
    "Usage:",
    "  npm run samples:sanitize -- --source /path/to/input.pdf --output /path/to/sanitized.pdf",
    "",
    "Options:",
    "  --source <path>       Source PDF",
    "  --output <path>       Sanitized PDF output path",
    "  --force               Overwrite output when it exists"
  ].join("\n");
}

async function readPdfHeader(filePath) {
  const file = await open(filePath, "r");
  const headerBuffer = Buffer.alloc(5);

  try {
    await file.read(headerBuffer, 0, 5, 0);
  } finally {
    await file.close();
  }

  return headerBuffer.toString("utf8");
}

async function assertPdfFile(filePath) {
  const stats = await stat(filePath);

  if (!stats.isFile()) {
    throw new Error(`Source is not a file: ${filePath}`);
  }

  const header = await readPdfHeader(filePath);

  if (!filePath.toLowerCase().endsWith(".pdf") && !header.startsWith("%PDF-")) {
    throw new Error("Source must be a PDF file. Use a .pdf file or a file with a PDF header.");
  }

  return stats;
}

function metadataValue(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value ? String(value) : "";
}

function metadataSummary(pdf) {
  return {
    title: metadataValue(pdf.getTitle()),
    author: metadataValue(pdf.getAuthor()),
    subject: metadataValue(pdf.getSubject()),
    keywords: metadataValue(pdf.getKeywords()),
    creator: metadataValue(pdf.getCreator()),
    producer: metadataValue(pdf.getProducer()),
    creationDate: metadataValue(pdf.getCreationDate()),
    modificationDate: metadataValue(pdf.getModificationDate())
  };
}

function changedFields(before, after) {
  return Object.keys(before).filter((field) => before[field] !== after[field]);
}

async function main() {
  const { values } = parseArgs({
    options: {
      source: { type: "string" },
      output: { type: "string" },
      force: { type: "boolean", default: false },
      help: { type: "boolean", default: false }
    }
  });

  if (values.help) {
    console.log(usage());
    return;
  }

  if (!values.source || !values.output) {
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  const sourcePath = path.resolve(process.cwd(), values.source);
  const outputPath = path.resolve(process.cwd(), values.output);

  await assertPdfFile(sourcePath);

  try {
    await stat(outputPath);

    if (!values.force) {
      throw new Error(`Output already exists: ${outputPath}. Re-run with --force to overwrite.`);
    }
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      throw error;
    }
  }

  const source = await PDFDocument.load(await readFile(sourcePath), {
    ignoreEncryption: true,
    updateMetadata: false
  });
  const before = metadataSummary(source);
  const sanitized = await PDFDocument.create();
  const copiedPages = await sanitized.copyPages(source, source.getPageIndices());

  copiedPages.forEach((page) => sanitized.addPage(page));

  sanitized.setTitle("");
  sanitized.setAuthor("");
  sanitized.setSubject("");
  sanitized.setKeywords([]);
  sanitized.setCreator("FileSmaller sample sanitizer");
  sanitized.setProducer("FileSmaller sample sanitizer");
  sanitized.setCreationDate(new Date(0));
  sanitized.setModificationDate(new Date(0));

  const outputBytes = await sanitized.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    addDefaultPage: false,
    objectsPerTick: 25
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, outputBytes);

  const reloaded = await PDFDocument.load(outputBytes, {
    ignoreEncryption: true,
    updateMetadata: false
  });
  const after = metadataSummary(reloaded);
  const relativeOutput = path.relative(projectRoot, outputPath);

  console.log(`Sanitized ${path.basename(sourcePath)} -> ${relativeOutput || outputPath}`);
  console.log(`Pages: ${reloaded.getPageCount()}`);
  console.log(`Changed metadata fields: ${changedFields(before, after).join(", ") || "none"}`);
  console.log("Next: npm run samples:privacy-check -- --source <sanitized.pdf>");
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
