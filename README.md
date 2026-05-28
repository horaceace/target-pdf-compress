# target-pdf-compress

Maximum PDF compression website built with Next.js. The current version focuses on SEO landing pages plus browser-side PDF compression.

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
- `pdf-lib` for browser-side PDF rewrite/compression
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

Relevant scripts:

```bash
npm run build
npm run cf:build
npm run cf:deploy
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
- No server-side deep compression pipeline yet

## Build status

The project passes:

```bash
npm run build
```
