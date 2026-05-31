# Contributing

FileSmaller is a browser-first PDF tools project. Contributions should keep the current product direction narrow: help users make PDFs smaller, easier to upload, and easier to submit without turning the project into a large all-purpose PDF platform.

## Before Opening a PR

Run:

```bash
npm run release:ci-check
```

For local release-level validation, run:

```bash
npm run release:standard-check
```

## Privacy and Sample Files

Do not commit real user PDFs.

The repository intentionally ignores:

```text
test-fixtures/pdf-compression/*.pdf
test-fixtures/pdf-compression/results/*
```

Allowed:

- synthetic fixtures generated with `npm run fixtures:compression`
- scripts, manifests, and docs that describe sample slots
- non-sensitive notes that do not reveal local paths or personal data

Not allowed:

- resumes, invoices, statements, application forms, scans, or screenshots containing real personal data
- benchmark result files generated from private samples
- metadata that reveals a contributor's local file paths or private document names

If a real sample is needed for local evidence, use:

```bash
npm run samples:privacy-check -- --source <local.pdf> --write-report
npm run samples:sanitize -- --source <local.pdf> --output <sanitized.pdf>
npm run samples:import -- --slot <slot.pdf> --source <sanitized.pdf>
```

Still review visible page content manually. The privacy checker does not OCR PDF pages.

## Compression Engine Policy

Prefer mature open-source engines before writing low-level PDF compression logic from scratch.

Current candidates:

- `qpdf`
- `pdfcpu`
- Ghostscript for comparison only until license, deployment, and quality review are approved

Do not claim qpdf, pdfcpu, Ghostscript, or server-side strong compression is production-ready unless these pass:

```bash
npm run benchmark:decision-gate
npm run benchmark:engine-recommendation
```

Strong compression currently requires real sample evidence and manual quality review.

## Development-Only Routes

`/dev/compression-benchmark` is development-only.

Production behavior must remain:

- page returns 404
- fixture/save APIs return 404
- `robots.txt` disallows `/dev/`
- sitemap does not include `/dev/`

Check:

```bash
npm run release:seo-check
```

## Release Boundaries

Standard browser-first product improvements may ship when:

```bash
npm run release:readiness
npm run release:ci-check
npm run release:standard-check
```

Strong compression engine releases require the separate strong gate to pass. A standard release passing does not mean strong compression is approved.

## Product Direction

In scope:

- browser-first PDF compression
- upload-limit workflows
- scanned/image-heavy PDF compression UX
- merge, split, rotate, remove/reorder pages
- PDF/JPG conversion
- evidence tooling for compression decisions

Out of scope for now:

- full PDF editor
- ChatPDF or broad AI document analysis
- login, payment, or account system
- server-side strong compression without evidence gates
- direct forks of large PDF platforms that replace FileSmaller's current stack
