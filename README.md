# target-pdf-compress

First-pass Next.js product for target-size PDF compression landing pages and browser-side processing.

## Run locally

```bash
npm install
npm run dev
```

## Included in this version

- Home page
- Dynamic SEO landing pages for five target-size routes
- Privacy page
- Shared content config in `content/tool-pages.ts`
- Shared page template in `components/tool-page-template.tsx`
- Browser-side PDF rewrite/compression flow with `pdf-lib`
- Download flow for processed PDFs
- Target-size selection and result state UI

## Current limitations

- Compression is browser-side only for now
- Exact target matching is not guaranteed
- Scanned PDFs and image-heavy PDFs may not shrink enough
- No analytics or deployment config yet

## Build status

The project passes:

```bash
npm run build
```
