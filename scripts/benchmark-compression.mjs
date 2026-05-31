import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const fixturesDir = path.join(projectRoot, "test-fixtures", "pdf-compression");
const resultsDir = path.join(fixturesDir, "results");

const compressionModes = [
  {
    id: "light",
    label: "Light",
    optimizedPasses: 1,
    rebuildPasses: 0,
    multipassPasses: 0
  },
  {
    id: "balanced",
    label: "Balanced",
    optimizedPasses: 1,
    rebuildPasses: 1,
    multipassPasses: 0
  },
  {
    id: "strong",
    label: "Strong",
    optimizedPasses: 1,
    rebuildPasses: 2,
    multipassPasses: 1
  },
  {
    id: "extreme",
    label: "Extreme",
    optimizedPasses: 2,
    rebuildPasses: 2,
    multipassPasses: 2
  },
  {
    id: "scanned",
    label: "Scanned PDF",
    optimizedPasses: 1,
    rebuildPasses: 3,
    multipassPasses: 2,
    note: "Node fallback only. Browser render path is not measured here."
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

function classifyDocumentProfile(bytesPerPage, pageCount) {
  if (bytesPerPage >= 900_000 || (pageCount <= 6 && bytesPerPage >= 750_000)) {
    return "scanned-heavy";
  }

  if (bytesPerPage >= 450_000) {
    return "image-heavy";
  }

  if (bytesPerPage <= 160_000) {
    return "clean-office";
  }

  return "mixed";
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

async function saveOptimized(source) {
  return source.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    addDefaultPage: false,
    objectsPerTick: 25
  });
}

async function rebuildMinimal(source) {
  const rebuilt = await PDFDocument.create();
  const copiedPages = await rebuilt.copyPages(source, source.getPageIndices());

  copiedPages.forEach((page) => rebuilt.addPage(page));

  rebuilt.setTitle(source.getTitle() ?? "");
  rebuilt.setSubject(source.getSubject() ?? "");
  rebuilt.setProducer("FileSmaller benchmark");
  rebuilt.setCreator("FileSmaller benchmark");

  return rebuilt.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    addDefaultPage: false,
    objectsPerTick: 10
  });
}

async function multiPass(bytes) {
  const secondPassDoc = await PDFDocument.load(bytes, {
    updateMetadata: false,
    ignoreEncryption: true
  });

  return secondPassDoc.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    addDefaultPage: false,
    objectsPerTick: 5
  });
}

async function runOptimizedPasses(source, count) {
  const candidates = [];
  let workingDoc = source;

  for (let index = 0; index < count; index += 1) {
    const bytes = await saveOptimized(workingDoc);
    candidates.push(bytes);
    workingDoc = await PDFDocument.load(bytes, {
      updateMetadata: false,
      ignoreEncryption: true
    });
  }

  return candidates;
}

async function runRebuildPasses(source, count) {
  const candidates = [];
  let workingDoc = source;

  for (let index = 0; index < count; index += 1) {
    const bytes = await rebuildMinimal(workingDoc);
    candidates.push(bytes);
    workingDoc = await PDFDocument.load(bytes, {
      updateMetadata: false,
      ignoreEncryption: true
    });
  }

  return candidates;
}

async function runMultiPasses(bytes, count) {
  const candidates = [];
  let current = bytes;

  for (let index = 0; index < count; index += 1) {
    current = await multiPass(current);
    candidates.push(current);
  }

  return candidates;
}

