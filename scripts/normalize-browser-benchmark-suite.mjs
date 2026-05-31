import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const resultsDir = path.join(projectRoot, "test-fixtures", "pdf-compression", "results");

async function latestFile(prefix, extension) {
  const files = (await readdir(resultsDir))
    .filter((fileName) => fileName.startsWith(prefix) && fileName.endsWith(extension))
    .filter((fileName) => !fileName.includes("-normalized-"))
    .sort((a, b) => b.localeCompare(a));

  return files[0] ? path.join(resultsDir, files[0]) : null;
}

function inferSampleKind(fileName) {
  if (fileName.startsWith("real-")) {
    return "real";
  }

  if (fileName.startsWith("sample-")) {
    return "synthetic";
  }

  return "other";
}

function parseMarkdownTable(lines, startIndex) {
  let headers = [];
  const rows = [];
  let consumedUntil = startIndex;

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.startsWith("|")) {
      if (headers.length) {
        consumedUntil = index;
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
    } else {
      rows.push(Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex] ?? ""])));
    }

    consumedUntil = index + 1;
  }

  return { headers, rows, consumedUntil };
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell).replaceAll("|", "\\|")).join(" | ")} |`)
  ].join("\n");
}

function normalizeSuite(markdown, sourcePath) {
  const lines = markdown.split("\n");
  const generatedLine = lines.find((line) => line.startsWith("Generated:")) ?? `Generated: ${new Date().toISOString()}`;
  const summaryStart = lines.findIndex((line) => line.trim() === "## Summary");
  const fullStart = lines.findIndex((line) => line.trim() === "## Full mode results");

  if (summaryStart === -1 || fullStart === -1) {
    throw new Error("Browser suite Markdown must include ## Summary and ## Full mode results sections.");
  }

  const summary = parseMarkdownTable(lines, summaryStart);
  const details = parseMarkdownTable(lines, fullStart);
  const summaryRows = summary.rows.map((row) => ({
    fileName: row.File,
    sampleKind: row.Type || inferSampleKind(row.File),
    bestMode: row["Best mode"],
    before: row.Before,
    bestAfter: row["Best after"],
    bestReduction: row["Best reduction"],
    scannedAfter: row["Scanned after"],
    scannedReduction: row["Scanned reduction"],
    scannedDetails: row["Scanned details"],
    note: row.Note || "-"
  }));
  const detailRows = details.rows.map((row) => ({
    fileName: row.File,
    sampleKind: row.Type || inferSampleKind(row.File),
    mode: row.Mode,
    status: row.Status,
    profile: row.Profile,
    before: row.Before,
    after: row.After,
    saved: row.Saved,
    reduction: row.Reduction,
    time: row.Time,
    details: row.Details,
    error: row.Error
  }));
  const fixtureMix = {
    real: summaryRows.filter((row) => row.sampleKind === "real").length,
    synthetic: summaryRows.filter((row) => row.sampleKind === "synthetic").length,
    other: summaryRows.filter((row) => row.sampleKind === "other").length
  };

  return [
    "# Browser PDF compression benchmark suite",
    "",
    generatedLine,
    "",
    "This report measures local PDF fixtures through the browser compression path, including the Scanned PDF render-and-rebuild path.",
    "",
    `Fixture mix: ${fixtureMix.real} real, ${fixtureMix.synthetic} synthetic, ${fixtureMix.other} other.`,
    "",
    `Normalized from: ${path.relative(projectRoot, sourcePath)}`,
    "",
    "## Summary",
    "",
    markdownTable(
      [
        "File",
        "Type",
        "Best mode",
        "Before",
        "Best after",
        "Best reduction",
        "Scanned after",
        "Scanned reduction",
        "Scanned details",
        "Note"
      ],
      summaryRows.map((row) => [
        row.fileName,
        row.sampleKind,
        row.bestMode,
        row.before,
        row.bestAfter,
        row.bestReduction,
        row.scannedAfter,
        row.scannedReduction,
        row.scannedDetails,
        row.note
      ])
    ),
    "",
    "## Full mode results",
    "",
    markdownTable(
      [
        "File",
        "Type",
        "Mode",
        "Status",
        "Profile",
        "Before",
        "After",
        "Saved",
        "Reduction",
        "Time",
        "Details",
        "Error"
      ],
      detailRows.map((row) => [
        row.fileName,
        row.sampleKind,
        row.mode,
        row.status,
        row.profile,
        row.before,
        row.after,
        row.saved,
        row.reduction,
        row.time,
        row.details,
        row.error
      ])
    ),
    ""
  ].join("\n");
}

async function main() {
  await mkdir(resultsDir, { recursive: true });

  const sourcePath = await latestFile("browser-compression-benchmark-suite-", ".md");

  if (!sourcePath) {
    console.log("No browser benchmark suite Markdown found.");
    return;
  }

  const sourceMarkdown = await readFile(sourcePath, "utf8");
  const normalized = normalizeSuite(sourceMarkdown, sourcePath);
  const datePart = new Date().toISOString().slice(0, 10);
  const outputPath = path.join(resultsDir, `browser-compression-benchmark-suite-normalized-${datePart}.md`);

  await writeFile(outputPath, normalized);

  console.log(`Normalized ${path.relative(projectRoot, sourcePath)}`);
  console.log(`Wrote ${path.relative(projectRoot, outputPath)}`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
