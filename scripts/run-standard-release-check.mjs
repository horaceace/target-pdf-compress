import { spawn } from "node:child_process";

const steps = [
  {
    label: "Compression strategy tests",
    command: "npm",
    args: ["run", "test:compression-strategy"]
  },
  {
    label: "Compression evidence pipeline",
    command: "npm",
    args: ["run", "benchmark:pipeline"]
  },
  {
    label: "Release readiness",
    command: "npm",
    args: ["run", "release:readiness"]
  },
  {
    label: "Production build",
    command: "npm",
    args: ["run", "build"]
  },
  {
    label: "Release SEO checks",
    command: "npm",
    args: ["run", "release:seo-check"]
  },
  {
    label: "Cloudflare Workers build",
    command: "npm",
    args: ["run", "cf:build"]
  }
];

function runStep(step) {
  return new Promise((resolve) => {
    console.log(`\n==> ${step.label}`);
    console.log(`$ ${[step.command, ...step.args].join(" ")}`);

    const child = spawn(step.command, step.args, {
      stdio: "inherit",
      shell: process.platform === "win32"
    });

    child.on("error", (error) => {
      resolve({
        ok: false,
        error
      });
    });

    child.on("close", (code) => {
      resolve({
        ok: code === 0,
        code
      });
    });
  });
}

async function main() {
  for (const step of steps) {
    const result = await runStep(step);

    if (!result.ok) {
      console.error(`\nStandard release check failed at: ${step.label}`);
      if (result.error) {
        console.error(result.error.message);
      }
      process.exitCode = result.code || 1;
      return;
    }
  }

  console.log("\nStandard release check passed.");
  console.log("Current browser-first FileSmaller product changes are releasable.");
  console.log("Strong compression engine release still depends on release:readiness strong gate.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
