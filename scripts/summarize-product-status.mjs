import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const resultsDir = path.join(projectRoot, "test-fixtures", "pdf-compression", "results");
const jsonPath = path.join(resultsDir, "product-status.json");
const markdownPath = path.join(resultsDir, "product-status.md");

const statusWeights = {
  standardRelease: 0.45,
  strongCompression: 0.35,
  openSource: 0.2
};

async function readJson(relativePath, fallback) {
  try {
    return JSON.parse(await readFile(path.join(projectRoot, relativePath), "utf8"));
  } catch {
    return fallback;
  }
}

async function readText(relativePath, fallback = "") {
  try {
    return await readFile(path.join(projectRoot, relativePath), "utf8");
  } catch {
    return fallback;
  }
}

function run(command, args) {
  execFileSync(command, args, {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env
  });
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function percent(value) {
  return `${Math.round(value)}%`;
}

function summarizeChecks(checks = []) {
  const total = checks.length;
  const passed = checks.filter((check) => check.status === "pass").length;

  return {
    passed,
    total,
    percent: total ? (passed / total) * 100 : 0,
    blocked: checks
      .filter((check) => check.status !== "pass")
      .map((check) => ({
        id: check.id,
        evidence: check.evidence
      }))
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

  run("npm", ["run", "release:readiness"]);
  run("npm", ["run", "release:open-source-check"]);
  run("npm", ["run", "benchmark:status"]);

  const releaseReadiness = await readJson("test-fixtures/pdf-compression/results/release-readiness.json", {});
  const openSourceReadiness = await readJson("test-fixtures/pdf-compression/results/open-source-readiness.json", {});
  const compressionStatus = await readJson("test-fixtures/pdf-compression/results/compression-project-status.json", {});
  const operationsLog = await readText("运营记录.md");
  const productionSmokeVerified = operationsLog.includes("生产 smoke check 的关键项已通过 Playwright 验证");

  const standard = summarizeChecks(releaseReadiness.standardRelease?.checks ?? []);
  const strong = summarizeChecks(releaseReadiness.strongCompressionRelease?.checks ?? []);
  const openSource = summarizeChecks(openSourceReadiness.checks ?? []);
  const realSampleRequired = compressionStatus.sampleCoverage?.required ?? 0;
  const realSampleCovered = compressionStatus.sampleCoverage?.covered ?? 0;
  const realSamplePercent = realSampleRequired ? (realSampleCovered / realSampleRequired) * 100 : 0;

  const areas = {
    standardRelease: {
      label: "Standard browser-first release",
      status: productionSmokeVerified
        ? "RELEASED"
        : releaseReadiness.standardRelease?.status ?? "missing",
      percent: productionSmokeVerified
        ? 100
        : releaseReadiness.standardRelease?.status === "PASS"
          ? 95
          : clamp(standard.percent * 0.9),
      summary: productionSmokeVerified
        ? `${standard.passed}/${standard.total} checks passed; production smoke verified`
        : `${standard.passed}/${standard.total} checks passed`,
      nextAction: productionSmokeVerified
        ? "Monitor Search Console, GA4, and user compression failures."
        : releaseReadiness.standardRelease?.status === "PASS"
          ? "Deploy, then run npm run release:postdeploy-check."
          : "Run npm run release:standard-check and fix failed checks."
    },
    strongCompression: {
      label: "Strong compression engine",
      status: releaseReadiness.strongCompressionRelease?.status ?? "missing",
      percent: releaseReadiness.strongCompressionRelease?.status === "PASS"
        ? 100
        : clamp((strong.percent * 0.55) + (realSamplePercent * 0.45)),
      summary: `${strong.passed}/${strong.total} checks passed; real samples ${realSampleCovered}/${realSampleRequired}`,
      nextAction: "Collect real samples, run browser benchmark, fill manual quality review, then rerun npm run benchmark:pipeline."
    },
    openSource: {
      label: "Open-source readiness",
      status: openSourceReadiness.status ?? "missing",
      percent: openSourceReadiness.status === "PASS" ? 100 : clamp(openSource.percent),
      summary: `${openSource.passed}/${openSource.total} checks passed`,
      nextAction: openSourceReadiness.status === "PASS"
        ? "Review docs for private information before making the repository public."
        : "Choose a license, add LICENSE, set package.json license, and review private:false."
    }
  };

  const overallPercent =
    areas.standardRelease.percent * statusWeights.standardRelease +
    areas.strongCompression.percent * statusWeights.strongCompression +
    areas.openSource.percent * statusWeights.openSource;

  const report = {
    generatedAt: new Date().toISOString(),
    overall: {
      percent: Math.round(overallPercent),
      status: areas.standardRelease.status === "PASS" &&
        areas.strongCompression.status === "PASS" &&
        areas.openSource.status === "PASS"
        ? "PASS"
        : "IN_PROGRESS",
      note: "Weighted by standard release 45%, strong compression 35%, open-source readiness 20%."
    },
    areas,
    blockers: [
      ...strong.blocked.map((item) => `Strong compression: ${item.id} (${item.evidence})`),
      ...openSource.blocked.map((item) => `Open source: ${item.id} (${item.evidence})`)
    ]
  };

  const markdown = [
    "# Product Status",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Overall: ${report.overall.percent}% (${report.overall.status})`,
    "",
    report.overall.note,
    "",
    "## Areas",
    "",
    markdownTable(
      ["Area", "Status", "Progress", "Summary", "Next action"],
      Object.values(areas).map((area) => [
        area.label,
        area.status,
        percent(area.percent),
        area.summary,
        area.nextAction
      ])
    ),
    "",
    "## Blockers",
    "",
    report.blockers.length ? report.blockers.map((item) => `- ${item}`).join("\n") : "- None.",
    ""
  ].join("\n");

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markdownPath, markdown);

  console.log(`Overall product status: ${report.overall.percent}% (${report.overall.status})`);
  console.log(`Standard release: ${percent(areas.standardRelease.percent)} ${areas.standardRelease.status}`);
  console.log(`Strong compression: ${percent(areas.strongCompression.percent)} ${areas.strongCompression.status}`);
  console.log(`Open source: ${percent(areas.openSource.percent)} ${areas.openSource.status}`);
  console.log(`Wrote ${path.relative(projectRoot, jsonPath)}`);
  console.log(`Wrote ${path.relative(projectRoot, markdownPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
