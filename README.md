# target-pdf-compress

FileSmaller is a browser-first PDF tools website built with Next.js and deployed to Cloudflare Workers. The current version focuses on PDF compression quality, common PDF workflow tools, SEO landing pages, and analytics needed to validate real usage.

## Project info

- Product domain: `filesmaller.space`
- Domain registrar: Namecheap
- Production deployment: Cloudflare Workers
- Workers default URL: `https://target-pdf-compress.jiansay-java.workers.dev`
- GitHub repo: `https://github.com/horaceace/target-pdf-compress`
- Local path: `/Users/chenshaojian/AI创业尝试工作空间/products/出海网站项目/target-pdf-compress`

## Stack

- Next.js `15.5.18`
- React `19.1.0`
- TypeScript
- `pdf-lib` for browser-side PDF rewrite/compression and PDF generation
- `pdfjs-dist` for scanned/image-heavy PDF rendering and preview comparison
- `jszip` for batch ZIP downloads
- `@opennextjs/cloudflare` + `wrangler` for Cloudflare Workers deployment

## Run locally

```bash
npm install
npm run dev
```

## Compression Evidence Terms

- Real samples: reviewed non-sensitive PDFs that represent actual user scenarios, such as resumes, upload forms, scanned documents, image-heavy PDFs, invoices/tables, large upload-limit files, and email attachments. Synthetic fixtures validate the pipeline, but real samples are required before choosing a production compression engine.
- External engines: mature PDF compression tools reused instead of writing low-level PDF compression from scratch. Current candidates are `qpdf`, `pdfcpu`, and Ghostscript. qpdf is the first low-risk candidate; Ghostscript is comparison-only until license, deployment, and quality review are approved.

Current blockers are visible through:

```bash
npm run project:status
npm run benchmark:status
npm run benchmark:external-setup
npm run release:readiness
npm run release:standard-check
npm run release:ci-check
npm run release:seo-check
```

Open-source reuse research:

- Product-specific plan: `产品规划-v2.md`
- GitHub reuse matrix: `docs/GitHub开源复用调研.md`
- Current decision: keep FileSmaller, reuse mature engines where they pass evidence gates, and do not replace the product with a large fork.

Release policy:

- A standard release may ship browser-first product, UI, SEO, analytics, and tooling changes when `npm run release:standard-check` passes. This checks the Next.js build and Cloudflare Workers build, but does not deploy.
- CI deploys run `npm run release:ci-check`, which uses only fresh-clone reproducible fixtures, robots/sitemap checks, and build checks before `cf:deploy`.
- A strong-compression engine release must not be marketed or shipped as production-ready until real samples, browser real-suite rows, manual quality review, and external engine results pass `npm run benchmark:decision-gate`.
- Release checklist: `发布检查清单.md`
- Release handoff: `发布交接.md`
- Current release notes: `发布说明-2026-05-31.md`
- Open-source readiness: `开源准备清单.md`
- Changelog: `CHANGELOG.md`
- Contributing guide: `CONTRIBUTING.md`

Open-source status:

- Current metadata gate: `npm run release:open-source-check`
- The repository should not be made public as an open-source project until a license is selected, `package.json.license` is set, and `package.json.private` is reviewed.
- Real PDFs and private benchmark results must stay out of git.

## Deploy

GitHub Actions deploys automatically on push to `master`.

Required GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Recommended runtime environment variables:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` for Google Analytics 4, for example `G-XXXXXXXXXX`
- If this variable is not set, the app currently falls back to `G-4H9D216586`

Analytics notes:

- GA4 loads in `components/analytics.tsx`.
- Event tracking uses `lib/analytics/events.ts`.
- Custom events automatically include `page_path` and `page_title`.
- Tool routing events use `tool_switch_clicked`; long-tail page entry clicks use `site_link_clicked`.

Relevant scripts:

```bash
npm run project:status
npm run release:standard-check
npm run release:ci-check
npm run release:seo-check
npm run release:postdeploy-check
npm run build
npm run cf:build
npm run cf:deploy
```

## Included in this version

- Home page with Tools dropdown, 8 core tool entrances, and workflow/scenario sections
- Dynamic SEO landing pages for 50+ compression, conversion, rotate, remove, and reorder scenarios
- Privacy page
- Shared content config in `content/tool-pages.ts`
- Shared page template in `components/tool-page-template.tsx`
- Browser-side PDF compression with `light / balanced / strong / extreme / scanned` modes
- Scanned PDF render-and-rebuild path with color and grayscale candidates
- Target size hints for `500 KB / 1 MB / 2 MB / 5 MB`
- Drag-and-drop upload and multi-file batch compression
- Single PDF download and batch ZIP download
- Queue status, filters, bulk retry, and bulk stronger compression actions
- Result summary with before/after/saved metrics and target-size status
- First-page original/compressed comparison preview
- Related tools:
  - Compress PDF
  - Merge PDF
  - Split PDF
  - Rotate PDF
  - Remove PDF pages
  - Reorder PDF pages
  - PDF to JPG
  - JPG to PDF
- GA4 event tracking for upload, compression, preview, download, batch actions, and tool-routing clicks
- Local compression benchmark tooling:
  - `npm run fixtures:compression`
  - `npm run samples:intake-kit`
  - `npm run samples:check`
  - `npm run benchmark:compression`
  - `npm run benchmark:external-compressors`
  - `npm run benchmark:decision`
  - `npm run benchmark:engine-recommendation`
  - `npm run benchmark:decision-gate`
  - `npm run benchmark:quality-review`
  - `npm run benchmark:status`
  - `npm run benchmark:pipeline`
  - `/dev/compression-benchmark`
- GA4 validation checklist in `GA4事件验证清单.md`
- Product progress plan in `PDF压缩产品功能规划.md`
- Operations notes in `运营记录.md`

## Current limitations

- Compression is browser-side only for now
- Maximum shrinking is not guaranteed for every PDF
- Some real scanned PDFs may still need manual quality checks after aggressive compression
- No server-side deep compression pipeline yet
- No OCR, login, payment, API, or server-side quota system yet

## Build status

The project passes:

```bash
npm run build
npm run cf:build
```
