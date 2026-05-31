"use client";

import { ChangeEvent, useEffect, useState, useTransition } from "react";
import {
  CompressionMode,
  compressionModes,
  compressPdfFile,
  formatBytes,
  getCompressionMode
} from "@/lib/pdf/compress";

type BenchmarkRow = {
  mode: CompressionMode;
  status: "queued" | "processing" | "success" | "error";
  originalBytes?: number;
  compressedBytes?: number;
  savedBytes?: number;
  reductionRatio?: number;
  pageCount?: number;
  profileLabel?: string;
  compressionDetails?: string;
  elapsedMs?: number;
  error?: string;
};

type BenchmarkExport = {
  generatedAt: string;
  file: {
    name: string;
    size: number;
    sizeLabel: string;
  };
  bestMode?: {
    mode: CompressionMode;
    label: string;
    compressedBytes: number;
    reductionRatio: number;
  };
  rows: BenchmarkRow[];
};

type LocalFixture = {
  name: string;
  kind: "synthetic" | "real" | "other";
  note?: string;
  originalFileName?: string;
  url: string;
};

type MultiFixtureRun = {
  fileName: string;
  sampleKind: LocalFixture["kind"];
  note?: string;
  size: number;
  sizeLabel: string;
  bestMode?: {
    mode: CompressionMode;
    label: string;
    compressedBytes: number;
    reductionRatio: number;
  };
  rows: BenchmarkRow[];
};

function emptyRows(): BenchmarkRow[] {
  return compressionModes.map((mode) => ({
    mode: mode.id,
    status: "queued"
  }));
}

function formatPercent(value?: number) {
  if (typeof value !== "number") {
    return "-";
  }

  return `${Math.round(value * 100)}%`;
}

