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

## Node Benchmark

```bash
npm run benchmark:compression
```

This writes JSON and Markdown under `test-fixtures/pdf-compression/results/`.

The Node benchmark measures the shared `pdf-lib` compression pass family. It does not measure the browser-only scanned render-and-rebuild path because that path depends on `window`, `document`, canvas, and `pdfjs-dist`.

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
