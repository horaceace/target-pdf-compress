import { access, copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const fixturesDir = path.join(projectRoot, "test-fixtures", "pdf-compression");
const resultsDir = path.join(fixturesDir, "results");
const commandEnvVars = {
  qpdf: "QPDF_BIN",
  pdfcpu: "PDFCPU_BIN",
  gs: "GS_BIN"
};

const engines = [
  {
    id: "qpdf-object-streams",
    label: "qpdf object streams",
    command: "qpdf",
    args: (input, output) => [
      "--object-streams=generate",
      "--stream-data=compress",
      "--recompress-flate",
      "--compression-level=9",
      input,
      output
    ]
  },
  {
    id: "qpdf-linearize",
    label: "qpdf linearize",
    command: "qpdf",
    args: (input, output) => [
      "--linearize",
      "--object-streams=generate",
      "--stream-data=compress",
      "--recompress-flate",
      "--compression-level=9",
      input,
      output
    ]
  },
  {
    id: "pdfcpu-optimize",
    label: "pdfcpu optimize",
    command: "pdfcpu",
    args: (input, output) => ["-c", "disable", "optimize", input, output]
  },
  {
    id: "ghostscript-screen",
    label: "Ghostscript screen",
    command: "gs",
    args: (input, output) => [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      "-dPDFSETTINGS=/screen",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${output}`,
      input
    ]
  },
  {
    id: "ghostscript-ebook",
    label: "Ghostscript ebook",
    command: "gs",
    args: (input, output) => [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      "-dPDFSETTINGS=/ebook",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${output}`,
      input
    ]
  }
];

function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function fixtureKind(fileName) {
  if (fileName.startsWith("real-")) {
    return "real";
  }

  if (fileName.startsWith("sample-")) {
    return "synthetic";
  }

  return "other";
}

function configuredCommand(command) {
  const envName = commandEnvVars[command];
  const configured = envName ? process.env[envName] : "";

  return configured || command;
}

async function isCommandAvailable(command) {
  const configured = configuredCommand(command);

  if (configured !== command || configured.includes(path.sep)) {
    try {
      await access(configured, constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }

  const pathDirs = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);
  const candidates = pathDirs.map((dir) => path.join(dir, configured));

  for (const candidate of candidates) {
    try {
      await access(candidate, constants.X_OK);
      return true;
    } catch {
      // Keep checking PATH candidates.
    }
  }

  return false;
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    const startedAt = performance.now();
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
        code: null,
        elapsedMs: Math.round(performance.now() - startedAt),
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: error.message
      });
    });

    child.on("close", (code) => {
      resolve({
        ok: code === 0,
        code,
        elapsedMs: Math.round(performance.now() - startedAt),
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8")
      });
    });
  });
}

