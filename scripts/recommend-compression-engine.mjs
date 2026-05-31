import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const resultsDir = path.join(projectRoot, "test-fixtures", "pdf-compression", "results");
const markdownPath = path.join(resultsDir, "compression-engine-recommendation.md");
const jsonPath = path.join(resultsDir, "compression-engine-recommendation.json");

const enginePolicy = {
  "qpdf-object-streams": {
    family: "qpdf",
    productionRisk: "low",
    priority: 1,
    role: "Structure optimization candidate for clean and mixed PDFs."
  },
  "qpdf-linearize": {
    family: "qpdf",
    productionRisk: "low",
    priority: 1,
    role: "Linearized structure optimization candidate."
  },
  "pdfcpu-optimize": {
    family: "pdfcpu",
    productionRisk: "medium",
    priority: 2,
    role: "Server-side optimize candidate."
  },
  "ghostscript-screen": {
    family: "ghostscript",
    productionRisk: "high",
    priority: 3,
    role: "Aggressive scanned/image-heavy comparison; not a default production pick before license and quality review."
  },
  "ghostscript-ebook": {
    family: "ghostscript",
    productionRisk: "high",
    priority: 3,
    role: "Aggressive scanned/image-heavy comparison; not a default production pick before license and quality review."
  }
};

async function latestFile(prefix, extension) {
  const files = (await readdir(resultsDir))
    .filter((fileName) => fileName.startsWith(prefix) && fileName.endsWith(extension))
    .sort((a, b) => b.localeCompare(a));

  return files[0] ? path.join(resultsDir, files[0]) : null;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function formatMs(ms) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return "-";
  }

  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }

  return `${Math.round(ms)}ms`;
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell).replaceAll("|", "\\|")).join(" | ")} |`)
  ].join("\n");
}

function scoreEngine(summary) {
  const riskPenalty = {
    low: 0,
    medium: 8,
    high: 24
  }[summary.productionRisk] ?? 12;
  const priorityPenalty = summary.priority * 2;
  const realCoverageBonus = summary.realRows > 0 ? 20 : 0;
  const syntheticOnlyPenalty = summary.realRows > 0 ? 0 : 18;

  return Number(
    (
      summary.successRate * 35 +
      Math.max(0, summary.averageReductionPercent) * 1.2 +
      realCoverageBonus -
      riskPenalty -
      priorityPenalty -
      syntheticOnlyPenalty
    ).toFixed(2)
  );
}

function summarizeEngineRows(rows) {
  const grouped = new Map();

  for (const row of rows) {
    const group = grouped.get(row.engine) ?? [];
    group.push(row);
    grouped.set(row.engine, group);
  }

  return [...grouped.entries()].map(([engine, engineRows]) => {
    const policy = enginePolicy[engine] ?? {
      family: engine,
      productionRisk: "unknown",
      priority: 9,
      role: "Unclassified external compressor candidate."
    };
    const successfulRows = engineRows.filter((row) => row.status === "success");
    const realRows = engineRows.filter((row) => row.sampleKind === "real");
    const realSuccessRows = successfulRows.filter((row) => row.sampleKind === "real");
    const comparableRows = realSuccessRows.length ? realSuccessRows : successfulRows;
    const averageReductionPercent = comparableRows.length
      ? comparableRows.reduce((sum, row) => sum + Number(row.reductionPercent ?? 0), 0) / comparableRows.length
      : 0;
    const averageElapsedMs = comparableRows.length
      ? comparableRows.reduce((sum, row) => sum + Number(row.elapsedMs ?? 0), 0) / comparableRows.length
      : 0;
    const successRate = engineRows.length ? successfulRows.length / engineRows.length : 0;
    const summary = {
      engine,
      label: engineRows[0]?.label ?? engine,
      family: policy.family,
      role: policy.role,
      productionRisk: policy.productionRisk,
      priority: policy.priority,
      rows: engineRows.length,
      successRows: successfulRows.length,
      realRows: realRows.length,
      realSuccessRows: realSuccessRows.length,
      successRate,
      averageReductionPercent: Number(averageReductionPercent.toFixed(1)),
      averageElapsedMs: Math.round(averageElapsedMs)
    };

    return {
      ...summary,
      score: scoreEngine(summary)
    };
  });
}

function chooseRecommendation(summaries) {
  const realReady = summaries.filter((item) => item.realSuccessRows > 0);

  if (!realReady.length) {
    return {
      status: "BLOCKED",
      engine: null,
      reason: "No external engine has successful real-sample results yet."
    };
  }

  const candidates = realReady
    .filter((item) => item.productionRisk !== "high")
    .sort((a, b) => b.score - a.score || a.priority - b.priority);

  if (candidates.length) {
    const winner = candidates[0];

    return {
      status: "RECOMMENDED",
      engine: winner.engine,
      family: winner.family,
      reason: `${winner.label} has real-sample results without high production risk.`
    };
  }

  const comparisonOnly = realReady.sort((a, b) => b.score - a.score || a.priority - b.priority)[0];

  return {
    status: "COMPARISON_ONLY",
    engine: comparisonOnly.engine,
    family: comparisonOnly.family,
    reason: `${comparisonOnly.label} has real-sample results, but current policy marks it as high production risk.`
  };
}

async function main() {
  await mkdir(resultsDir, { recursive: true });

  const externalPath = await latestFile("external-compressor-benchmark-", ".json");
  const setupPath = path.join(resultsDir, "external-compressor-setup.json");
  const externalRows = externalPath ? await readJson(externalPath, []) : [];
  const setup = await readJson(setupPath, null);
  const summaries = summarizeEngineRows(externalRows).sort(
    (a, b) => b.score - a.score || a.priority - b.priority
  );
  const recommendation = chooseRecommendation(summaries);
  const report = {
    generatedAt: new Date().toISOString(),
    sourceReports: {
      externalBenchmark: externalPath ? path.relative(projectRoot, externalPath) : null,
      externalSetup: setup ? path.relative(projectRoot, setupPath) : null
    },
    setup: setup
      ? {
          ready: setup.ready,
          availableCount: setup.availableCount,
          missingCount: setup.missingCount
        }
      : null,
    recommendation,
    engineSummaries: summaries,
    policy: {
      defaultPreference: "Prefer qpdf/qpdf-wasm first, then pdfcpu, and keep Ghostscript as comparison-only until license/deployment review.",
      gate: "Do not choose a production external engine until real samples, browser suite, manual quality review, and external real-sample results exist."
    }
  };
  const markdown = [
    "# Compression Engine Recommendation",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Status: ${recommendation.status}`,
    recommendation.engine ? `Recommended engine: ${recommendation.engine}` : "Recommended engine: none",
    `Reason: ${recommendation.reason}`,
    "",
    "## Policy",
    "",
    `- ${report.policy.defaultPreference}`,
    `- ${report.policy.gate}`,
    "",
    "## Source Reports",
    "",
    `- External setup: ${report.sourceReports.externalSetup ?? "missing"}`,
    `- External benchmark: ${report.sourceReports.externalBenchmark ?? "missing"}`,
    "",
    "## Engine Scores",
    "",
    summaries.length
      ? markdownTable(
          [
            "Engine",
            "Family",
            "Risk",
            "Rows",
            "Real success",
            "Success rate",
            "Avg reduction",
            "Avg time",
            "Score",
            "Role"
          ],
          summaries.map((item) => [
            item.label,
            item.family,
            item.productionRisk,
            `${item.successRows}/${item.rows}`,
            `${item.realSuccessRows}/${item.realRows}`,
            `${Math.round(item.successRate * 100)}%`,
            `${item.averageReductionPercent}%`,
            formatMs(item.averageElapsedMs),
            item.score,
            item.role
          ])
        )
      : "No external benchmark rows found.",
    "",
    "## Next Actions",
    "",
    "- Create a real-sample handoff folder with `npm run samples:intake-kit`.",
    "- Add reviewed non-sensitive PDFs and dry-run `npm run samples:import -- --source-dir test-fixtures/pdf-compression/results/real-sample-intake-kit --dry-run` before treating any score as production evidence.",
    "- Configure at least one engine with PATH or `QPDF_BIN / PDFCPU_BIN / GS_BIN`.",
    "- Rerun `npm run benchmark:pipeline` after real samples and external engines are available.",
    "- Use `npm run benchmark:decision-gate` as the final stop before implementation.",
    ""
  ].join("\n");

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markdownPath, markdown);

  console.log(`Compression engine recommendation: ${recommendation.status}`);
  console.log(`Recommended engine: ${recommendation.engine ?? "none"}`);
  console.log(`Wrote ${path.relative(projectRoot, jsonPath)}`);
  console.log(`Wrote ${path.relative(projectRoot, markdownPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
