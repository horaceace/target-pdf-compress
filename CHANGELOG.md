# Changelog

## 2026-05-31

### Added

- Browser-first compression release readiness checks:
  - `npm run release:readiness`
  - `npm run release:standard-check`
  - `npm run release:ci-check`
  - `npm run release:seo-check`
  - `npm run release:postdeploy-check`
- CI deployment pre-check before Cloudflare deploy.
- SEO release guard for `robots.txt` and `sitemap.xml`.
- Post-deploy smoke check for production URLs.
- GitHub open-source reuse research focused on `target-pdf-compress`.
- Product roadmap v2 for FileSmaller.
- Real PDF sample intake, privacy check, import, and metadata sanitization tooling.
- External compressor benchmark and setup checks for qpdf, pdfcpu, and Ghostscript.
- Compression evidence pipeline, decision gate, and engine recommendation report.
- Browser benchmark suite format check and normalization tooling.
- Manual quality review template.
- UI guidance for scanned/image-heavy PDFs, target-size misses, and browser path limits.
- GA4 `browser_limit_reached` event.

### Changed

- GitHub Actions now runs `npm run release:ci-check` before `npm run cf:deploy`.
- `robots.txt` now disallows `/dev/`.
- Release docs now separate standard browser-first releases from strong-compression engine releases.
- Compression benchmark reports now distinguish real, synthetic, and other samples.

### Current Release Status

- Standard browser-first product release: `PASS`.
- Cloudflare Workers build: `PASS`.
- CI fresh-clone release check: `PASS`.
- SEO robots/sitemap check: `PASS`.
- Strong compression engine release: `BLOCKED`.

### Not Released

The following are not production capabilities in this release:

- qpdf production strong compression
- pdfcpu production strong compression
- Ghostscript production strong compression
- server-side strong compression
- guaranteed compression to a target size

### Strong Compression Blockers

- Real samples: `0/8`
- Browser benchmark real rows: `0`
- Manual quality review: `TBD`
- Compression decision gate: `BLOCKED`
- Engine recommendation: `BLOCKED`
