import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const resultsDir = path.join(projectRoot, "test-fixtures", "pdf-compression", "results");
const markdownPath = path.join(resultsDir, "browser-benchmark-suite-check.md");
const jsonPath = path.join(resultsDir, "browser-benchmark-suite-check.json");

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

function parseSummaryHeaders(markdown) {
  const lines = markdown.split("\n");
  const summaryStart = lines.findIndex((line) => line.trim() === "## Summary");

  if (summaryStart === -1) {
    return [];
  }

  for (const line of lines.slice(summaryStart + 1)) {
    if (!line.startsWith("|")) {
      continue;
    }

    if (line.includes("---")) {
      continue;
    }

    return line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
  }

  return [];
}

function countSummaryRows(markdown) {
  const lines = markdown.split("\n");
  const summaryStart = lines.findIndex((line) => line.trim() === "## Summary");

  if (summaryStart === -1) {
    return 0;
  }

  let seenHeader = false;
  let count = 0;

  for (const line of lines.slice(summaryStart + 1)) {
    if (!line.startsWith("|")) {
      if (seenHeader) {
        break;
      }

      continue;
    }

    if (line.includes("---")) {
      continue;
    }

    if (!seenHeader) {
      seenHeader = true;
      continue;
    }

    count += 1;
  }

  return count;
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

  const browserPath = await latestFile("browser-compression-benchmark-suite-", ".md");
  const markdown = browserPath ? await readFile(browserPath, "utf8") : "";
  const headers = markdown ? parseSummaryHeaders(markdown) : [];
  const checks = [
    {
      id: "suite-present",
      status: browserPath ? "pass" : "missing",
      evidence: browserPath ? path.relative(projectRoot, browserPath) : "No browser suite Markdown found"
    },
    {
      id: "fixture-mix-present",
      status: markdown.includes("Fixture mix:") ? "pass" : "stale",
      evidence: markdown.includes("Fixture mix:")
        ? "Fixture mix line present"
        : "Fixture mix line missing; re-export suite Markdown from /dev/compression-benchmark"
    },
    {
      id: "summary-type-column",
      status: headers.includes("Type") ? "pass" : "stale",
      evidence: headers.length ? `Summary headers: ${headers.join(", ")}` : "Summary table missing"
    },
    {
      id: "summary-rows",
      status: countSummaryRows(markdown) > 0 ? "pass" : "missing",
      evidence: `${countSummaryRows(markdown)} summary row(s)`
    }
  ];
  const status = checks.every((check) => check.status === "pass") ? "PASS" : "STALE";
  const report = {
    generatedAt: new Date().toISOString(),
    status,
    browserSuite: browserPath ? path.relative(projectRoot, browserPath) : null,
    checks
  };
  const reportMarkdown = [
    "# Browser Benchmark Suite Check",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Status: ${status}`,
    "",
    "This check verifies whether the latest exported browser suite uses the current evidence format. `STALE` means the suite can still be parsed with fallbacks, but should be re-exported before making compression-engine decisions.",
    "",
    "## Checks",
    "",
    markdownTable(
      ["Status", "Check", "Evidence"],
      checks.map((check) => [check.status, check.id, check.evidence])
    ),
    "",
    "## Next Action",
    "",
    "- Open `/dev/compression-benchmark`, run `Run all local fixtures`, export suite Markdown, and place it under `test-fixtures/pdf-compression/results/`.",
    ""
  ].join("\n");

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markdownPath, reportMarkdown);

  console.log(`Browser benchmark suite check: ${status}`);
  console.log(`Wrote ${path.relative(projectRoot, jsonPath)}`);
  console.log(`Wrote ${path.relative(projectRoot, markdownPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
