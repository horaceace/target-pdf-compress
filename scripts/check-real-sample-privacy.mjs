import { mkdir, open, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const reportDir = path.join(projectRoot, "test-fixtures", "pdf-compression", "results");

const sensitivePatterns = [
  { id: "email", pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i },
  { id: "phone-like", pattern: /(?:\+?\d[\s().-]*){8,}/ },
  { id: "ssn-like", pattern: /\b\d{3}-\d{2}-\d{4}\b/ },
  { id: "credit-card-like", pattern: /\b(?:\d[ -]*?){13,19}\b/ },
  { id: "identity-keyword", pattern: /\b(passport|driver license|social security|bank account|medical record|patient|invoice no\.?|tax id)\b/i },
  { id: "chinese-sensitive-keyword", pattern: /(身份证|护照|银行卡|银行账号|病历|患者|合同编号|纳税人识别号)/ }
];

function usage() {
  return [
    "Usage:",
    "  npm run samples:privacy-check -- --source /path/to/non-sensitive.pdf",
    "",
    "Options:",
    "  --source <path>       PDF file to inspect",
    "  --json                Print machine-readable JSON",
    "  --write-report        Write Markdown report under test-fixtures/pdf-compression/results/",
    "  --fail-on-risk        Exit with code 1 when metadata or keyword risks are detected"
  ].join("\n");
}

function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
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

function metadataValue(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value ? String(value) : "";
}

function scanText(value) {
  return sensitivePatterns
    .filter((item) => item.pattern.test(value))
    .map((item) => item.id);
}

function safeReportName(sourcePath) {
  return path
    .basename(sourcePath)
    .toLowerCase()
    .replace(/\.pdf$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "pdf";
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell).replaceAll("|", "\\|")).join(" | ")} |`)
  ].join("\n");
}

async function inspectPdf(sourcePath) {
  const stats = await stat(sourcePath);

  if (!stats.isFile()) {
    throw new Error(`Source is not a file: ${sourcePath}`);
  }

  const header = await readPdfHeader(sourcePath);

  if (!sourcePath.toLowerCase().endsWith(".pdf") && !header.startsWith("%PDF-")) {
    throw new Error("Source must be a PDF file. Use a .pdf file or a file with a PDF header.");
  }

  const bytes = await readFile(sourcePath);
  const pdf = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
    updateMetadata: false
  });
  const metadata = {
    title: metadataValue(pdf.getTitle()),
    author: metadataValue(pdf.getAuthor()),
    subject: metadataValue(pdf.getSubject()),
    keywords: metadataValue(pdf.getKeywords()),
    creator: metadataValue(pdf.getCreator()),
    producer: metadataValue(pdf.getProducer()),
    creationDate: metadataValue(pdf.getCreationDate()),
    modificationDate: metadataValue(pdf.getModificationDate())
  };
  const metadataEntries = Object.entries(metadata).filter(([, value]) => Boolean(value));
  const sensitiveMetadataEntries = metadataEntries.filter(([field]) =>
    ["title", "author", "subject", "keywords"].includes(field)
  );
  const metadataRiskFields = sensitiveMetadataEntries;
  const metadataText = sensitiveMetadataEntries.map(([field, value]) => `${field}: ${value}`).join("\n");
  const fileNameRisks = scanText(path.basename(sourcePath));
  const metadataPatternRisks = scanText(metadataText);
  const riskItems = [
    ...metadataRiskFields.map(([field, value]) => ({
      type: "metadata-present",
      field,
      detail: value.slice(0, 120)
    })),
    ...fileNameRisks.map((id) => ({
      type: "filename-pattern",
      field: "fileName",
      detail: id
    })),
    ...metadataPatternRisks.map((id) => ({
      type: "metadata-pattern",
      field: "metadata",
      detail: id
    }))
  ];

  return {
    sourceFileName: path.basename(sourcePath),
    sizeBytes: stats.size,
    sizeLabel: formatBytes(stats.size),
    pageCount: pdf.getPageCount(),
    encrypted: pdf.isEncrypted,
    metadata,
    riskStatus: riskItems.length > 0 ? "review" : "ok",
    riskItems,
    limitations: [
      "This check reads PDF metadata and simple filename/metadata patterns only.",
      "It does not OCR pages or guarantee that page content is non-sensitive.",
      "Manually inspect and sanitize page content before committing real samples."
    ]
  };
}

function buildMarkdown(report) {
  return [
    "# Real PDF Sample Privacy Check",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `File: ${report.sourceFileName}`,
    `Size: ${report.sizeLabel}`,
    `Pages: ${report.pageCount}`,
    `Status: ${report.riskStatus}`,
    "",
    "## Metadata",
    "",
    markdownTable(
      ["Field", "Value"],
      Object.entries(report.metadata).map(([field, value]) => [field, value || "-"])
    ),
    "",
    "## Risk Items",
    "",
    report.riskItems.length
      ? markdownTable(
          ["Type", "Field", "Detail"],
          report.riskItems.map((item) => [item.type, item.field, item.detail])
        )
      : "- None detected from metadata or filename patterns.",
    "",
    "## Limitations",
    "",
    ...report.limitations.map((item) => `- ${item}`),
    ""
  ].join("\n");
}

async function main() {
  const { values } = parseArgs({
    options: {
      source: { type: "string" },
      json: { type: "boolean", default: false },
      "write-report": { type: "boolean", default: false },
      "fail-on-risk": { type: "boolean", default: false },
      help: { type: "boolean", default: false }
    }
  });

  if (values.help) {
    console.log(usage());
    return;
  }

  if (!values.source) {
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  const sourcePath = path.resolve(process.cwd(), values.source);
  const report = await inspectPdf(sourcePath);

  if (values.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`File: ${report.sourceFileName}`);
    console.log(`Size: ${report.sizeLabel}`);
    console.log(`Pages: ${report.pageCount}`);
    console.log(`Privacy precheck: ${report.riskStatus}`);

    if (report.riskItems.length) {
      console.log("Risk items:");
      for (const item of report.riskItems) {
        console.log(`- ${item.type} / ${item.field}: ${item.detail}`);
      }
    } else {
      console.log("No metadata or filename pattern risk detected.");
    }

    console.log("Reminder: manually inspect page content; this script does not OCR the PDF.");
  }

  if (values["write-report"]) {
    await mkdir(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, `sample-privacy-check-${safeReportName(sourcePath)}.md`);
    await writeFile(reportPath, buildMarkdown(report));
    console.log(`Wrote ${path.relative(projectRoot, reportPath)}`);
  }

  if (values["fail-on-risk"] && report.riskItems.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
