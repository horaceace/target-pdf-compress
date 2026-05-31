# PDF compression benchmark fixtures

Place local PDF samples in this directory before running compression benchmarks.

Real PDF samples are intentionally ignored by git:

- `*.pdf` files in this directory are not committed.
- benchmark output under `results/` is not committed.
- keep only `results/.gitkeep` tracked.

## Recommended Sample Mix

Use non-sensitive files only. Prefer short, realistic samples that represent common upload limits.

- `clean-office.pdf`: text-heavy exported office document.
- `mixed-content.pdf`: text plus a few images.
- `image-heavy.pdf`: slides, screenshots, or design-heavy pages.
- `scanned-color.pdf`: color scanned certificate, form, or statement.
- `scanned-bw.pdf`: black-and-white or grayscale scan.
- `resume-export.pdf`: resume or application material.
- `large-upload.pdf`: a file that normally fails a portal or email limit.

## Generate Synthetic Fixtures

```bash
npm run fixtures:compression
```

This creates local synthetic PDFs for smoke testing. They are useful for checking the benchmark flow, but they are not a substitute for real-world samples.

Current synthetic fixtures include:

- `sample-clean-office.pdf`
- `sample-mixed-content.pdf`
- `sample-image-heavy.pdf`
- `sample-scanned-like.pdf`
- `sample-scanned-color.pdf`
- `sample-scanned-bw.pdf`

## Check Real Sample Coverage

```bash
npm run samples:check
```

This reads `sample-manifest.json` and writes:

```text
test-fixtures/pdf-compression/results/sample-coverage-report.md
```

Use this before making compression decisions. Synthetic fixtures validate the benchmark pipeline, but real non-sensitive `real-*` PDFs are required for readability and product-quality decisions.

In this project, a real sample means a safe PDF that behaves like a real user upload, not a generated fixture. Examples: resume export, form upload, scanned proof, screenshot-heavy PDF, invoice/table PDF, large portal upload, or email attachment. `0/8` means none of the required real-scenario slots are currently filled.

## Import Real Samples

List required slots:

```bash
npm run samples:import -- --list
```

Create a handoff folder with a handoff note, README, checklist, and CSV slot table:

```bash
npm run samples:intake-kit
```

By default this writes:

```text
test-fixtures/pdf-compression/results/real-sample-intake-kit/
```

Generated files:

- `HANDOFF.md`: one-page instructions for whoever collects PDFs.
- `README.md`: import workflow and privacy rules.
- `CHECKLIST.md`: per-slot manual review checklist.
- `SAMPLE-SLOTS.csv`: copyable sample slot table.

Import one reviewed PDF:

```bash
npm run samples:import -- --slot real-scanned-color.pdf --source /path/to/sanitized.pdf
```

Batch import a directory after renaming files to manifest slot names:

```bash
npm run samples:import -- --source-dir /path/to/renamed-pdfs --dry-run
npm run samples:import -- --source-dir /path/to/renamed-pdfs
```

The importer checks PDF headers and metadata/filename privacy risks. It does not OCR page content, so manually inspect every real sample before committing benchmark conclusions.

## Node Benchmark

```bash
npm run benchmark:compression
```

This writes JSON and Markdown under `test-fixtures/pdf-compression/results/`.

The Node benchmark measures the shared `pdf-lib` compression pass family. It does not measure the browser-only scanned render-and-rebuild path because that path depends on `window`, `document`, canvas, and `pdfjs-dist`.

## External Compressor Benchmark

External compressors are mature tools we can reuse instead of writing PDF compression from zero:

- `qpdf`: preferred first candidate for structure optimization and linearization.
- `pdfcpu`: server-side optimization candidate.
- Ghostscript: aggressive scan/image comparison candidate; not a default production choice before license/deployment review.

`0/3` available means this machine cannot currently execute `qpdf`, `pdfcpu`, or `gs`.

Check whether reusable compressor binaries are available:

```bash
npm run benchmark:external-setup
```

The setup check writes:

```text
test-fixtures/pdf-compression/results/external-compressor-setup.md
```

By default the benchmark searches `PATH`. You can also point to local binaries without changing code:

```bash
QPDF_BIN=/absolute/path/to/qpdf npm run benchmark:external-compressors
PDFCPU_BIN=/absolute/path/to/pdfcpu npm run benchmark:external-compressors
GS_BIN=/absolute/path/to/gs npm run benchmark:external-compressors
```

```bash
npm run benchmark:external-compressors
```

This writes JSON and Markdown under `test-fixtures/pdf-compression/results/`.

The external benchmark checks local command availability and, when installed, compares these engine configurations against the same fixture PDFs:

- `qpdf object streams`
- `qpdf linearize`
- `pdfcpu optimize`
- `Ghostscript screen`
- `Ghostscript ebook`

Missing commands are recorded as skipped rows. Install `qpdf`, `pdfcpu`, or Ghostscript and rerun the same command to produce comparable results.

## Decision Report

```bash
npm run benchmark:decision
npm run benchmark:engine-recommendation
npm run benchmark:decision-gate
npm run benchmark:status
```

This reads the latest Node baseline, browser benchmark suite, and external compressor benchmark, then writes:

```text
test-fixtures/pdf-compression/results/compression-decision-report.md
```

Use this report as the current compression roadmap checkpoint before changing compression logic.

`benchmark:engine-recommendation` scores external engines from the latest benchmark output. It stays `BLOCKED` until at least one external engine has successful real-sample rows. qpdf is preferred when evidence is comparable; Ghostscript remains comparison-only until license, deployment, and quality review are approved.

## Full Evidence Pipeline

```bash
npm run benchmark:pipeline
```

This runs the current automated evidence chain:

1. `samples:check`
2. `benchmark:compression`
3. `benchmark:external-compressors`
4. `benchmark:quality-review`
5. `benchmark:decision`
6. `benchmark:engine-recommendation`
7. `benchmark:decision-gate`
8. `benchmark:status`

The browser scanned path still needs a manual export from `/dev/compression-benchmark`, because it depends on browser canvas APIs. Export the browser suite Markdown first when you need a fresh scanned-path report.

## Quality Review Template

```bash
npm run benchmark:quality-review
```

This reads the latest browser benchmark suite and writes:

```text
test-fixtures/pdf-compression/results/quality-review-template.md
```

Fill the `Readable?`, `Submit-safe?`, and `Notes` columns manually after comparing the original and compressed output. Compression ratio alone is not enough to approve a mode as default.

## Browser Benchmark Suite

Run the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/dev/compression-benchmark
```

Use `Run all local fixtures` to run every local PDF in this directory through the browser compression path across all modes. This includes the `Scanned PDF` render-and-rebuild path.

Available exports:

- `Export suite JSON`: full mode-by-mode results for every fixture.
- `Export suite Markdown`: summary plus full mode results table.

The browser benchmark page and fixture API are development-only. They are not available in production.
