import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const fixturesDir = path.join(projectRoot, "test-fixtures", "pdf-compression");
const resultsDir = path.join(fixturesDir, "results");
const outputPath = path.join(resultsDir, "compression-decision-report.md");

function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

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

function bestRowsByFile(rows) {
  const grouped = new Map();

  for (const row of rows) {
    const group = grouped.get(row.fileName) ?? [];
    group.push(row);
    grouped.set(row.fileName, group);
  }

  return [...grouped.entries()].map(([fileName, fileRows]) => {
    const comparableRows = fileRows.filter((row) => row.compressedBytes > 0);
    const best = comparableRows.reduce((winner, current) =>
      current.compressedBytes < winner.compressedBytes ? current : winner
    );

    return { fileName, best };
  });
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

function parseSampleCoverage(markdown) {
  const requiredMatch = markdown.match(/- Required real samples: (\d+)/);
  const coveredMatch = markdown.match(/- Covered real samples: (\d+)/);
  const missingMatch = markdown.match(/- Missing real samples: (\d+)/);

  if (!requiredMatch || !coveredMatch || !missingMatch) {
    return null;
  }

  return {
    required: Number(requiredMatch[1]),
    covered: Number(coveredMatch[1]),
    missing: Number(missingMatch[1])
  };
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

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell).replaceAll("|", "\\|")).join(" | ")} |`)
  ].join("\n");
}

async function main() {
  await mkdir(resultsDir, { recursive: true });

  const nodePath = await latestFile("compression-benchmark-", ".json");
  const browserPath = await latestFile("browser-compression-benchmark-suite-", ".md");
  const externalPath = await latestFile("external-compressor-benchmark-", ".json");
  const sampleCoveragePath = path.join(resultsDir, "sample-coverage-report.md");
  const qualityReviewPath = path.join(resultsDir, "quality-review-template.md");

  const nodeRows = nodePath ? JSON.parse(await readFile(nodePath, "utf8")) : [];
  const browserMarkdown = browserPath ? await readFile(browserPath, "utf8") : "";
  const browserRows = browserMarkdown ? parseBrowserSummary(browserMarkdown) : [];
  const externalRows = externalPath ? JSON.parse(await readFile(externalPath, "utf8")) : [];
  const sampleCoverageMarkdown = await readFile(sampleCoveragePath, "utf8").catch(() => "");
  const sampleCoverage = sampleCoverageMarkdown ? parseSampleCoverage(sampleCoverageMarkdown) : null;
  const qualityReviewMarkdown = await readFile(qualityReviewPath, "utf8").catch(() => "");
  const nodeBestRows = nodeRows.length ? bestRowsByFile(nodeRows) : [];
  const externalSuccessRows = externalRows.filter((row) => row.status === "success");
  const externalSkippedRows = externalRows.filter((row) => row.status === "skipped");
  const missingCommands = [...new Set(externalSkippedRows.map((row) => row.command))].sort();
  const strongBrowserRows = browserRows.filter((row) => {
    const reduction = Number.parseFloat(row.scannedReduction);
    return row.bestMode === "Scanned PDF" && Number.isFinite(reduction) && reduction >= 50;
  });
  const weakOfficeRows = browserRows.filter((row) => {
    const reduction = Number.parseFloat(row.bestReduction);
    return row.bestMode !== "Scanned PDF" && Number.isFinite(reduction) && reduction <= 2;
  });
  const browserRealRows = browserRows.filter((row) => row.sampleKind === "real");

  const decision = [];

  if (strongBrowserRows.length > 0) {
    decision.push(
      `- Keep and foreground the browser Scanned PDF path: ${strongBrowserRows.length} fixture(s) show 50%+ reduction.`
    );
  }

  if (weakOfficeRows.length > 0) {
    decision.push(
      `- Do not over-optimize clean office PDFs right now: ${weakOfficeRows.length} fixture(s) only shrink about 1%-2%, which is expected for already-small documents.`
    );
  }

  if (externalSuccessRows.length === 0) {
    decision.push(
      "- External compressor decision is still pending: qpdf/pdfcpu/Ghostscript produced no real results in the current environment."
    );
  }

  if (sampleCoverage && sampleCoverage.missing > 0) {
    decision.push(
      `- Real sample coverage is incomplete: ${sampleCoverage.covered}/${sampleCoverage.required} required real samples are present.`
    );
  }

  if (browserRows.length > 0 && browserRealRows.length === 0) {
    decision.push(
      "- Browser scanned-path evidence currently comes from synthetic fixtures only; rerun the browser suite after importing real PDFs."
    );
  }

  decision.push(
    "- Next highest-value evidence is real PDF samples with manual readability checks, especially resume, scanned form, invoice/table, and large upload PDFs."
  );

  if (qualityReviewMarkdown && qualityReviewMarkdown.includes("TBD")) {
    decision.push(
      "- Manual quality review is still pending: readability and submit-safety columns contain TBD values."
    );
  }

  const markdown = [
    "# Compression Decision Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Source Reports",
    "",
    `- Node pdf-lib benchmark: ${nodePath ? path.relative(projectRoot, nodePath) : "missing"}`,
    `- Browser benchmark suite: ${browserPath ? path.relative(projectRoot, browserPath) : "missing"}`,
    `- External compressor benchmark: ${externalPath ? path.relative(projectRoot, externalPath) : "missing"}`,
    `- Real sample coverage: ${sampleCoverageMarkdown ? path.relative(projectRoot, sampleCoveragePath) : "missing"}`,
    `- Quality review template: ${qualityReviewMarkdown ? path.relative(projectRoot, qualityReviewPath) : "missing"}`,
    "",
    "## Current Decision",
    "",
    ...decision,
    "",
    "## Browser Scanned Path Summary",
    "",
    browserRows.length
      ? markdownTable(
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
          browserRows.map((row) => [
            row.fileName,
            row.sampleKind,
            row.bestMode,
            row.before,
            row.bestAfter,
            row.bestReduction,
            row.scannedAfter,
            row.scannedReduction,
            row.scannedDetails,
            row.note || "-"
          ])
        )
      : "No browser benchmark suite found.",
    "",
    "## Node pdf-lib Baseline Best Results",
    "",
    nodeBestRows.length
      ? markdownTable(
          ["File", "Type", "Best mode", "Original", "Compressed", "Reduction", "Profile"],
          nodeBestRows.map(({ fileName, best }) => [
            fileName,
            best.sampleKind ?? inferSampleKind(fileName),
            best.label,
            formatBytes(best.originalBytes),
            formatBytes(best.compressedBytes),
            `${best.reductionPercent}%`,
            best.profile
          ])
        )
      : "No Node baseline found.",
    "",
    "## External Compressor Status",
    "",
    externalSuccessRows.length
      ? markdownTable(
          ["File", "Type", "Engine", "Original", "Compressed", "Reduction"],
          bestRowsByFile(externalSuccessRows).map(({ fileName, best }) => [
            fileName,
            best.sampleKind ?? inferSampleKind(fileName),
            best.label,
            formatBytes(best.originalBytes),
            formatBytes(best.compressedBytes),
            `${best.reductionPercent}%`
          ])
        )
      : `No successful external compressor result yet. Missing commands: ${missingCommands.length ? missingCommands.join(", ") : "unknown"}.`,
    "",
    "## Real Sample Coverage",
    "",
    sampleCoverage
      ? `Required real samples: ${sampleCoverage.required}. Covered: ${sampleCoverage.covered}. Missing: ${sampleCoverage.missing}.`
      : "No sample coverage report found. Run `npm run samples:check` first.",
    "",
    "## Quality Review Status",
    "",
    qualityReviewMarkdown
      ? qualityReviewMarkdown.includes("TBD")
        ? "Manual quality review is pending. Fill `Readable?`, `Submit-safe?`, and `Notes` in `quality-review-template.md`."
        : "Manual quality review has no TBD values in the current template."
      : "No quality review template found. Run `npm run benchmark:quality-review` first.",
    "",
    "## Next Actions",
    "",
    "- Create the real-sample handoff folder with `npm run samples:intake-kit`.",
    "- Add reviewed non-sensitive PDFs listed in `test-fixtures/pdf-compression/真实样本采集清单.md` to `test-fixtures/pdf-compression/results/real-sample-intake-kit/`.",
    "- Dry-run and import with `npm run samples:import -- --source-dir test-fixtures/pdf-compression/results/real-sample-intake-kit --dry-run`.",
    "- Rerun `npm run benchmark:compression` and browser `/dev/compression-benchmark` after adding real samples.",
    "- Run `npm run benchmark:quality-review` and complete manual readability checks.",
    "- Install or attach one external engine and rerun `npm run benchmark:external-compressors`.",
    "- Re-run `npm run benchmark:decision` to update this report.",
    ""
  ].join("\n");

  await writeFile(outputPath, markdown);

  console.log(`Wrote ${path.relative(projectRoot, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
