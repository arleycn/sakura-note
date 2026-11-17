---
title: Meet Sakura Note
description: A sakura-themed Astro 7 blog theme — content built at build time, interactions on the Cloudflare edge.
pubDate: 2026-11-17
tags: ['Astro', 'Cloudflare']
categories: ['Getting started']
emoji: '🌸'
---

Sakura Note is a sakura-flavoured blog theme for Astro 7. It splits the site into two paths: posts are rendered to static HTML at build time and served straight from the edge; only things that actually need read/write — comments and view counts — go through a Worker.

## What you get

- **No client-side framework**: no React or Vue anywhere, just one ~14 KB site script
- **Content collections**: Markdown in `src/content/posts/`, front-matter validated with zod
- **Official client-side routing**: `<ClientRouter />` plus hover prefetch — no full page reloads
- **Official Actions**: comments and view counts use type-safe RPC instead of hand-rolled fetch wrappers
- **Dark mode**: follows the system, can also be toggled manually, remembered locally
- **Bilingual**: Chinese at the root, English under `/en`

## The details you can see in one screen

A sakura gradient sky, drifting petals, journal-style cards, sticky-note comments. All of that lives in plain CSS and one short canvas script — no animation library.

> Decoration is there to frame the content. That is why the prose area stays deliberately restrained: 1.75 line height, 16px body text, dual-theme code blocks, horizontally scrollable tables.

## Where to go next

| I want to | Go to |
|---|---|
| Change site name, domain, author | `src/config.ts` |
| Change UI copy | `src/lib/i18n.ts` |
| Write my first post | `src/content/posts/en/` |
| Change the palette | `:root` at the top of `src/styles/global.css` |
| Deploy | the "Deploy to Cloudflare" post |

The code is MIT licensed. Change whatever you like.
