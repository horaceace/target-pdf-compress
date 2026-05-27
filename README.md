# target-pdf-compress

First-pass Next.js product for maximum PDF compression landing pages and browser-side processing.

## Run locally

```bash
npm install
npm run dev
```

## Included in this version

- Home page
- Dynamic SEO landing pages for five compression scenarios
- Privacy page
- Shared content config in `content/tool-pages.ts`
- Shared page template in `components/tool-page-template.tsx`
- Browser-side PDF rewrite/compression flow with `pdf-lib`
- Download flow for processed PDFs
- Compression mode selection and result state UI

## Current limitations

- Compression is browser-side only for now
- Maximum shrinking is not guaranteed for every PDF
- Scanned PDFs and image-heavy PDFs may not shrink enough
- No analytics or deployment config yet

## Build status

The project passes:

```bash
npm run build
```