async function benchmarkMode(fileName, fileBytes, mode) {
  const startedAt = performance.now();
  const source = await PDFDocument.load(fileBytes, {
    updateMetadata: false,
    ignoreEncryption: true
  });
  const pageCount = source.getPageCount();
  const bytesPerPage = pageCount > 0 ? fileBytes.byteLength / pageCount : fileBytes.byteLength;
  const candidates = [];

  candidates.push(...(await runOptimizedPasses(source, mode.optimizedPasses)));
  candidates.push(...(await runRebuildPasses(source, mode.rebuildPasses)));

  if (mode.multipassPasses > 0 && candidates.length > 0) {
    const smallestCurrent = candidates.reduce((best, current) =>
      current.byteLength < best.byteLength ? current : best
    );
    candidates.push(...(await runMultiPasses(smallestCurrent, mode.multipassPasses)));
  }

  const best = candidates.reduce((smallest, current) =>
    current.byteLength < smallest.byteLength ? current : smallest
  );
  const elapsedMs = Math.round(performance.now() - startedAt);
  const savedBytes = Math.max(0, fileBytes.byteLength - best.byteLength);
  const reductionRatio = fileBytes.byteLength > 0 ? savedBytes / fileBytes.byteLength : 0;

  return {
    fileName,
    sampleKind: fixtureKind(fileName),
    mode: mode.id,
    label: mode.label,
    pageCount,
    profile: classifyDocumentProfile(bytesPerPage, pageCount),
    originalBytes: fileBytes.byteLength,
    compressedBytes: best.byteLength,
    savedBytes,
    reductionPercent: Number((reductionRatio * 100).toFixed(1)),
    elapsedMs,
    note: mode.note ?? ""
  };
}

function markdownTable(rows) {
  const header = [
    "| File | Type | Mode | Profile | Pages | Original | Compressed | Saved | Reduction | Time | Note |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |"
  ];

  const body = rows.map((row) =>
    [
      row.fileName,
      row.sampleKind,
      row.label,
      row.profile,
      row.pageCount,
      formatBytes(row.originalBytes),
      formatBytes(row.compressedBytes),
      formatBytes(row.savedBytes),
      `${row.reductionPercent}%`,
      `${row.elapsedMs}ms`,
      row.note
    ]
      .map((value) => String(value).replaceAll("|", "\\|"))
      .join(" | ")
  );

  return [...header, ...body.map((line) => `| ${line} |`)].join("\n");
}

function summarizeBestModes(rows) {
  const grouped = new Map();

  for (const row of rows) {
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
    console.log(`Add local PDF samples to ${path.relative(projectRoot, fixturesDir)}/ and rerun:`);
    console.log("npm run benchmark:compression");
    return;
  }

  const rows = [];

  for (const fileName of files) {
    const filePath = path.join(fixturesDir, fileName);
    const fileBytes = await readFile(filePath);

    for (const mode of compressionModes) {
      try {
        rows.push(await benchmarkMode(fileName, fileBytes, mode));
      } catch (error) {
        rows.push({
          fileName,
          sampleKind: fixtureKind(fileName),
          mode: mode.id,
          label: mode.label,
          pageCount: 0,
          profile: "error",
          originalBytes: fileBytes.byteLength,
          compressedBytes: 0,
          savedBytes: 0,
          reductionPercent: 0,
          elapsedMs: 0,
          note: error instanceof Error ? error.message : "Unknown benchmark error"
        });
      }
    }
  }

  const timestamp = new Date().toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z");
  const jsonPath = path.join(resultsDir, `compression-benchmark-${timestamp}.json`);
  const markdownPath = path.join(resultsDir, `compression-benchmark-${timestamp}.md`);
  const markdown = [
    "# PDF compression benchmark",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "This Node benchmark measures the shared pdf-lib compression pass family. The browser-only scanned render path is not measured here.",
    "",
    "## Best mode per file",
    "",
    ...summarizeBestModes(rows),
    "",
    "## Full results",
    "",
    markdownTable(rows),
    ""
  ].join("\n");

  await writeFile(jsonPath, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(markdownPath, markdown);

  console.log(`Benchmarked ${files.length} PDF fixture(s) across ${compressionModes.length} mode(s).`);
  console.log(`Wrote ${path.relative(projectRoot, jsonPath)}`);
  console.log(`Wrote ${path.relative(projectRoot, markdownPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
