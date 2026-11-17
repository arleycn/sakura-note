# Getting started

## Requirements

- Node.js `>=22.23.4` (Astro 7 requirement)
- npm, pnpm, or Yarn
- A Cloudflare account only if you want to deploy the dynamic features

## Create a project from the theme

```bash
npm create astro@latest -- --template arleycn/sakura-note
cd sakura-note
npm install
npm run dev
```

The development server starts at `http://localhost:4321`. Add `/en` to the URL for the English version.

## Validate the project

```bash
npm run check
npm run build
npm run preview
```

`npm run check` should report zero errors. A successful build prints the generated routes and includes both `/` and `/en` trees.

## Run with the Cloudflare runtime

The plain `astro dev` server is enough for layout and content work. Comments, views, image uploads, and search need Cloudflare bindings, so validate those with Wrangler:

```bash
npm run cf-typegen
npm run db:migrate:local
npm run build
npx wrangler dev --config dist/server/wrangler.json --persist-to .wrangler/state
```

Then open `http://127.0.0.1:8787` and run:

```bash
node tools/smoke.mjs http://127.0.0.1:8787
node tools/i18n-smoke.mjs http://127.0.0.1:8787
```

The first smoke test checks theme switching, client-side navigation, theme persistence after navigation, view counts, comment submission, D1 persistence after reload, mobile overflow, and console errors. The second checks both locale trees, hreflang links, bilingual RSS, and language switching.

## Where to go next

- Change site identity: [Customization](CUSTOMIZATION.md)
- Deploy to Cloudflare: [Deploy](DEPLOY_CLOUDFLARE.md)
- Submit to the Astro theme catalogue: [Theme catalogue](THEME_CATALOGUE.md)
