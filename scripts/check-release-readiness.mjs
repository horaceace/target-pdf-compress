import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const resultsDir = path.join(projectRoot, "test-fixtures", "pdf-compression", "results");
const markdownPath = path.join(resultsDir, "release-readiness.md");
const jsonPath = path.join(resultsDir, "release-readiness.json");

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

function statusOf(checks) {
  return checks.every((check) => check.status === "pass") ? "PASS" : "BLOCKED";
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

  const packageJson = await readJson("package.json", {});
  const projectStatus = await readJson("test-fixtures/pdf-compression/results/compression-project-status.json", {});
  const decisionGate = await readJson("test-fixtures/pdf-compression/results/compression-decision-gate.json", {});
  const engineRecommendation = await readJson("test-fixtures/pdf-compression/results/compression-engine-recommendation.json", {});
  const browserSuiteCheck = await readJson("test-fixtures/pdf-compression/results/browser-benchmark-suite-check.json", {});
  const deployWorkflow = await readText(".github/workflows/deploy-cloudflare.yml");
  const scripts = packageJson.scripts ?? {};
  const standardReleaseChecks = [
    {
      id: "build-script-present",
      required: "`npm run build` exists for production validation.",
      status: scripts.build ? "pass" : "blocked",
      evidence: scripts.build ? scripts.build : "missing"
    },
    {
      id: "strategy-test-present",
      required: "`npm run test:compression-strategy` exists for browser-limit strategy validation.",
      status: scripts["test:compression-strategy"] ? "pass" : "blocked",
      evidence: scripts["test:compression-strategy"] ? scripts["test:compression-strategy"] : "missing"
    },
    {
      id: "pipeline-present",
      required: "`npm run benchmark:pipeline` exists for evidence refresh.",
      status: scripts["benchmark:pipeline"] ? "pass" : "blocked",
      evidence: scripts["benchmark:pipeline"] ? scripts["benchmark:pipeline"] : "missing"
    },
    {
      id: "cloudflare-build-script-present",
      required: "`npm run cf:build` exists for Cloudflare Workers bundle validation.",
      status: scripts["cf:build"] ? "pass" : "blocked",
      evidence: scripts["cf:build"] ? scripts["cf:build"] : "missing"
    },
    {
      id: "standard-release-check-present",
      required: "`npm run release:standard-check` exists for local pre-release validation.",
      status: scripts["release:standard-check"] ? "pass" : "blocked",
      evidence: scripts["release:standard-check"] ? scripts["release:standard-check"] : "missing"
    },
    {
      id: "seo-release-check-present",
      required: "`npm run release:seo-check` exists for robots and sitemap validation.",
      status: scripts["release:seo-check"] ? "pass" : "blocked",
      evidence: scripts["release:seo-check"] ? scripts["release:seo-check"] : "missing"
    },
    {
      id: "postdeploy-check-present",
      required: "`npm run release:postdeploy-check` exists for production smoke validation after deploy.",
      status: scripts["release:postdeploy-check"] ? "pass" : "blocked",
      evidence: scripts["release:postdeploy-check"] ? scripts["release:postdeploy-check"] : "missing"
    },
    {
      id: "ci-release-check-present",
      required: "`npm run release:ci-check` exists for fresh-clone CI validation.",
      status: scripts["release:ci-check"] ? "pass" : "blocked",
      evidence: scripts["release:ci-check"] ? scripts["release:ci-check"] : "missing"
    },
    {
      id: "deploy-workflow-runs-ci-check",
      required: "GitHub Actions runs CI release checks before deployment.",
      status: deployWorkflow.includes("npm run release:ci-check") ? "pass" : "blocked",
      evidence: deployWorkflow.includes("npm run release:ci-check")
        ? ".github/workflows/deploy-cloudflare.yml runs npm run release:ci-check"
        : "deploy-cloudflare workflow does not run release:ci-check"
    },
    {
      id: "browser-suite-format",
      required: "Browser benchmark suite format is current.",
      status: browserSuiteCheck.status === "PASS" ? "pass" : "blocked",
      evidence: browserSuiteCheck.status ?? "missing"
    }
  ];
  const strongEngineChecks = [
    {
      id: "real-samples-complete",
      required: "All required real samples are imported.",
      status: projectStatus.sampleCoverage?.missing === 0 ? "pass" : "blocked",
      evidence: `${projectStatus.sampleCoverage?.covered ?? 0}/${projectStatus.sampleCoverage?.required ?? 0} covered`
    },
    {
      id: "compression-decision-gate",
      required: "Strong compression decision gate passes.",
      status: decisionGate.gateStatus === "PASS" ? "pass" : "blocked",
      evidence: `${decisionGate.gateStatus ?? "missing"} (${decisionGate.passed ?? 0}/${(decisionGate.passed ?? 0) + (decisionGate.blocked ?? 0)} passed)`
    },
    {
      id: "engine-recommendation",
      required: "External engine recommendation exists.",
      status: engineRecommendation.recommendation?.status === "RECOMMENDED" ? "pass" : "blocked",
      evidence: `${engineRecommendation.recommendation?.status ?? "missing"} (${engineRecommendation.recommendation?.engine ?? "none"})`
    },
    {
      id: "manual-quality-reviewed",
      required: "Manual quality review has no TBD values.",
      status: projectStatus.qualityReview?.hasTbd === false ? "pass" : "blocked",
      evidence: projectStatus.qualityReview?.hasTbd === false ? "No TBD detected" : "TBD present or report missing"
    }
  ];
  const report = {
    generatedAt: new Date().toISOString(),
    standardRelease: {
      status: statusOf(standardReleaseChecks),
      decision: statusOf(standardReleaseChecks) === "PASS"
        ? "May release current browser-first product changes."
        : "Do not release until standard release checks pass.",
      checks: standardReleaseChecks
    },
    strongCompressionRelease: {
      status: statusOf(strongEngineChecks),
      decision: statusOf(strongEngineChecks) === "PASS"
        ? "May release a production strong-compression engine."
        : "Do not market or ship external strong-compression engine as production-ready.",
      checks: strongEngineChecks
    }
  };
  const markdown = [
    "# Release Readiness",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "This report separates normal FileSmaller releases from production strong-compression engine releases.",
    "",
    "## Standard Release",
    "",
    `Status: ${report.standardRelease.status}`,
    "",
    report.standardRelease.decision,
    "",
    markdownTable(
      ["Status", "Check", "Requirement", "Evidence"],
      standardReleaseChecks.map((check) => [check.status, check.id, check.required, check.evidence])
    ),
    "",
    "## Strong Compression Engine Release",
    "",
    `Status: ${report.strongCompressionRelease.status}`,
    "",
    report.strongCompressionRelease.decision,
    "",
    markdownTable(
      ["Status", "Check", "Requirement", "Evidence"],
      strongEngineChecks.map((check) => [check.status, check.id, check.required, check.evidence])
    ),
    "",
    "## Current Policy",
    "",
    "- It is acceptable to release browser-first product/UI/tooling improvements when standard release checks pass.",
    "- It is not acceptable to claim qpdf, pdfcpu, Ghostscript, or server-side strong compression is production-ready until the strong compression gate passes.",
    ""
  ].join("\n");

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markdownPath, markdown);

  console.log(`Standard release: ${report.standardRelease.status}`);
  console.log(`Strong compression release: ${report.strongCompressionRelease.status}`);
  console.log(`Wrote ${path.relative(projectRoot, jsonPath)}`);
  console.log(`Wrote ${path.relative(projectRoot, markdownPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
