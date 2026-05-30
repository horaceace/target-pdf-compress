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
  - `npm run benchmark:compression`
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
