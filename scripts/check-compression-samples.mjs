import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const fixturesDir = path.join(projectRoot, "test-fixtures", "pdf-compression");
const resultsDir = path.join(fixturesDir, "results");
const manifestPath = path.join(fixturesDir, "sample-manifest.json");
const notesPath = path.join(fixturesDir, "sample-notes.json");
const outputPath = path.join(resultsDir, "sample-coverage-report.md");

function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell).replaceAll("|", "\\|")).join(" | ")} |`)
  ].join("\n");
}

async function fileInfo(fileName) {
  const filePath = path.join(fixturesDir, fileName);

  try {
    const stats = await stat(filePath);
    return {
      exists: true,
      size: stats.size
    };
  } catch {
    return {
      exists: false,
      size: 0
    };
  }
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

async function main() {
  await mkdir(resultsDir, { recursive: true });

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const notes = await readJson(notesPath, { importedRealSamples: {} });
  const requiredSamples = manifest.requiredRealSamples ?? [];
  const fixtureFiles = (await readdir(fixturesDir))
    .filter((fileName) => fileName.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => a.localeCompare(b));
  const syntheticFiles = fixtureFiles.filter((fileName) => fileName.startsWith("sample-"));
  const realFiles = fixtureFiles.filter((fileName) => fileName.startsWith("real-"));
  const rows = [];

  for (const sample of requiredSamples) {
    const info = await fileInfo(sample.fileName);

    rows.push([
      info.exists ? "covered" : "missing",
      sample.fileName,
      sample.type,
      sample.goal,
      sample.reviewFocus,
      info.exists ? formatBytes(info.size) : "-",
      notes.importedRealSamples?.[sample.fileName]?.note || "-"
    ]);
  }

  const coveredCount = rows.filter((row) => row[0] === "covered").length;
  const missingCount = rows.length - coveredCount;
  const markdown = [
    "# PDF Sample Coverage Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Required real samples: ${rows.length}`,
    `- Covered real samples: ${coveredCount}`,
    `- Missing real samples: ${missingCount}`,
    `- Synthetic samples present: ${syntheticFiles.length}`,
    `- Extra real samples present: ${realFiles.filter((fileName) => !requiredSamples.some((sample) => sample.fileName === fileName)).length}`,
    "",
    "## Required Real Samples",
    "",
    markdownTable(["Status", "File", "Type", "Goal", "Review focus", "Size", "Note"], rows),
    "",
    "## Synthetic Samples",
    "",
    syntheticFiles.length ? syntheticFiles.map((fileName) => `- ${fileName}`).join("\n") : "- None",
    "",
    "## Extra Real Samples",
    "",
    realFiles
      .filter((fileName) => !requiredSamples.some((sample) => sample.fileName === fileName))
      .map((fileName) => `- ${fileName}`)
      .join("\n") || "- None",
    "",
    "## Next Actions",
    "",
    "- Create a handoff folder with `npm run samples:intake-kit`.",
    "- Put reviewed non-sensitive PDFs in `test-fixtures/pdf-compression/results/real-sample-intake-kit/` and rename them to the required slot filenames.",
    "- Dry-run the batch import with `npm run samples:import -- --source-dir test-fixtures/pdf-compression/results/real-sample-intake-kit --dry-run`.",
    "- Import clean samples, then run `npm run benchmark:pipeline`.",
    ""
  ].join("\n");

  await writeFile(outputPath, markdown);

  console.log(`Required real samples: ${rows.length}`);
  console.log(`Covered real samples: ${coveredCount}`);
  console.log(`Missing real samples: ${missingCount}`);
  console.log(`Wrote ${path.relative(projectRoot, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
