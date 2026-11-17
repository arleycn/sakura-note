# Contributing

Thanks for helping improve Sakura Note.

## Development workflow

```bash
npm install
npm run cf-typegen
npm run db:migrate:local
npm run dev
```

Before opening a pull request:

```bash
npm run check
npm run build
```

The type check must report zero errors. If you change `wrangler.jsonc`, run `npm run cf-typegen` and commit the regenerated `worker-configuration.d.ts` only if your change alters public binding types.

## Code conventions

- Use official Astro APIs where one exists: `ClientRouter`, content collections, `Actions`, `astro:env`, `sitemap`, and `RSS`.
- Keep UI strings in `src/lib/i18n.ts`; add both Chinese and English keys in the same change.
- Keep demo content generic. Do not add real names, real social accounts, personal posts, or domains other than `example.com`.
- Keep animations on `transform` or `opacity`, and respect `prefers-reduced-motion`.
- Do not add nonessential comments to front-end code. Document reasoning in Markdown files or the commit message instead.

## Testing dynamic features

```bash
npm run build
npx wrangler dev --config dist/server/wrangler.json --persist-to .wrangler/state
node tools/smoke.mjs http://127.0.0.1:8787
```

The smoke test writes a comment to local D1 and increments a local KV counter. It does not touch remote resources.

## Commits

Write commit messages that explain why the change was made as well as what changed. Include before/after measurements for performance-related changes.
