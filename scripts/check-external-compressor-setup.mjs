import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const resultsDir = path.join(projectRoot, "test-fixtures", "pdf-compression", "results");
const markdownPath = path.join(resultsDir, "external-compressor-setup.md");
const jsonPath = path.join(resultsDir, "external-compressor-setup.json");

const tools = [
  {
    id: "qpdf",
    label: "qpdf",
    envVar: "QPDF_BIN",
    command: "qpdf",
    versionArgs: ["--version"],
    role: "First-choice structure optimization and linearization benchmark.",
    macInstall: "brew install qpdf",
    binaryHint: "Set QPDF_BIN=/absolute/path/to/qpdf if it is not on PATH."
  },
  {
    id: "pdfcpu",
    label: "pdfcpu",
    envVar: "PDFCPU_BIN",
    command: "pdfcpu",
    versionArgs: ["version"],
    role: "Server-side optimize benchmark candidate.",
    macInstall: "brew install pdfcpu",
    binaryHint: "Set PDFCPU_BIN=/absolute/path/to/pdfcpu if it is not on PATH."
  },
  {
    id: "ghostscript",
    label: "Ghostscript",
    envVar: "GS_BIN",
    command: "gs",
    versionArgs: ["--version"],
    role: "Strong scanned/image-heavy comparison only until license and deployment are approved.",
    macInstall: "brew install ghostscript",
    binaryHint: "Set GS_BIN=/absolute/path/to/gs if it is not on PATH."
  }
];

function configuredCommand(tool) {
  return process.env[tool.envVar] || tool.command;
}

async function executableExists(command, defaultCommand) {
  if (command !== defaultCommand || command.includes(path.sep)) {
    try {
      await access(command, constants.X_OK);
      return {
        available: true,
        source: "env"
      };
    } catch {
      return {
        available: false,
        source: "env"
      };
    }
  }

  const pathDirs = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);

  for (const dir of pathDirs) {
    const candidate = path.join(dir, command);

    try {
      await access(candidate, constants.X_OK);
      return {
        available: true,
        source: "PATH",
        resolvedPath: candidate
      };
    } catch {
      // Continue searching PATH.
    }
  }

  return {
    available: false,
    source: "PATH"
  };
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"]
    });
    const stdout = [];
    const stderr = [];

    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));

    child.on("error", (error) => {
      resolve({
        ok: false,
        output: error.message
      });
    });

    child.on("close", (code) => {
      resolve({
        ok: code === 0,
        output: Buffer.concat([...stdout, ...stderr]).toString("utf8").trim()
      });
    });
  });
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell).replaceAll("|", "\\|")).join(" | ")} |`)
  ].join("\n");
}

async function inspectTool(tool) {
  const configured = configuredCommand(tool);
  const availability = await executableExists(configured, tool.command);
  const version = availability.available
    ? await runCommand(configured, tool.versionArgs)
    : {
        ok: false,
        output: ""
      };

  return {
    id: tool.id,
    label: tool.label,
    role: tool.role,
    command: configured,
    envVar: tool.envVar,
    source: availability.source,
    resolvedPath: availability.resolvedPath ?? (configured !== tool.command ? configured : ""),
    available: availability.available,
    version: version.ok ? version.output.split("\n")[0].slice(0, 120) : "",
    installHint: tool.macInstall,
    binaryHint: tool.binaryHint
  };
}

async function main() {
  await mkdir(resultsDir, { recursive: true });

  const inspected = [];

  for (const tool of tools) {
    inspected.push(await inspectTool(tool));
  }

  const available = inspected.filter((tool) => tool.available);
  const missing = inspected.filter((tool) => !tool.available);
  const report = {
    generatedAt: new Date().toISOString(),
    ready: available.length > 0,
    availableCount: available.length,
    missingCount: missing.length,
    tools: inspected,
    nextCommands: [
      "npm run samples:import -- --source-dir <dir> --dry-run",
      "npm run samples:import -- --source-dir <dir>",
      "npm run benchmark:external-compressors",
      "npm run benchmark:pipeline"
    ]
  };
  const markdown = [
    "# External Compressor Setup",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Status: ${report.ready ? "READY_TO_BENCHMARK" : "MISSING_EXTERNAL_ENGINE"}`,
    "",
    "This project should reuse mature PDF engines before writing low-level compression logic from scratch. At least one external engine must be available before choosing a production strong-compression path.",
    "",
    "`0/3 available` means this machine cannot currently execute qpdf, pdfcpu, or Ghostscript (`gs`). Install one of them or point to a local binary with `QPDF_BIN`, `PDFCPU_BIN`, or `GS_BIN`.",
    "",
    "## Tools",
    "",
    markdownTable(
      ["Tool", "Available", "Command", "Source", "Version", "Role"],
      inspected.map((tool) => [
        tool.label,
        tool.available ? "yes" : "no",
        tool.command,
        tool.source,
        tool.version || "-",
        tool.role
      ])
    ),
    "",
    "## Missing Tool Setup",
    "",
    missing.length
      ? missing
          .map((tool) => [
            `### ${tool.label}`,
            "",
            `- macOS install: \`${tool.installHint}\``,
            `- Custom binary: \`${tool.binaryHint}\``
          ].join("\n"))
          .join("\n\n")
      : "- None. External benchmark can run with at least one configured engine.",
    "",
    "## Next Commands",
    "",
    ...report.nextCommands.map((command) => `- \`${command}\``),
    ""
  ].join("\n");

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markdownPath, markdown);

  console.log(`External compressor setup: ${report.ready ? "READY_TO_BENCHMARK" : "MISSING_EXTERNAL_ENGINE"}`);
  console.log(`Available: ${available.length}/${inspected.length}`);
  console.log(`Wrote ${path.relative(projectRoot, jsonPath)}`);
  console.log(`Wrote ${path.relative(projectRoot, markdownPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
