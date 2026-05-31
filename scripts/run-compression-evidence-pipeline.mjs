import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const steps = [
  {
    name: "Check real sample coverage",
    command: "node",
    args: ["scripts/check-compression-samples.mjs"]
  },
  {
    name: "Run Node pdf-lib compression baseline",
    command: "node",
    args: ["scripts/benchmark-compression.mjs"]
  },
  {
    name: "Check external compressor setup",
    command: "node",
    args: ["scripts/check-external-compressor-setup.mjs"]
  },
  {
    name: "Check external compressor availability/results",
    command: "node",
    args: ["scripts/benchmark-external-compressors.mjs"]
  },
  {
    name: "Normalize browser benchmark suite",
    command: "node",
    args: ["scripts/normalize-browser-benchmark-suite.mjs"]
  },
  {
    name: "Check browser benchmark suite format",
    command: "node",
    args: ["scripts/check-browser-benchmark-suite.mjs"]
  },
  {
    name: "Create manual quality review template",
    command: "node",
    args: ["scripts/create-quality-review-template.mjs"]
  },
  {
    name: "Summarize compression decision",
    command: "node",
    args: ["scripts/summarize-compression-decision.mjs"]
  },
  {
    name: "Recommend compression engine",
    command: "node",
    args: ["scripts/recommend-compression-engine.mjs"]
  },
  {
    name: "Check compression decision gate",
    command: "node",
    args: ["scripts/check-compression-decision-gate.mjs"]
  },
  {
    name: "Summarize compression project status",
    command: "node",
    args: ["scripts/summarize-compression-project-status.mjs"]
  }
];

function runStep(step) {
  return new Promise((resolve) => {
    console.log(`\n==> ${step.name}`);
    console.log(`$ ${step.command} ${step.args.join(" ")}`);

    const child = spawn(step.command, step.args, {
      cwd: projectRoot,
      stdio: "inherit"
    });

    child.on("error", (error) => {
      resolve({
        step,
        ok: false,
        code: null,
        error
      });
    });

    child.on("close", (code) => {
      resolve({
        step,
        ok: code === 0,
        code,
        error: null
      });
    });
  });
}

async function main() {
  const results = [];

  for (const step of steps) {
    const result = await runStep(step);
    results.push(result);

    if (!result.ok) {
      console.error(`\nPipeline stopped at: ${step.name}`);
      if (result.error) {
        console.error(result.error);
      }
      process.exitCode = result.code ?? 1;
      return;
    }
  }

  console.log("\nCompression evidence pipeline completed.");
  console.log("");
  console.log("Generated or refreshed:");
  console.log("- test-fixtures/pdf-compression/results/sample-coverage-report.md");
  console.log("- test-fixtures/pdf-compression/results/compression-benchmark-*.json");
  console.log("- test-fixtures/pdf-compression/results/compression-benchmark-*.md");
  console.log("- test-fixtures/pdf-compression/results/external-compressor-setup.json");
  console.log("- test-fixtures/pdf-compression/results/external-compressor-setup.md");
  console.log("- test-fixtures/pdf-compression/results/external-compressor-benchmark-*.json");
  console.log("- test-fixtures/pdf-compression/results/external-compressor-benchmark-*.md");
  console.log("- test-fixtures/pdf-compression/results/browser-compression-benchmark-suite-normalized-*.md");
  console.log("- test-fixtures/pdf-compression/results/browser-benchmark-suite-check.json");
  console.log("- test-fixtures/pdf-compression/results/browser-benchmark-suite-check.md");
  console.log("- test-fixtures/pdf-compression/results/quality-review-template.md");
  console.log("- test-fixtures/pdf-compression/results/compression-decision-report.md");
  console.log("- test-fixtures/pdf-compression/results/compression-engine-recommendation.json");
  console.log("- test-fixtures/pdf-compression/results/compression-engine-recommendation.md");
  console.log("- test-fixtures/pdf-compression/results/compression-decision-gate.json");
  console.log("- test-fixtures/pdf-compression/results/compression-decision-gate.md");
  console.log("- test-fixtures/pdf-compression/results/compression-project-status.json");
  console.log("- test-fixtures/pdf-compression/results/compression-project-status.md");
  console.log("");
  console.log("Browser scanned path still requires manual export from /dev/compression-benchmark.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
