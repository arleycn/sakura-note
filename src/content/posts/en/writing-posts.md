---
title: What to edit when you write a post
description: What every front-matter field does, how bilingual posts pair up, and tags vs categories.
pubDate: 2026-11-15
tags: ['Markdown', 'Content']
categories: ['Guides']
emoji: '✍️'
---

Create a `.md` file in `src/content/posts/en/`. The filename becomes part of the URL: `hello-world.md` is served at `/en/posts/hello-world`.

## Every front-matter field

```yaml
---
title: Post title           # required, max 120 chars
description: One-liner      # required, max 300 chars, used by cards and SEO
pubDate: 2026-11-15         # required, publish date
updatedDate: 2026-11-17     # optional, shows "Updated ..." next to the date
tags: ['Astro', 'CSS']      # optional, creates tag pages, drives related posts
categories: ['Guides']      # optional, broad bucket, display only
emoji: '✍️'                 # optional, decoration on the card
draft: false                # optional, true skips it in production builds
---
```

> These fields are validated by the zod schema in `src/content.config.ts`. A typo fails the build and names the file and field — bad data never reaches production.

## Tags vs categories

- **Tags**: fine-grained keywords. Every tag gets its own `/tags/<name>` page.
- **Categories**: display only, no page generated. Good for a single top-level split like "Guides / Getting started".

## How bilingual posts pair up

Use the same slug in both directories:

```
src/content/posts/
├── zh/writing-posts.md   →  /posts/writing-posts
└── en/writing-posts.md   →  /en/posts/writing-posts
```

Write `title` and `description` in each language; keep dates, tags and emoji identical. The language switch button finds the other version by swapping the prefix — **mismatched slugs make the switch land on a 404**.

## Writing conventions

- Use a single `#` only for the title; start sections at `##` so the TOC nests correctly
- Do not hand-write `<h2 id="...">`; anchors are generated
- Put images in `public/` and reference `/images/foo.png`; for build-time optimisation use `src/assets` with `<Image>`
- Always tag fenced code blocks with a language, otherwise you get no highlighting

## Preview and publish

```bash
npm run dev     # live preview, edits hot-reload
npm run build   # production build, validates front-matter
```

Mark work in progress with `draft: true`: still visible in `dev`, skipped by `build`.
