import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const resultsDir = path.join(projectRoot, "test-fixtures", "pdf-compression", "results");
const markdownPath = path.join(resultsDir, "compression-project-status.md");
const jsonPath = path.join(resultsDir, "compression-project-status.json");

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

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function readText(filePath, fallback = "") {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return fallback;
  }
}

function parseSampleCoverage(markdown) {
  const requiredMatch = markdown.match(/- Required real samples: (\d+)/);
  const coveredMatch = markdown.match(/- Covered real samples: (\d+)/);
  const missingMatch = markdown.match(/- Missing real samples: (\d+)/);
  const syntheticMatch = markdown.match(/- Synthetic samples present: (\d+)/);

  return {
    required: requiredMatch ? Number(requiredMatch[1]) : 0,
    covered: coveredMatch ? Number(coveredMatch[1]) : 0,
    missing: missingMatch ? Number(missingMatch[1]) : 0,
    synthetic: syntheticMatch ? Number(syntheticMatch[1]) : 0
  };
}

function parseMissingCommands(markdown) {
  const match = markdown.match(/Missing commands: ([^.]+)\./);

  if (!match) {
    return [];
  }

  return match[1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
  const browserSuiteCheckPath = path.join(resultsDir, "browser-benchmark-suite-check.json");
  const decisionGatePath = path.join(resultsDir, "compression-decision-gate.json");
  const decisionReportPath = path.join(resultsDir, "compression-decision-report.md");
  const engineRecommendationPath = path.join(resultsDir, "compression-engine-recommendation.json");
  const qualityReviewPath = path.join(resultsDir, "quality-review-template.md");
  const externalSetupPath = path.join(resultsDir, "external-compressor-setup.json");
  const nodeBenchmarkPath = await latestFile("compression-benchmark-", ".json");
  const externalBenchmarkPath = await latestFile("external-compressor-benchmark-", ".json");
  const browserSuitePath = await latestFile("browser-compression-benchmark-suite-", ".md");
  const sampleCoverage = parseSampleCoverage(await readText(sampleCoveragePath));
  const browserSuiteCheck = await readJson(browserSuiteCheckPath, null);
  const decisionGate = await readJson(decisionGatePath, null);
  const engineRecommendation = await readJson(engineRecommendationPath, null);
  const decisionReport = await readText(decisionReportPath);
  const qualityReview = await readText(qualityReviewPath);
  const externalSetup = await readJson(externalSetupPath, null);
  const nodeRows = nodeBenchmarkPath ? await readJson(nodeBenchmarkPath, []) : [];
  const externalRows = externalBenchmarkPath ? await readJson(externalBenchmarkPath, []) : [];
  const externalSuccessRows = externalRows.filter((row) => row.status === "success");
  const realExternalSuccessRows = externalSuccessRows.filter((row) => row.sampleKind === "real");
  const missingCommands = parseMissingCommands(decisionReport);
  const status = {
    generatedAt: new Date().toISOString(),
    sampleCoverage,
    browserSuite: {
      status: browserSuiteCheck?.status ?? "missing",
      path: browserSuitePath ? path.relative(projectRoot, browserSuitePath) : null
    },
    decisionGate: {
      status: decisionGate?.gateStatus ?? "missing",
      passed: decisionGate?.passed ?? 0,
      blocked: decisionGate?.blocked ?? 0,
      checks: decisionGate?.checks ?? []
    },
    engineRecommendation: {
      status: engineRecommendation?.recommendation?.status ?? "missing",
      engine: engineRecommendation?.recommendation?.engine ?? null,
      path: engineRecommendation ? path.relative(projectRoot, engineRecommendationPath) : null
    },
    nodeBenchmark: {
      path: nodeBenchmarkPath ? path.relative(projectRoot, nodeBenchmarkPath) : null,
      rows: nodeRows.length,
      realRows: nodeRows.filter((row) => row.sampleKind === "real").length,
      syntheticRows: nodeRows.filter((row) => row.sampleKind === "synthetic").length
    },
    externalBenchmark: {
      path: externalBenchmarkPath ? path.relative(projectRoot, externalBenchmarkPath) : null,
      rows: externalRows.length,
      successRows: externalSuccessRows.length,
      realSuccessRows: realExternalSuccessRows.length,
      missingCommands
    },
    externalSetup: {
      path: externalSetup ? path.relative(projectRoot, externalSetupPath) : null,
      ready: externalSetup?.ready ?? false,
      availableCount: externalSetup?.availableCount ?? 0,
      missingCount: externalSetup?.missingCount ?? 0,
      tools: externalSetup?.tools ?? []
    },
    qualityReview: {
      path: qualityReview ? path.relative(projectRoot, qualityReviewPath) : null,
      hasTbd: qualityReview.includes("TBD")
    }
  };
  const blockers = [
    sampleCoverage.missing > 0
      ? `Real samples incomplete: ${sampleCoverage.covered}/${sampleCoverage.required} covered.`
      : "",
    status.browserSuite.status !== "PASS"
      ? `Browser suite format is ${status.browserSuite.status}.`
      : "",
    status.decisionGate.status !== "PASS"
      ? `Decision gate is ${status.decisionGate.status}.`
      : "",
    status.engineRecommendation.status !== "RECOMMENDED"
      ? `Engine recommendation is ${status.engineRecommendation.status}.`
      : "",
    status.externalBenchmark.realSuccessRows === 0
      ? "No successful real-sample external compressor results."
      : "",
    !status.externalSetup.ready ? "No external compressor command is currently available." : "",
    status.qualityReview.hasTbd ? "Manual quality review still contains TBD values." : ""
  ].filter(Boolean);
  const nextActions = [
    "Create a real-sample handoff folder with `npm run samples:intake-kit`.",
    "Batch import renamed real PDFs with `npm run samples:import -- --source-dir test-fixtures/pdf-compression/results/real-sample-intake-kit --dry-run` before removing `--dry-run`.",
    "Run `/dev/compression-benchmark`, then click `Save suite files`.",
    "Run `npm run benchmark:pipeline`.",
    "Fill `Readable?` and `Submit-safe?` in `quality-review-template.md`.",
    "Install or attach qpdf, pdfcpu, or Ghostscript before choosing an external engine."
  ];
  const markdown = [
    "# Compression Project Status",
    "",
    `Generated: ${status.generatedAt}`,
    "",
    "## Snapshot",
    "",
    markdownTable(
      ["Area", "Status"],
      [
        ["Real samples", `${sampleCoverage.covered}/${sampleCoverage.required} covered, ${sampleCoverage.missing} missing`],
        ["Synthetic samples", String(sampleCoverage.synthetic)],
        ["Browser suite", `${status.browserSuite.status} (${status.browserSuite.path ?? "missing"})`],
        ["Decision gate", `${status.decisionGate.status} (${status.decisionGate.passed}/${status.decisionGate.passed + status.decisionGate.blocked} passed)`],
        ["Engine recommendation", `${status.engineRecommendation.status} (${status.engineRecommendation.engine ?? "none"})`],
        ["Node benchmark", `${status.nodeBenchmark.rows} row(s), ${status.nodeBenchmark.realRows} real`],
        ["External benchmark", `${status.externalBenchmark.successRows} success row(s), ${status.externalBenchmark.realSuccessRows} real success`],
        ["External setup", `${status.externalSetup.availableCount}/3 available (${status.externalSetup.path ?? "missing"})`],
        ["External commands missing", status.externalBenchmark.missingCommands.length ? status.externalBenchmark.missingCommands.join(", ") : "none detected"],
        ["Quality review", status.qualityReview.hasTbd ? "TBD present" : "No TBD detected"]
      ]
    ),
    "",
    "## Blockers",
    "",
    blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None. Gate can be reviewed for completion.",
    "",
    "## Source Reports",
    "",
    `- Sample coverage: ${path.relative(projectRoot, sampleCoveragePath)}`,
    `- Browser suite: ${status.browserSuite.path ?? "missing"}`,
    `- Engine recommendation: ${status.engineRecommendation.path ?? "missing"}`,
    `- Node benchmark: ${status.nodeBenchmark.path ?? "missing"}`,
    `- External setup: ${status.externalSetup.path ?? "missing"}`,
    `- External benchmark: ${status.externalBenchmark.path ?? "missing"}`,
    `- Quality review: ${status.qualityReview.path ?? "missing"}`,
    `- Decision gate: ${path.relative(projectRoot, decisionGatePath)}`,
    "",
    "## Next Actions",
    "",
    ...nextActions.map((item) => `- ${item}`),
    ""
  ].join("\n");

  await writeFile(jsonPath, `${JSON.stringify({ ...status, blockers, nextActions }, null, 2)}\n`);
  await writeFile(markdownPath, markdown);

  console.log(`Compression project status: ${status.decisionGate.status}`);
  console.log(`Real samples: ${sampleCoverage.covered}/${sampleCoverage.required}`);
  console.log(`Browser suite: ${status.browserSuite.status}`);
  console.log(`Wrote ${path.relative(projectRoot, jsonPath)}`);
  console.log(`Wrote ${path.relative(projectRoot, markdownPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
