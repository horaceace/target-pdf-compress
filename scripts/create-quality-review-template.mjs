import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const resultsDir = path.join(projectRoot, "test-fixtures", "pdf-compression", "results");
const outputPath = path.join(resultsDir, "quality-review-template.md");

async function latestFile(prefix, extension) {
  const files = (await readdir(resultsDir))
    .filter((fileName) => fileName.startsWith(prefix) && fileName.endsWith(extension))
    .sort((a, b) => {
      const normalizedDiff = Number(b.includes("-normalized-")) - Number(a.includes("-normalized-"));

      if (normalizedDiff !== 0) {
        return normalizedDiff;
      }

      return b.localeCompare(a);
    });

  return files[0] ? path.join(resultsDir, files[0]) : null;
}

function inferSampleKind(fileName, explicitKind) {
  if (explicitKind) {
    return explicitKind;
  }

  if (fileName.startsWith("real-")) {
    return "real";
  }

  if (fileName.startsWith("sample-")) {
    return "synthetic";
  }

  return "unknown";
}

function parseBrowserSummary(markdown) {
  const lines = markdown.split("\n");
  const summaryStart = lines.findIndex((line) => line.trim() === "## Summary");

  if (summaryStart === -1) {
    return [];
  }

  const rows = [];

  let headers = [];

  for (const line of lines.slice(summaryStart + 1)) {
    if (!line.startsWith("|")) {
      if (headers.length) {
        break;
      }

      continue;
    }

    if (line.includes("---")) {
      continue;
    }

    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());

    if (!headers.length) {
      headers = cells;
      continue;
    }

    if (cells.length < 7) {
      break;
    }

    const valueByHeader = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));

    rows.push({
      fileName: valueByHeader.File,
      sampleKind: inferSampleKind(valueByHeader.File, valueByHeader.Type),
      bestMode: valueByHeader["Best mode"],
      before: valueByHeader.Before,
      bestAfter: valueByHeader["Best after"],
      bestReduction: valueByHeader["Best reduction"],
      scannedAfter: valueByHeader["Scanned after"],
      scannedReduction: valueByHeader["Scanned reduction"],
      scannedDetails: valueByHeader["Scanned details"] ?? "",
      note: valueByHeader.Note ?? ""
    });
  }

  return rows;
}

function reviewFocus(row) {
  const name = row.fileName.toLowerCase();

  if (name.includes("resume")) {
    return "Resume text, section headings, links, and contact info remain readable";
  }

  if (name.includes("invoice") || name.includes("table")) {
    return "Small numbers, table lines, totals, dates, and labels remain readable";
  }

  if (name.includes("scan") || row.bestMode === "Scanned PDF") {
    return "Scan text edges, stamps, signatures, and form fields remain readable";
  }

  if (name.includes("image")) {
    return "Important image details remain acceptable after compression";
  }

  if (name.includes("large")) {
    return "Output opens quickly and browser does not stall during processing";
  }

  return "First page and critical text remain readable after compression";
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell).replaceAll("|", "\\|")).join(" | ")} |`)
  ].join("\n");
}

async function main() {
  await mkdir(resultsDir, { recursive: true });

  const browserPath = await latestFile("browser-compression-benchmark-suite-", ".md");

  if (!browserPath) {
    console.log("No browser benchmark suite found.");
    console.log("Run the dev benchmark page, export suite Markdown, and place it under test-fixtures/pdf-compression/results/.");
    return;
  }

  const browserMarkdown = await readFile(browserPath, "utf8");
  const rows = parseBrowserSummary(browserMarkdown);
  const markdown = [
    "# PDF Compression Quality Review Template",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Source browser benchmark: ${path.relative(projectRoot, browserPath)}`,
    "",
    "Use this template after exporting compressed PDFs or previewing first-page comparisons. Fill the review columns manually before making compression-engine decisions.",
    "",
    "## Manual Review Table",
    "",
    markdownTable(
      [
        "File",
        "Type",
        "Best mode",
        "Before",
        "After",
        "Reduction",
        "Scanned details",
        "Review focus",
        "Readable?",
        "Submit-safe?",
        "Notes"
      ],
      rows.map((row) => [
        row.fileName,
        row.sampleKind,
        row.bestMode,
        row.before,
        row.bestAfter,
        row.bestReduction,
        row.scannedDetails || "-",
        reviewFocus(row),
        "TBD",
        "TBD",
        row.note || ""
      ])
    ),
    "",
    "## Pass Criteria",
    "",
    "- `Readable?` should be `yes` only if critical text remains readable at normal viewing size.",
    "- `Submit-safe?` should be `yes` only if the compressed result is acceptable for the target workflow, such as upload, email, job application, or form submission.",
    "- If `Readable?` is `no`, the compression path should not become a default for that file type.",
    "- If `Submit-safe?` is `no`, keep the mode available only with a clear warning or require preview before download.",
    ""
  ].join("\n");

  await writeFile(outputPath, markdown);

  console.log(`Wrote ${path.relative(projectRoot, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
