import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const fixturesDir = path.join(projectRoot, "test-fixtures", "pdf-compression");
const resultsDir = path.join(fixturesDir, "results");
const markdownPath = path.join(resultsDir, "compression-decision-gate.md");
const jsonPath = path.join(resultsDir, "compression-decision-gate.json");

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

function parseSampleCoverage(markdown) {
  const requiredMatch = markdown.match(/- Required real samples: (\d+)/);
  const coveredMatch = markdown.match(/- Covered real samples: (\d+)/);
  const missingMatch = markdown.match(/- Missing real samples: (\d+)/);

  if (!requiredMatch || !coveredMatch || !missingMatch) {
    return {
      required: 0,
      covered: 0,
      missing: 0,
      found: false
    };
  }

  return {
    required: Number(requiredMatch[1]),
    covered: Number(coveredMatch[1]),
    missing: Number(missingMatch[1]),
    found: true
  };
}

function parseBrowserRows(markdown) {
  const lines = markdown.split("\n");
  const summaryStart = lines.findIndex((line) => line.trim() === "## Summary");

  if (summaryStart === -1) {
    return [];
  }

  let headers = [];
  const rows = [];

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

    const values = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    const fileName = values.File ?? "";
    const sampleKind = values.Type || (fileName.startsWith("real-") ? "real" : fileName.startsWith("sample-") ? "synthetic" : "unknown");
    const bestReduction = Number.parseFloat(values["Best reduction"] ?? "");
    const scannedReduction = Number.parseFloat(values["Scanned reduction"] ?? "");

    rows.push({
      fileName,
      sampleKind,
      bestMode: values["Best mode"] ?? "",
      bestReduction: Number.isFinite(bestReduction) ? bestReduction : null,
      scannedReduction: Number.isFinite(scannedReduction) ? scannedReduction : null
    });
  }

  return rows;
}

function parseManualQuality(markdown) {
  const hasTbd = markdown.includes("| TBD |") || markdown.includes("TBD");
  const yesRows = markdown
    .split("\n")
    .filter((line) => line.startsWith("| real-") && /\|\s*yes\s*\|\s*yes\s*\|/i.test(line));

  return {
    found: Boolean(markdown),
    hasTbd,
    realSubmitSafeRows: yesRows.length
  };
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

  const sampleCoveragePath = path.join(resultsDir, "sample-coverage-report.md");
  const qualityReviewPath = path.join(resultsDir, "quality-review-template.md");
  const externalPath = await latestFile("external-compressor-benchmark-", ".json");
  const browserPath = await latestFile("browser-compression-benchmark-suite-", ".md");
  const sampleCoverageMarkdown = await readFile(sampleCoveragePath, "utf8").catch(() => "");
  const qualityReviewMarkdown = await readFile(qualityReviewPath, "utf8").catch(() => "");
  const externalRows = externalPath ? JSON.parse(await readFile(externalPath, "utf8")) : [];
  const browserMarkdown = browserPath ? await readFile(browserPath, "utf8") : "";
  const sampleCoverage = parseSampleCoverage(sampleCoverageMarkdown);
  const quality = parseManualQuality(qualityReviewMarkdown);
  const browserRows = browserMarkdown ? parseBrowserRows(browserMarkdown) : [];
  const browserRealRows = browserRows.filter((row) => row.sampleKind === "real");
  const externalSuccessRows = externalRows.filter((row) => row.status === "success");
  const externalRealSuccessRows = externalSuccessRows.filter(
    (row) => (row.sampleKind ?? (row.fileName?.startsWith("real-") ? "real" : "unknown")) === "real"
  );
  const checks = [
    {
      id: "real-sample-coverage",
      required: "All required real PDF samples are present.",
      status: sampleCoverage.found && sampleCoverage.missing === 0 ? "pass" : "blocked",
      evidence: sampleCoverage.found
        ? `${sampleCoverage.covered}/${sampleCoverage.required} covered, ${sampleCoverage.missing} missing`
        : "sample-coverage-report.md missing or unparsable"
    },
    {
      id: "browser-real-suite",
      required: "Browser benchmark suite includes real PDF rows.",
      status: browserRealRows.length > 0 ? "pass" : "blocked",
      evidence: `${browserRealRows.length} real browser benchmark row(s), ${browserRows.length} total row(s)`
    },
    {
      id: "manual-quality-review",
      required: "Manual quality review has submit-safe real rows and no TBD values.",
      status: quality.found && !quality.hasTbd && quality.realSubmitSafeRows > 0 ? "pass" : "blocked",
      evidence: quality.found
        ? `${quality.realSubmitSafeRows} real submit-safe row(s), TBD present: ${quality.hasTbd ? "yes" : "no"}`
        : "quality-review-template.md missing"
    },
    {
      id: "external-engine-results",
      required: "At least one external compressor has successful real-sample results.",
      status: externalRealSuccessRows.length > 0 ? "pass" : "blocked",
      evidence: `${externalRealSuccessRows.length} successful real external row(s), ${externalSuccessRows.length} successful total external row(s)`
    }
  ];
  const passed = checks.filter((check) => check.status === "pass").length;
  const blocked = checks.length - passed;
  const gateStatus = blocked === 0 ? "PASS" : "BLOCKED";
  const report = {
    generatedAt: new Date().toISOString(),
    gateStatus,
    passed,
    blocked,
    checks,
    sourceReports: {
      sampleCoverage: sampleCoverageMarkdown ? path.relative(projectRoot, sampleCoveragePath) : null,
      browserSuite: browserPath ? path.relative(projectRoot, browserPath) : null,
      qualityReview: qualityReviewMarkdown ? path.relative(projectRoot, qualityReviewPath) : null,
      externalBenchmark: externalPath ? path.relative(projectRoot, externalPath) : null
    }
  };
  const markdown = [
    "# Compression Decision Gate",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Gate status: ${gateStatus}`,
    "",
    "This gate prevents choosing a production strong-compression engine from weak evidence. `BLOCKED` is expected until real samples, manual quality review, and external-engine results exist.",
    "",
    "## Checks",
    "",
    markdownTable(
      ["Status", "Check", "Requirement", "Evidence"],
      checks.map((check) => [
        check.status,
        check.id,
        check.required,
        check.evidence
      ])
    ),
    "",
    "## Source Reports",
    "",
    `- Sample coverage: ${report.sourceReports.sampleCoverage ?? "missing"}`,
    `- Browser suite: ${report.sourceReports.browserSuite ?? "missing"}`,
    `- Quality review: ${report.sourceReports.qualityReview ?? "missing"}`,
    `- External benchmark: ${report.sourceReports.externalBenchmark ?? "missing"}`,
    "",
    "## Next Actions",
    "",
    "- Create a real-sample handoff folder with `npm run samples:intake-kit`.",
    "- Put reviewed non-sensitive PDFs in `test-fixtures/pdf-compression/results/real-sample-intake-kit/` and dry-run `npm run samples:import -- --source-dir test-fixtures/pdf-compression/results/real-sample-intake-kit --dry-run`.",
    "- Run the browser benchmark suite and export Markdown after importing real PDFs.",
    "- Fill `Readable?` and `Submit-safe?` in `quality-review-template.md`.",
    "- Install or attach qpdf, pdfcpu, or Ghostscript and rerun the external benchmark.",
    ""
  ].join("\n");

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markdownPath, markdown);

  console.log(`Compression decision gate: ${gateStatus} (${passed}/${checks.length} passed)`);
  console.log(`Wrote ${path.relative(projectRoot, jsonPath)}`);
  console.log(`Wrote ${path.relative(projectRoot, markdownPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
