import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const fixturesDir = path.join(projectRoot, "test-fixtures", "pdf-compression");
const manifestPath = path.join(fixturesDir, "sample-manifest.json");
const defaultOutputDir = path.join(fixturesDir, "results", "real-sample-intake-kit");

function usage() {
  return [
    "Usage:",
    "  npm run samples:intake-kit",
    "  npm run samples:intake-kit -- --output /path/to/intake-kit",
    "",
    "Options:",
    "  --output <dir>  Directory where README and slot checklist should be written",
    "  --force         Overwrite README/checklist files in the output directory"
  ].join("\n");
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell).replaceAll("|", "\\|")).join(" | ")} |`)
  ].join("\n");
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function csvTable(headers, rows) {
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => row.map(csvCell).join(","))
  ].join("\n");
}

async function writeText(filePath, content, force) {
  try {
    if (!force) {
      await readFile(filePath, "utf8");
      return {
        path: filePath,
        status: "kept"
      };
    }
  } catch {
    // File does not exist; write it.
  }

  await writeFile(filePath, content);

  return {
    path: filePath,
    status: "written"
  };
}

async function main() {
  const { values } = parseArgs({
    options: {
      output: { type: "string" },
      force: { type: "boolean", default: false },
      help: { type: "boolean", default: false }
    }
  });

  if (values.help) {
    console.log(usage());
    return;
  }

  const outputDir = path.resolve(process.cwd(), values.output ?? defaultOutputDir);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const requiredSamples = manifest.requiredRealSamples ?? [];
  const readme = [
    "# FileSmaller Real PDF Sample Intake Kit",
    "",
    "Put non-sensitive PDFs in this folder and rename them to the exact slot filenames below.",
    "",
    "Do not include raw ID cards, bank statements, medical records, private contracts, or any PDF that cannot be safely used for compression testing.",
    "",
    "## Required Slots",
    "",
    markdownTable(
      ["File name", "Type", "Goal", "Review focus"],
      requiredSamples.map((sample) => [
        sample.fileName,
        sample.type,
        sample.goal,
        sample.reviewFocus
      ])
    ),
    "",
    "## Workflow",
    "",
    "1. Copy reviewed non-sensitive PDFs into this folder.",
    "2. Rename each PDF to one of the required slot filenames.",
    "3. Run a dry run from the project root:",
    "",
    "```bash",
    `npm run samples:import -- --source-dir ${path.relative(projectRoot, outputDir) || "."} --dry-run`,
    "```",
    "",
    "4. If the dry run is clean, import the samples:",
    "",
    "```bash",
    `npm run samples:import -- --source-dir ${path.relative(projectRoot, outputDir) || "."}`,
    "```",
    "",
    "5. Refresh the evidence chain:",
    "",
    "```bash",
    "npm run benchmark:pipeline",
    "```",
    "",
    "## Privacy Checks",
    "",
    "The importer checks PDF headers plus metadata and filename risk patterns. It does not OCR page content. Manually inspect every PDF before importing it.",
    "",
    "If metadata risk is reported, sanitize first:",
    "",
    "```bash",
    "npm run samples:sanitize -- --source /path/to/source.pdf --output /path/to/sanitized.pdf",
    "```",
    ""
  ].join("\n");
  const checklist = [
    "# Intake Checklist",
    "",
    ...requiredSamples.flatMap((sample) => [
      `## ${sample.fileName}`,
      "",
      `- Type: ${sample.type}`,
      `- Goal: ${sample.goal}`,
      `- Review focus: ${sample.reviewFocus}`,
      "- Source reviewed as non-sensitive: [ ]",
      "- Metadata privacy precheck done: [ ]",
      "- Page content manually checked: [ ]",
      "- Ready to import: [ ]",
      ""
    ])
  ].join("\n");
  const handoff = [
    "# Real PDF Sample Handoff",
    "",
    "This folder is for collecting non-sensitive PDF samples that represent real FileSmaller user workflows.",
    "",
    "## What to do",
    "",
    "1. Find or create non-sensitive PDFs for each slot in `SAMPLE-SLOTS.csv`.",
    "2. Rename every PDF to the exact `fileName` value.",
    "3. Manually inspect visible page content before import.",
    "4. Mark review status in `CHECKLIST.md`.",
    "5. Send the filled folder back or import it from the project root.",
    "",
    "## Rules",
    "",
    "- Do not use raw ID cards, bank statements, medical records, private contracts, or private customer files.",
    "- Prefer public sample PDFs, recreated documents, exported test documents, or manually redacted files.",
    "- Keep the original sensitive source outside this folder.",
    "- Do not commit this folder or collected PDFs to git.",
    "",
    "## Import command",
    "",
    "```bash",
    `npm run samples:import -- --source-dir ${path.relative(projectRoot, outputDir) || "."} --dry-run`,
    "```",
    "",
    "After a clean dry run:",
    "",
    "```bash",
    `npm run samples:import -- --source-dir ${path.relative(projectRoot, outputDir) || "."}`,
    "npm run benchmark:pipeline",
    "npm run project:status",
    "```",
    ""
  ].join("\n");
  const csv = `${csvTable(
    ["fileName", "type", "goal", "reviewFocus", "sourceReviewed", "metadataChecked", "pageContentChecked", "readyToImport"],
    requiredSamples.map((sample) => [
      sample.fileName,
      sample.type,
      sample.goal,
      sample.reviewFocus,
      "no",
      "no",
      "no",
      "no"
    ])
  )}\n`;

  await mkdir(outputDir, { recursive: true });

  const writes = [
    await writeText(path.join(outputDir, "HANDOFF.md"), handoff, values.force),
    await writeText(path.join(outputDir, "README.md"), readme, values.force),
    await writeText(path.join(outputDir, "CHECKLIST.md"), checklist, values.force),
    await writeText(path.join(outputDir, "SAMPLE-SLOTS.csv"), csv, values.force)
  ];

  console.log(`Created real sample intake kit: ${path.relative(projectRoot, outputDir)}`);
  for (const item of writes) {
    console.log(`- ${path.relative(projectRoot, item.path)} (${item.status})`);
  }
  console.log("");
  console.log(`Next: npm run samples:import -- --source-dir ${path.relative(projectRoot, outputDir)} --dry-run`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
