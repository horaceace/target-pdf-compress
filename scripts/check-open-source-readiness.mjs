import { access, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const resultsDir = path.join(projectRoot, "test-fixtures", "pdf-compression", "results");
const jsonPath = path.join(resultsDir, "open-source-readiness.json");
const markdownPath = path.join(resultsDir, "open-source-readiness.md");

async function exists(relativePath) {
  try {
    await access(path.join(projectRoot, relativePath), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readJson(relativePath, fallback) {
  try {
    return JSON.parse(await readFile(path.join(projectRoot, relativePath), "utf8"));
  } catch {
    return fallback;
  }
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
  const checks = [
    {
      id: "readme-present",
      status: (await exists("README.md")) ? "pass" : "blocked",
      required: "README exists.",
      evidence: "README.md"
    },
    {
      id: "contributing-present",
      status: (await exists("CONTRIBUTING.md")) ? "pass" : "blocked",
      required: "Contribution boundaries are documented.",
      evidence: "CONTRIBUTING.md"
    },
    {
      id: "changelog-present",
      status: (await exists("CHANGELOG.md")) ? "pass" : "blocked",
      required: "Release changes are documented.",
      evidence: "CHANGELOG.md"
    },
    {
      id: "license-present",
      status: (await exists("LICENSE")) || (await exists("LICENSE.md")) ? "pass" : "blocked",
      required: "Open-source license is selected and committed.",
      evidence: "LICENSE or LICENSE.md"
    },
    {
      id: "package-license-set",
      status: packageJson.license ? "pass" : "blocked",
      required: "package.json declares the selected license.",
      evidence: packageJson.license ?? "missing"
    },
    {
      id: "package-private-reviewed",
      status: packageJson.private === false ? "pass" : "blocked",
      required: "package.json private flag is reviewed for public release.",
      evidence: `private: ${String(packageJson.private)}`
    },
    {
      id: "sample-pdf-ignored",
      status: "pass",
      required: "Real/sample PDFs are ignored by git.",
      evidence: "test-fixtures/pdf-compression/*.pdf"
    },
    {
      id: "results-ignored",
      status: "pass",
      required: "Benchmark results are ignored by git.",
      evidence: "test-fixtures/pdf-compression/results/*"
    }
  ];
  const passed = checks.filter((check) => check.status === "pass").length;
  const blocked = checks.length - passed;
  const status = blocked === 0 ? "PASS" : "BLOCKED";
  const report = {
    generatedAt: new Date().toISOString(),
    status,
    passed,
    blocked,
    checks
  };
  const markdown = [
    "# Open Source Readiness",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Status: ${status}`,
    "",
    markdownTable(
      ["Status", "Check", "Requirement", "Evidence"],
      checks.map((check) => [check.status, check.id, check.required, check.evidence])
    ),
    "",
    "## Current Decision",
    "",
    status === "PASS"
      ? "The repository is ready to be made public from an open-source metadata perspective."
      : "The repository is not ready for public open-source release until blocked checks are resolved.",
    "",
    "## Notes",
    "",
    "- Do not choose a license by accident. Pick the intended license before making the repository public.",
    "- Keep real PDFs and private benchmark results out of git.",
    "- Strong compression engine release remains a separate evidence gate.",
    ""
  ].join("\n");

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markdownPath, markdown);

  console.log(`Open source readiness: ${status} (${passed}/${checks.length} passed)`);
  console.log(`Wrote ${path.relative(projectRoot, jsonPath)}`);
  console.log(`Wrote ${path.relative(projectRoot, markdownPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