function safeFilePart(input: string) {
  return input
    .toLowerCase()
    .replace(/\.pdf$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "pdf";
}

function downloadText(fileName: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildMarkdownReport(data: BenchmarkExport) {
  const best = data.bestMode
    ? `Best result: ${data.bestMode.label} (${formatPercent(data.bestMode.reductionRatio)} smaller, ${formatBytes(data.bestMode.compressedBytes)})`
    : "Best result: not available";
  const header = [
    "| Mode | Status | Profile | Before | After | Saved | Reduction | Time | Details |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |"
  ];
  const rows = data.rows.map((row) =>
    [
      getCompressionMode(row.mode).label,
      row.status,
      row.profileLabel ?? "-",
      typeof row.originalBytes === "number" ? formatBytes(row.originalBytes) : "-",
      typeof row.compressedBytes === "number" ? formatBytes(row.compressedBytes) : "-",
      typeof row.savedBytes === "number" ? formatBytes(row.savedBytes) : "-",
      formatPercent(row.reductionRatio),
      typeof row.elapsedMs === "number" ? `${row.elapsedMs}ms` : "-",
      row.compressionDetails ?? "-"
    ].join(" | ")
  );

  return [
    "# Browser PDF compression benchmark",
    "",
    `Generated: ${data.generatedAt}`,
    `File: ${data.file.name} (${data.file.sizeLabel})`,
    "",
    best,
    "",
    "This report measures the browser compression path, including the Scanned PDF render-and-rebuild path.",
    "",
    ...header,
    ...rows.map((row) => `| ${row} |`),
    ""
  ].join("\n");
}

function buildMultiFixtureMarkdown(generatedAt: string, runs: MultiFixtureRun[]) {
  const summaryHeader = [
    "| File | Type | Best mode | Before | Best after | Best reduction | Scanned after | Scanned reduction | Scanned details | Note |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |"
  ];
  const summaryRows = runs.map((run) => {
    const scanned = run.rows.find((row) => row.mode === "scanned" && row.status === "success");

    return [
      run.fileName,
      run.sampleKind,
      run.bestMode?.label ?? "-",
      run.sizeLabel,
      run.bestMode ? formatBytes(run.bestMode.compressedBytes) : "-",
      run.bestMode ? formatPercent(run.bestMode.reductionRatio) : "-",
      scanned?.compressedBytes ? formatBytes(scanned.compressedBytes) : "-",
      scanned ? formatPercent(scanned.reductionRatio) : "-",
      scanned?.compressionDetails ?? "-",
      run.note || "-"
    ].join(" | ");
  });
  const detailHeader = [
    "| File | Type | Mode | Status | Profile | Before | After | Saved | Reduction | Time | Details | Error |",
    "| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |"
  ];
  const detailRows = runs.flatMap((run) =>
    run.rows.map((row) =>
      [
        run.fileName,
        run.sampleKind,
        getCompressionMode(row.mode).label,
        row.status,
        row.profileLabel ?? "-",
        typeof row.originalBytes === "number" ? formatBytes(row.originalBytes) : "-",
        typeof row.compressedBytes === "number" ? formatBytes(row.compressedBytes) : "-",
        typeof row.savedBytes === "number" ? formatBytes(row.savedBytes) : "-",
        formatPercent(row.reductionRatio),
        typeof row.elapsedMs === "number" ? `${row.elapsedMs}ms` : "-",
        row.compressionDetails ?? "-",
        row.error ?? "-"
      ].join(" | ")
    )
  );

  return [
    "# Browser PDF compression benchmark suite",
    "",
    `Generated: ${generatedAt}`,
    "",
    "This report measures local PDF fixtures through the browser compression path, including the Scanned PDF render-and-rebuild path.",
    "",
    `Fixture mix: ${runs.filter((run) => run.sampleKind === "real").length} real, ${runs.filter((run) => run.sampleKind === "synthetic").length} synthetic, ${runs.filter((run) => run.sampleKind === "other").length} other.`,
    "",
    "## Summary",
    "",
    ...summaryHeader,
    ...summaryRows.map((row) => `| ${row} |`),
    "",
    "## Full mode results",
    "",
    ...detailHeader,
    ...detailRows.map((row) => `| ${row} |`),
    ""
  ].join("\n");
}

export function CompressionBenchmarkCard() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<BenchmarkRow[]>(emptyRows);
  const [lastRunAt, setLastRunAt] = useState("");
  const [allowPortalLimitScan, setAllowPortalLimitScan] = useState(false);
  const [localFixtures, setLocalFixtures] = useState<LocalFixture[]>([]);
  const [fixtureRuns, setFixtureRuns] = useState<MultiFixtureRun[]>([]);
  const [suiteError, setSuiteError] = useState("");
  const [suiteSaveStatus, setSuiteSaveStatus] = useState("");
  const [isPending, startTransition] = useTransition();
  const processing = isPending || rows.some((row) => row.status === "processing");
  const hasResult = rows.some((row) => row.status === "success" || row.status === "error");

  useEffect(() => {
    let cancelled = false;

    async function loadFixtures() {
      try {
        const response = await fetch("/dev/compression-benchmark/fixtures", {
          cache: "no-store"
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { files?: LocalFixture[] };

        if (!cancelled) {
          setLocalFixtures(
            (data.files ?? []).map((fixture) => ({
              ...fixture,
              kind: fixture.kind ?? "other"
            }))
          );
        }
      } catch {
        if (!cancelled) {
          setLocalFixtures([]);
        }
      }
    }

    loadFixtures();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateRow(mode: CompressionMode, patch: Partial<BenchmarkRow>) {
    setRows((current) =>
      current.map((row) => (row.mode === mode ? { ...row, ...patch } : row))
    );
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;

    setFile(selected);
    setRows(emptyRows());
  }

  function runBenchmark() {
    if (!file || processing) {
      return;
    }

    setRows(emptyRows());
    setLastRunAt(new Date().toISOString());

    startTransition(async () => {
      for (const mode of compressionModes) {
        updateRow(mode.id, { status: "processing", error: undefined });
        const startedAt = performance.now();

        try {
          const result = await compressPdfFile(file, mode.id, {
            allowPortalLimitScan
          });
          updateRow(mode.id, {
            status: "success",
            originalBytes: result.originalBytes,
            compressedBytes: result.compressedBytes,
            savedBytes: result.savedBytes,
            reductionRatio: result.reductionRatio,
            pageCount: result.pageCount,
            profileLabel: result.profileLabel,
            compressionDetails: result.compressionDetails,
            elapsedMs: Math.round(performance.now() - startedAt)
          });
        } catch (error) {
          updateRow(mode.id, {
            status: "error",
            elapsedMs: Math.round(performance.now() - startedAt),
            error: error instanceof Error ? error.message : "Unknown benchmark error"
          });
        }
      }
    });
  }

  async function runFileAcrossModes(input: File) {
    const benchmarkRows: BenchmarkRow[] = [];

    for (const mode of compressionModes) {
      const startedAt = performance.now();

      try {
        const result = await compressPdfFile(input, mode.id, {
          allowPortalLimitScan
        });

        benchmarkRows.push({
          mode: mode.id,
          status: "success",
          originalBytes: result.originalBytes,
          compressedBytes: result.compressedBytes,
          savedBytes: result.savedBytes,
          reductionRatio: result.reductionRatio,
          pageCount: result.pageCount,
          profileLabel: result.profileLabel,
          compressionDetails: result.compressionDetails,
          elapsedMs: Math.round(performance.now() - startedAt)
        });
      } catch (error) {
        benchmarkRows.push({
          mode: mode.id,
          status: "error",
          elapsedMs: Math.round(performance.now() - startedAt),
          error: error instanceof Error ? error.message : "Unknown benchmark error"
        });
      }
    }

    return benchmarkRows;
  }

  function runLocalFixtureSuite() {
    if (!localFixtures.length || processing) {
      return;
    }

    setFixtureRuns([]);
    setSuiteError("");
    setLastRunAt(new Date().toISOString());

    startTransition(async () => {
      try {
        const runs: MultiFixtureRun[] = [];

        for (const fixture of localFixtures) {
          const response = await fetch(fixture.url, { cache: "no-store" });

          if (!response.ok) {
            throw new Error(`Unable to load ${fixture.name}`);
          }

          const blob = await response.blob();
          const fixtureFile = new File([blob], fixture.name, { type: "application/pdf" });
          const benchmarkRows = await runFileAcrossModes(fixtureFile);
          const best = benchmarkRows
            .filter((row) => row.status === "success" && typeof row.compressedBytes === "number")
            .sort((a, b) => (a.compressedBytes ?? Infinity) - (b.compressedBytes ?? Infinity))[0];

          runs.push({
            fileName: fixture.name,
            sampleKind: fixture.kind,
            note: fixture.note,
            size: fixtureFile.size,
            sizeLabel: formatBytes(fixtureFile.size),
            bestMode: best
              ? {
                  mode: best.mode,
                  label: getCompressionMode(best.mode).label,
                  compressedBytes: best.compressedBytes ?? 0,
                  reductionRatio: best.reductionRatio ?? 0
                }
              : undefined,
            rows: benchmarkRows
          });

          setFixtureRuns([...runs]);
        }
      } catch (error) {
        setSuiteError(error instanceof Error ? error.message : "Unable to run local fixture suite");
      }
    });
  }

  const bestRow = rows
    .filter((row) => row.status === "success" && typeof row.compressedBytes === "number")
    .sort((a, b) => (a.compressedBytes ?? Infinity) - (b.compressedBytes ?? Infinity))[0];

  function buildExport(): BenchmarkExport | null {
    if (!file || !hasResult) {
      return null;
    }

    return {
      generatedAt: lastRunAt || new Date().toISOString(),
      file: {
        name: file.name,
        size: file.size,
        sizeLabel: formatBytes(file.size)
      },
      bestMode: bestRow
        ? {
            mode: bestRow.mode,
            label: getCompressionMode(bestRow.mode).label,
            compressedBytes: bestRow.compressedBytes ?? 0,
            reductionRatio: bestRow.reductionRatio ?? 0
          }
        : undefined,
      rows
    };
  }

  function exportJson() {
    const data = buildExport();

    if (!data || !file) {
      return;
    }

    downloadText(
      `browser-compression-benchmark-${safeFilePart(file.name)}.json`,
      `${JSON.stringify(data, null, 2)}\n`,
      "application/json"
    );
  }

  function exportMarkdown() {
    const data = buildExport();

    if (!data || !file) {
      return;
    }

    downloadText(
      `browser-compression-benchmark-${safeFilePart(file.name)}.md`,
      buildMarkdownReport(data),
      "text/markdown"
    );
  }

  function exportFixtureSuiteMarkdown() {
    if (!fixtureRuns.length) {
      return;
    }

    downloadText(
      `browser-compression-benchmark-suite-${new Date().toISOString().slice(0, 10)}.md`,
      buildMultiFixtureMarkdown(lastRunAt || new Date().toISOString(), fixtureRuns),
      "text/markdown"
    );
  }

  function buildFixtureSuiteJson() {
    return {
      generatedAt: lastRunAt || new Date().toISOString(),
      allowPortalLimitScan,
      fixtureMix: {
        real: fixtureRuns.filter((run) => run.sampleKind === "real").length,
        synthetic: fixtureRuns.filter((run) => run.sampleKind === "synthetic").length,
        other: fixtureRuns.filter((run) => run.sampleKind === "other").length
      },
      runs: fixtureRuns
    };
  }

  function exportFixtureSuiteJson() {
    if (!fixtureRuns.length) {
      return;
    }

    downloadText(
      `browser-compression-benchmark-suite-${new Date().toISOString().slice(0, 10)}.json`,
      `${JSON.stringify(buildFixtureSuiteJson(), null, 2)}\n`,
      "application/json"
    );
  }

  async function saveFixtureSuite() {
    if (!fixtureRuns.length || processing) {
      return;
    }

    setSuiteSaveStatus("Saving suite files...");

    try {
      const response = await fetch("/dev/compression-benchmark/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filePart: new Date().toISOString().slice(0, 10),
          markdown: buildMultiFixtureMarkdown(lastRunAt || new Date().toISOString(), fixtureRuns),
          json: buildFixtureSuiteJson()
        })
      });
      const data = (await response.json()) as {
        ok?: boolean;
        markdownPath?: string;
        jsonPath?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Unable to save benchmark suite");
      }

      setSuiteSaveStatus(`Saved ${data.markdownPath} and ${data.jsonPath}`);
    } catch (error) {
      setSuiteSaveStatus(error instanceof Error ? error.message : "Unable to save benchmark suite");
    }
  }

  return (
    <section className="dev-benchmark-card">
      <div className="dev-benchmark-card__controls">
        <label className="upload-mode__label" htmlFor="benchmark-pdf">
          PDF fixture
        </label>
        <input
          accept="application/pdf,.pdf"
          className="upload-mode__input"
          id="benchmark-pdf"
          onChange={onFileChange}
          type="file"
        />
        <button className="button button--primary" disabled={!file || processing} onClick={runBenchmark} type="button">
          {processing ? "Running benchmark" : "Run browser benchmark"}
        </button>
      </div>

      <label className="dev-benchmark-toggle">
        <input
          checked={allowPortalLimitScan}
          onChange={(event) => setAllowPortalLimitScan(event.target.checked)}
          type="checkbox"
        />
        <span>Include portal-limit scan candidate</span>
      </label>

      {file ? (
        <div className="upload-job__hint upload-job__hint--neutral">
          <strong>{file.name}</strong>
          <span>{formatBytes(file.size)}</span>
        </div>
      ) : null}

      {bestRow ? (
        <div className="upload-job__hint upload-job__hint--success">
          <strong>
            Best result: {getCompressionMode(bestRow.mode).label} · {formatPercent(bestRow.reductionRatio)} smaller
          </strong>
          <span>
            {formatBytes(bestRow.originalBytes ?? 0)} to {formatBytes(bestRow.compressedBytes ?? 0)}
          </span>
        </div>
      ) : null}

      <div className="dev-benchmark-card__exports">
        <button className="button button--secondary" disabled={!hasResult || processing} onClick={exportJson} type="button">
          Export JSON
        </button>
        <button className="button button--secondary" disabled={!hasResult || processing} onClick={exportMarkdown} type="button">
          Export Markdown
        </button>
      </div>

      <div className="dev-benchmark-suite">
        <div>
          <strong>Local fixture suite</strong>
          <span>
            {localFixtures.length
              ? `${localFixtures.length} fixture(s): ${localFixtures.filter((fixture) => fixture.kind === "real").length} real, ${localFixtures.filter((fixture) => fixture.kind === "synthetic").length} synthetic`
              : "No local fixtures found"}
          </span>
        </div>
        <div className="dev-benchmark-card__exports">
          <button
            className="button button--secondary"
            disabled={!localFixtures.length || processing}
            onClick={runLocalFixtureSuite}
            type="button"
          >
            {processing ? "Running fixtures" : "Run all local fixtures"}
          </button>
          <button
            className="button button--secondary"
            disabled={!fixtureRuns.length || processing}
            onClick={exportFixtureSuiteJson}
            type="button"
          >
            Export suite JSON
          </button>
          <button
            className="button button--secondary"
            disabled={!fixtureRuns.length || processing}
            onClick={exportFixtureSuiteMarkdown}
            type="button"
          >
            Export suite Markdown
          </button>
          <button
            className="button button--secondary"
            disabled={!fixtureRuns.length || processing}
            onClick={saveFixtureSuite}
            type="button"
          >
            Save suite files
          </button>
        </div>
      </div>

      {suiteSaveStatus ? (
        <div className="upload-job__hint upload-job__hint--neutral">
          <strong>Suite save status</strong>
          <span>{suiteSaveStatus}</span>
        </div>
      ) : null}

      {suiteError ? (
        <div className="upload-job__hint upload-job__hint--warning">
          <strong>Fixture suite failed</strong>
          <span>{suiteError}</span>
        </div>
      ) : null}

      {fixtureRuns.length ? (
        <div className="dev-benchmark-suite__results">
          {fixtureRuns.map((run) => (
            <div className="upload-job__hint upload-job__hint--neutral" key={run.fileName}>
              <strong>{run.fileName}</strong>
              <span>
                {run.sampleKind} · Best: {run.bestMode?.label ?? "-"} ·{" "}
                {run.bestMode ? formatPercent(run.bestMode.reductionRatio) : "-"} smaller ·{" "}
                {run.bestMode ? formatBytes(run.bestMode.compressedBytes) : "-"}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="dev-benchmark-table" role="table" aria-label="Compression benchmark results">
        <div className="dev-benchmark-table__row dev-benchmark-table__row--head" role="row">
          <span>Mode</span>
          <span>Status</span>
          <span>Profile</span>
          <span>Before</span>
          <span>After</span>
          <span>Saved</span>
          <span>Reduction</span>
          <span>Time</span>
          <span>Details</span>
        </div>
        {rows.map((row) => (
          <div className="dev-benchmark-table__row" key={row.mode} role="row">
            <strong>{getCompressionMode(row.mode).label}</strong>
            <span>{row.status}</span>
            <span>{row.profileLabel ?? "-"}</span>
            <span>{typeof row.originalBytes === "number" ? formatBytes(row.originalBytes) : "-"}</span>
            <span>{typeof row.compressedBytes === "number" ? formatBytes(row.compressedBytes) : "-"}</span>
            <span>{typeof row.savedBytes === "number" ? formatBytes(row.savedBytes) : "-"}</span>
            <span>{formatPercent(row.reductionRatio)}</span>
            <span>{typeof row.elapsedMs === "number" ? `${row.elapsedMs}ms` : "-"}</span>
            <span>{row.compressionDetails ?? "-"}</span>
            {row.error ? <small>{row.error}</small> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
