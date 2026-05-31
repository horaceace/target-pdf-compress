import { spawn } from "node:child_process";

const steps = [
  {
    label: "Generate synthetic fixtures",
    command: "npm",
    args: ["run", "fixtures:compression"]
  },
  {
    label: "Compression strategy tests",
    command: "npm",
    args: ["run", "test:compression-strategy"]
  },
  {
    label: "Node compression benchmark",
    command: "npm",
    args: ["run", "benchmark:compression"]
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
      resolve({ ok: false, error });
    });

    child.on("close", (code) => {
      resolve({ ok: code === 0, code });
    });
  });
}

async function main() {
  for (const step of steps) {
    const result = await runStep(step);

    if (!result.ok) {
      console.error(`\nCI release check failed at: ${step.label}`);
      if (result.error) {
        console.error(result.error.message);
      }
      process.exitCode = result.code || 1;
      return;
    }
  }

  console.log("\nCI release check passed.");
  console.log("Fresh-clone build path is deployable to Cloudflare Workers.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
