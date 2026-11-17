---
title: FAQ
description: Single language only, non-Cloudflare hosting, turning comments off, where images go — the common questions.
pubDate: 2026-11-10
tags: ['FAQ']
categories: ['Guides']
emoji: '💬'
---

## I only want English. Can I remove Chinese?

Yes, in three steps:

1. Set `locales` to `['en']` and `defaultLocale` to `'en'` in `astro.config.mjs`
2. Delete `src/pages/*` Chinese pages, or move `src/pages/en/*` up one level
3. Remove the `zh` dictionary from `src/lib/i18n.ts`

The language switch button disappears on its own — it checks `LANGS.length > 1`.

## Can I host this somewhere other than Cloudflare?

Yes. Routing and pages are plain Astro; only three things are Cloudflare-specific:

- the adapter in `astro.config.mjs`
- the D1 / KV calls in `src/actions/index.ts`
- `wrangler.jsonc`

For pure static hosting, set `output: 'static'`, drop the adapter and `src/actions`, remove the comments component, and ship `dist/` anywhere.

## Can I turn comments off entirely?

Sure. Delete this line from the post page:

```astro
<Comments postId={post.id} />
```

Then remove `src/components/Comments.astro`, the `comments` block in `src/actions/index.ts`, and `src/lib/db.ts`. The view counter lives in the `post__views` span — delete that too.

## `public/` or `src/assets/` for images?

- **`public/`**: copied as-is, path never changes. Good for images already referenced elsewhere.
- **`src/assets/`**: gets Astro's image optimisation (compression, responsive sizes, AVIF/WebP), but must be referenced through `<Image>`.

The theme defaults to the former. Moving to `src/assets/` is the bigger win for first-load weight.

## Why is there no table of contents on my post?

The TOC only appears when there are **more than two** `##` / `###` headings. Check whether you used `#` for section headings — level one is not counted.

## Build fails on front-matter validation?

zod names the file and the field. The usual suspects:

- An impossible date such as `2026-13-01`
- `tags` as a string instead of an array (use `tags: ['Astro']`)
- A `description` longer than 300 characters

## Dark mode only half applied — system-dark users see old colours?

Dark values are defined in **two** places in `global.css`: `html[data-theme='dark']` (manual toggle) and `@media (prefers-color-scheme: dark)` (system). Change both.

## `/search` returns 404 after deploying, but works locally?

That is Workers Static Assets behaviour: navigation requests match static files first, and a miss returns the 404 page without ever invoking the Worker. Add `/search`, `/media/*` and `/_actions/*` to `assets.run_worker_first` in `wrangler.jsonc`. See the deployment post for the full explanation.
