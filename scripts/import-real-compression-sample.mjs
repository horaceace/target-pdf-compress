import { copyFile, mkdir, open, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const fixturesDir = path.join(projectRoot, "test-fixtures", "pdf-compression");
const manifestPath = path.join(fixturesDir, "sample-manifest.json");
const notesPath = path.join(fixturesDir, "sample-notes.json");

function usage() {
  return [
    "Usage:",
    "  npm run samples:import -- --list",
    "  npm run samples:import -- --slot real-scanned-color.pdf --source /path/to/file.pdf",
    "  npm run samples:import -- --source-dir /path/to/renamed-pdfs",
    "",
    "Options:",
    "  --list             Show required real sample slots",
    "  --slot <file>      Required manifest fileName, for example real-resume-export.pdf",
    "  --source <path>    Local PDF file to copy into the selected slot",
    "  --source-dir <dir> Import every PDF whose filename matches a required manifest slot",
    "  --note <text>      Optional short non-sensitive note",
    "  --force            Overwrite an existing slot file",
    "  --dry-run          Show what would be imported without copying files",
    "  --accept-privacy-risk",
    "                     Import even when metadata or filename privacy risks are detected"
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

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

async function assertPdfFile(sourcePath) {
  const stats = await stat(sourcePath);

  if (!stats.isFile()) {
    throw new Error(`Source is not a file: ${sourcePath}`);
  }

  const file = await open(sourcePath, "r");
  const headerBuffer = Buffer.alloc(5);

  try {
    await file.read(headerBuffer, 0, 5, 0);
  } finally {
    await file.close();
  }

  const header = headerBuffer.toString("utf8");

  if (!sourcePath.toLowerCase().endsWith(".pdf") && !header.startsWith("%PDF-")) {
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

function scanPrivacyRisks(fileName, metadata) {
  const patterns = [
    { id: "email", pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i },
    { id: "phone-like", pattern: /(?:\+?\d[\s().-]*){8,}/ },
    { id: "ssn-like", pattern: /\b\d{3}-\d{2}-\d{4}\b/ },
    { id: "credit-card-like", pattern: /\b(?:\d[ -]*?){13,19}\b/ },
    { id: "identity-keyword", pattern: /\b(passport|driver license|social security|bank account|medical record|patient|invoice no\.?|tax id)\b/i },
    { id: "chinese-sensitive-keyword", pattern: /(身份证|护照|银行卡|银行账号|病历|患者|合同编号|纳税人识别号)/ }
  ];
  const metadataEntries = Object.entries(metadata).filter(([, value]) => Boolean(value));
  const sensitiveMetadataEntries = metadataEntries.filter(([field]) =>
    ["title", "author", "subject", "keywords"].includes(field)
  );
  const scanTargets = [
    { field: "fileName", value: fileName },
    {
      field: "metadata",
      value: sensitiveMetadataEntries.map(([field, value]) => `${field}: ${value}`).join("\n")
    }
  ];
  const patternRisks = scanTargets.flatMap((target) =>
    patterns
      .filter((item) => item.pattern.test(target.value))
      .map((item) => ({
        type: "pattern",
        field: target.field,
        detail: item.id
      }))
  );

  return [
    ...sensitiveMetadataEntries.map(([field, value]) => ({
      type: "metadata-present",
      field,
      detail: String(value).slice(0, 120)
    })),
    ...patternRisks
  ];
}

async function privacyPrecheck(sourcePath) {
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

  return {
    pageCount: pdf.getPageCount(),
    metadata,
    riskItems: scanPrivacyRisks(path.basename(sourcePath), metadata)
  };
}

async function listSlots(requiredSamples) {
  console.log("Required real sample slots:");

  for (const sample of requiredSamples) {
    const filePath = path.join(fixturesDir, sample.fileName);
    let status = "missing";
    let size = "-";

    try {
      const stats = await stat(filePath);
      status = "covered";
      size = formatBytes(stats.size);
    } catch {
      // Keep missing status.
    }

    console.log(`- ${sample.fileName} [${status}, ${size}]`);
    console.log(`  Type: ${sample.type}`);
    console.log(`  Focus: ${sample.reviewFocus}`);
  }
}

async function targetExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function importSample({
  sample,
  sourcePath,
  note,
  force,
  acceptPrivacyRisk,
  dryRun
}) {
  const targetPath = path.join(fixturesDir, sample.fileName);
  const sourceStats = await assertPdfFile(sourcePath);
  const privacy = await privacyPrecheck(sourcePath);

  if (privacy.riskItems.length && !acceptPrivacyRisk) {
    return {
      status: "skipped",
      sample,
      sourcePath,
      reason: "privacy-risk",
      privacy,
      sourceStats
    };
  }

  const exists = await targetExists(targetPath);

  if (exists && !force) {
    return {
      status: "skipped",
      sample,
      sourcePath,
      reason: "target-exists",
      privacy,
      sourceStats
    };
  }

  if (dryRun) {
    return {
      status: "dry-run",
      sample,
      sourcePath,
      reason: exists ? "would-overwrite" : "would-import",
      privacy,
      sourceStats
    };
  }

  await mkdir(fixturesDir, { recursive: true });
  await copyFile(sourcePath, targetPath);

  const notes = await readJson(notesPath, { importedRealSamples: {} });
  notes.importedRealSamples ??= {};
  notes.importedRealSamples[sample.fileName] = {
    importedAt: new Date().toISOString(),
    originalFileName: path.basename(sourcePath),
    sizeBytes: sourceStats.size,
    pageCount: privacy.pageCount,
    note: note ?? "",
    type: sample.type,
    goal: sample.goal,
    reviewFocus: sample.reviewFocus,
    privacyPrecheck: {
      riskStatus: privacy.riskItems.length ? "reviewed-risk" : "ok",
      riskItems: privacy.riskItems.map((item) => ({
        type: item.type,
        field: item.field,
        detail: item.detail
      }))
    }
  };

  await writeFile(notesPath, `${JSON.stringify(notes, null, 2)}\n`);

  return {
    status: "imported",
    sample,
    sourcePath,
    privacy,
    sourceStats
  };
}

async function importDirectory({
  sourceDir,
  requiredSamples,
  note,
  force,
  acceptPrivacyRisk,
  dryRun
}) {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  const sourceByFileName = new Map(
    entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"))
      .map((entry) => [entry.name.toLowerCase(), path.join(sourceDir, entry.name)])
  );
  const results = [];

  for (const sample of requiredSamples) {
    const sourcePath = sourceByFileName.get(sample.fileName.toLowerCase());

    if (!sourcePath) {
      results.push({
        status: "missing-source",
        sample,
        reason: "no matching file in source dir"
      });
      continue;
    }

    results.push(
      await importSample({
        sample,
        sourcePath,
        note,
        force,
        acceptPrivacyRisk,
        dryRun
      })
    );
  }

  return results;
}

function printImportResult(result) {
  const label = result.sample.fileName;

  if (result.status === "missing-source") {
    console.log(`- ${label}: missing matching source file`);
    return;
  }

  const sourceName = path.basename(result.sourcePath);
  const privacyStatus = result.privacy.riskItems.length ? "reviewed-risk" : "ok";
  const detail = `${sourceName}, ${formatBytes(result.sourceStats.size)}, ${result.privacy.pageCount} page${result.privacy.pageCount === 1 ? "" : "s"}, privacy ${privacyStatus}`;

  if (result.status === "imported") {
    console.log(`- ${label}: imported (${detail})`);
    return;
  }

  if (result.status === "dry-run") {
    console.log(`- ${label}: ${result.reason} (${detail})`);
    return;
  }

  if (result.reason === "privacy-risk") {
    console.log(`- ${label}: skipped privacy risk (${detail})`);
    for (const item of result.privacy.riskItems) {
      console.log(`  - ${item.type} / ${item.field}: ${item.detail}`);
    }
    return;
  }

  if (result.reason === "target-exists") {
    console.log(`- ${label}: skipped existing target (${detail})`);
    return;
  }

  console.log(`- ${label}: skipped (${result.reason})`);
}

async function main() {
  const { values } = parseArgs({
    options: {
      list: { type: "boolean", default: false },
      slot: { type: "string" },
      source: { type: "string" },
      "source-dir": { type: "string" },
      note: { type: "string" },
      force: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      "accept-privacy-risk": { type: "boolean", default: false },
      help: { type: "boolean", default: false }
    }
  });

  const manifest = await readJson(manifestPath, { requiredRealSamples: [] });
  const requiredSamples = manifest.requiredRealSamples ?? [];

  if (values.help) {
    console.log(usage());
    return;
  }

  if (values.list) {
    await listSlots(requiredSamples);
    return;
  }

  if (values["source-dir"]) {
    if (values.slot || values.source) {
      throw new Error("Use either --source-dir or --slot/--source, not both.");
    }

    const sourceDir = path.resolve(process.cwd(), values["source-dir"]);
    const results = await importDirectory({
      sourceDir,
      requiredSamples,
      note: values.note,
      force: values.force,
      acceptPrivacyRisk: values["accept-privacy-risk"],
      dryRun: values["dry-run"]
    });
    const importedCount = results.filter((result) => result.status === "imported").length;
    const dryRunCount = results.filter((result) => result.status === "dry-run").length;
    const skippedCount = results.filter((result) => result.status === "skipped").length;
    const missingCount = results.filter((result) => result.status === "missing-source").length;

    console.log(values["dry-run"] ? "Batch import dry run:" : "Batch import results:");
    for (const result of results) {
      printImportResult(result);
    }
    console.log("");
    console.log(
      `Summary: ${importedCount} imported, ${dryRunCount} dry-run, ${skippedCount} skipped, ${missingCount} missing source.`
    );

    if (skippedCount > 0 && !values["accept-privacy-risk"]) {
      console.log("Sanitize risky PDFs first, or rerun with --accept-privacy-risk after manual review.");
    }

    if (importedCount > 0) {
      console.log("Next: npm run samples:check && npm run benchmark:pipeline");
    }

    return;
  }

  if (!values.slot || !values.source) {
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  const sample = requiredSamples.find((item) => item.fileName === values.slot);

  if (!sample) {
    throw new Error(`Unknown slot: ${values.slot}. Run npm run samples:import -- --list`);
  }

  const sourcePath = path.resolve(process.cwd(), values.source);
  const result = await importSample({
    sample,
    sourcePath,
    note: values.note,
    force: values.force,
    acceptPrivacyRisk: values["accept-privacy-risk"],
    dryRun: values["dry-run"]
  });

  if (result.reason === "privacy-risk") {
    console.error("Privacy precheck found metadata or filename risks:");
    for (const item of result.privacy.riskItems) {
      console.error(`- ${item.type} / ${item.field}: ${item.detail}`);
    }
    console.error("");
    console.error("Sanitize the PDF first, or rerun with --accept-privacy-risk after manual review.");
    process.exitCode = 1;
    return;
  }

  if (result.reason === "target-exists") {
    throw new Error(`${sample.fileName} already exists. Re-run with --force if you want to replace it.`);
  }

  if (result.status === "dry-run") {
    console.log(`Dry run: ${path.basename(sourcePath)} -> ${sample.fileName}`);
  } else {
    console.log(`Imported ${path.basename(sourcePath)} -> ${sample.fileName}`);
  }
  console.log(`Size: ${formatBytes(result.sourceStats.size)}`);
  console.log(`Pages: ${result.privacy.pageCount}`);
  console.log(`Privacy precheck: ${result.privacy.riskItems.length ? "reviewed-risk" : "ok"}`);
  console.log(values["dry-run"] ? "No files copied." : "Next: npm run samples:check && npm run benchmark:pipeline");
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
