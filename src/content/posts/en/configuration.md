---
title: 'Configuration: five files and you are done'
description: Site identity, UI copy, palette, navigation, social links — where each setting lives and what it affects.
pubDate: 2026-11-14
tags: ['Astro', 'Config']
categories: ['Guides']
emoji: '⚙️'
---

Configuration is collected in five places. To make the theme yours, work through them in order.

## 1. `src/config.ts` — site identity

```ts
export const SITE = {
  url: 'https://example.com',   // canonical / sitemap / RSS / OG all use this
  name: 'Sakura Note',          // logo, titles, footer
  theme: 'Sakura Note',         // credit line and JSON-LD only
  author: 'Sakura',             // meta author and the about page
  email: 'hello@example.com',
  github: 'https://github.com/example',
  since: 2026,                  // footer copyright range
  repo: 'https://github.com/example/sakura-note',
};
```

The same file holds `NAV` (navigation), `SOCIAL` (footer links), `MY_SITES` (cards on the about page) and `PAGE_SIZE` (posts per page).

> `SITE.url` is the one you must change. Leaving `example.com` makes sitemap, canonical and OG image URLs wrong.

## 2. `src/lib/i18n.ts` — UI copy

Every button, heading and message lives here, split into `zh` and `en`. Change wording, or drop a language, in this one file.

```ts
const zh = {
  nav: { home: '首页', archives: '归档', /* ... */ },
  hero: { start: '开始阅读', rss: '订阅 RSS' },
  // ...
};
```

To add a language: add it to `LANGS`, provide an isomorphic dictionary, and register it in `LANG_LABEL` / `LANG_HTML`.

## 3. `src/styles/global.css` — palette and type

The `:root` block at the top of the file holds every design token:

```css
:root {
  --pink: #ff6fa5;
  --grad-main: linear-gradient(120deg, #ff6fa5, #a06ee8 55%, #6fc3ff);
  --grad-sky: linear-gradient(160deg, #ffd7e9 0%, /* ... */);
  --bg-base: #ffd7e9;
  --text: #40323f;
  /* ... */
}
```

Dark mode appears twice: `html[data-theme='dark']` (manual toggle) and `@media (prefers-color-scheme: dark)` (system). **Change both**, otherwise system-dark users miss your edits.

## 4. `astro.config.mjs` — domain and integrations

```js
const SITE = 'https://example.com';   // keep in sync with config.ts
```

This file also controls the i18n locale list, dual-theme code highlighting, sitemap filtering and the env schema.

## 5. `src/components/` — structure

Add a nav item, restructure the footer, drop the about-page site cards — all here. Components never hardcode copy; they read from `i18n.ts`, so text changes never touch markup.

## Post-change checklist

```bash
npm run check    # types and content validation, expect 0 errors
npm run build    # build, also validates front-matter
```

Then open the home page, any post, and the `/en` counterpart — confirm language switching, dark mode and mobile all still behave.
