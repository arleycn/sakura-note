# Customization

## Site identity

Edit `src/config.ts`.

- `SITE.name`: name shown in the header, footer, and metadata
- `SITE.theme`: theme credit in the footer
- `SITE.author`: placeholder author used on the About page
- `SITE.email`: placeholder email; keep `example.com` for the public demo
- `SITE.github`: use a root URL such as `https://github.com` in the public demo
- `SITE.repo`: source repository link
- `SITE.since`: year shown on the About page
- `MY_SITES`: sample site cards on the About page
- `PAGE_SIZE`: posts per listing page

The theme catalogue rejects real personal links and invented addresses that match the theme name. Use `example.com` and root URLs until you fork the theme for your own site.

## Deployment URL

`src/config.ts` and `astro.config.mjs` both read `PUBLIC_SITE_URL` and fall back to `https://example.com`. Set it at build time:

```bash
PUBLIC_SITE_URL=https://your-domain.example npm run build
```

This value feeds canonical URLs, Open Graph tags, RSS links, and sitemap entries. `public/robots.txt` contains a static sitemap URL; edit that file separately after you choose a domain.

## UI text

All interface strings live in `src/lib/i18n.ts` under `ui.zh` and `ui.en`. The English dictionary is typed against the Chinese one, so adding a key to only one locale produces a type error.

Path helpers in the same file:

- `localizePath(lang, path)` adds `/en` for English
- `langFromPath(pathname)` detects the current locale
- `alternatePath(pathname, lang)` builds the language-switch URL

The header switch links to the same page in the other language. Search, archives, tags, and pagination all use localized paths.

## Posts

Posts live in two content collections directories:

```text
src/content/posts/zh/
src/content/posts/en/
```

Each file needs this front matter:

```yaml
---
title: "Hello world"
description: "A short summary used in cards, RSS, and SEO."
pubDate: 2026-11-17
updatedDate: 2026-11-18 # optional
tags: ["astro", "cloudflare"]
categories: ["notes"]    # optional broad grouping
emoji: "🌸"              # optional card decoration
draft: false             # optional; drafts are visible in dev only
---
```

The slug comes from the filename without the language directory. For example, `zh/hello-world.md` becomes `/posts/hello-world`, and `en/hello-world.md` becomes `/en/posts/hello-world`.

`src/content.config.ts` validates the schema with Astro's `glob()` loader and `astro/zod`.

## Styling

`src/styles/global.css` defines all design tokens at the top of the file:

- `--pink-*`: sakura palette
- `--bg-*` / `--ink-*`: surfaces and text
- `--radius-*`, `--shadow-*`, `--ease-*`: shared shape and motion values

Dark mode is an attribute on `<html data-theme="dark">`. The no-flash script in `src/layouts/BaseLayout.astro` reads `localStorage.getItem('sakura-note-theme')` before paint.

Keep new animation on `transform` or `opacity`. Avoid animating `background-position` or full-screen filters; the current animation budget is documented in the main README.

## Avatar and OG image

- Replace `public/images/avatar.svg` with your own image.
- Regenerate `public/images/og-default.png` with `npm run og` after editing `tools/make-og.mjs`.

For the public theme demo, keep these generic.

## Cloudflare bindings

`wrangler.jsonc` declares the Worker name, static assets, D1, KV, R2, and Images bindings. After changing it, run:

```bash
npm run cf-typegen
```

Generated types are written to `worker-configuration.d.ts`. Do not edit that file by hand.