async function benchmarkEngine(fileName, filePath, engine, available) {
  const inputStats = await stat(filePath);
  const originalBytes = inputStats.size;
  const command = configuredCommand(engine.command);

  if (!available) {
    return {
      fileName,
      sampleKind: fixtureKind(fileName),
      engine: engine.id,
      label: engine.label,
      command,
      commandName: engine.command,
      commandEnvVar: commandEnvVars[engine.command] ?? "",
      available: false,
      status: "skipped",
      originalBytes,
      compressedBytes: 0,
      savedBytes: 0,
      reductionPercent: 0,
      elapsedMs: 0,
      note: `${engine.command} is not installed, not available on PATH, or not executable via ${commandEnvVars[engine.command] ?? "configured command"}.`
    };
  }

  const tempDir = path.join(
    tmpdir(),
    `filesmaller-${engine.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
  const input = path.join(tempDir, fileName);
  const output = path.join(tempDir, `${path.basename(fileName, ".pdf")}-${engine.id}.pdf`);

  await mkdir(tempDir, { recursive: true });

  try {
    await copyFile(filePath, input);
    const result = await runCommand(command, engine.args(input, output));

    if (!result.ok) {
      return {
        fileName,
        sampleKind: fixtureKind(fileName),
        engine: engine.id,
        label: engine.label,
        command,
        commandName: engine.command,
        commandEnvVar: commandEnvVars[engine.command] ?? "",
        available: true,
        status: "error",
        originalBytes,
        compressedBytes: 0,
        savedBytes: 0,
        reductionPercent: 0,
        elapsedMs: result.elapsedMs,
        note: [result.stderr, result.stdout].filter(Boolean).join(" ").trim().slice(0, 240)
      };
    }

    const outputBytes = (await stat(output)).size;
    const savedBytes = Math.max(0, originalBytes - outputBytes);
    const reductionRatio = originalBytes > 0 ? savedBytes / originalBytes : 0;

    return {
      fileName,
      sampleKind: fixtureKind(fileName),
      engine: engine.id,
      label: engine.label,
      command,
      commandName: engine.command,
      commandEnvVar: commandEnvVars[engine.command] ?? "",
      available: true,
      status: "success",
      originalBytes,
      compressedBytes: outputBytes,
      savedBytes,
      reductionPercent: Number((reductionRatio * 100).toFixed(1)),
      elapsedMs: result.elapsedMs,
      note: outputBytes > originalBytes ? "Output is larger than original." : ""
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function markdownTable(rows) {
  const header = [
    "| File | Type | Engine | Status | Original | Output | Saved | Reduction | Time | Note |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |"
  ];

  const body = rows.map((row) =>
    [
      row.fileName,
      row.sampleKind,
      row.label,
      row.status,
      formatBytes(row.originalBytes),
      row.compressedBytes > 0 ? formatBytes(row.compressedBytes) : "-",
      row.savedBytes > 0 ? formatBytes(row.savedBytes) : "-",
      `${row.reductionPercent}%`,
      row.elapsedMs > 0 ? `${row.elapsedMs}ms` : "-",
      row.note
    ]
      .map((value) => String(value).replaceAll("|", "\\|"))
      .join(" | ")
  );

  return [...header, ...body.map((line) => `| ${line} |`)].join("\n");
}

function summarizeAvailability(availability) {
  return engines.map((engine) => {
    const available = availability.get(engine.command);
    const command = configuredCommand(engine.command);
    const envVar = commandEnvVars[engine.command];
    const source = command === engine.command ? "PATH" : `${envVar}=${command}`;

    return `- ${engine.command} for ${engine.label}: ${available ? "available" : "missing"} (${source})`;
  });
}

function summarizeBest(rows) {
  const successfulRows = rows.filter((row) => row.status === "success");

  if (successfulRows.length === 0) {
    return ["- No external compressor results yet. Install qpdf, pdfcpu, or Ghostscript and rerun this script."];
  }

  const grouped = new Map();

  for (const row of successfulRows) {
    const group = grouped.get(row.fileName) ?? [];
    group.push(row);
    grouped.set(row.fileName, group);
  }

  return [...grouped.entries()].map(([fileName, fileRows]) => {
    const best = fileRows.reduce((winner, current) =>
      current.compressedBytes < winner.compressedBytes ? current : winner
    );

    return `- ${fileName}: ${best.label} (${best.reductionPercent}% smaller, ${formatBytes(best.compressedBytes)})`;
  });
}

async function main() {
  await mkdir(resultsDir, { recursive: true });

  const files = (await readdir(fixturesDir))
    .filter((fileName) => fileName.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    console.log("No PDF fixtures found.");
    console.log(`Add local PDF samples to ${path.relative(projectRoot, fixturesDir)}/ and rerun.`);
    return;
  }

  const commandNames = [...new Set(engines.map((engine) => engine.command))];
  const availability = new Map();

  for (const command of commandNames) {
    availability.set(command, await isCommandAvailable(command));
  }

  const rows = [];

  for (const fileName of files) {
    const filePath = path.join(fixturesDir, fileName);

    for (const engine of engines) {
      rows.push(await benchmarkEngine(fileName, filePath, engine, availability.get(engine.command)));
    }
  }

  const timestamp = new Date().toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z");
  const jsonPath = path.join(resultsDir, `external-compressor-benchmark-${timestamp}.json`);
  const markdownPath = path.join(resultsDir, `external-compressor-benchmark-${timestamp}.md`);
  const markdown = [
    "# External PDF compressor benchmark",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "This benchmark compares local external compressor commands against the PDF fixtures. Missing commands are recorded as skipped rows so the report remains reproducible.",
    "",
    "## Command availability",
    "",
    ...summarizeAvailability(availability),
    "",
    "## Best external result per file",
    "",
    ...summarizeBest(rows),
    "",
    "## Full results",
    "",
    markdownTable(rows),
    ""
  ].join("\n");

  await writeFile(jsonPath, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(markdownPath, markdown);

  console.log(`Benchmarked ${files.length} PDF fixture(s) across ${engines.length} external engine configuration(s).`);
  console.log(`Wrote ${path.relative(projectRoot, jsonPath)}`);
  console.log(`Wrote ${path.relative(projectRoot, markdownPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
