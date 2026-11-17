---
title: Every Markdown element, styled
description: Headings, lists, quotes, tables, code blocks, images — how the theme renders each Markdown element.
pubDate: 2026-11-16
tags: ['Markdown', 'Typography']
categories: ['Getting started']
emoji: '📐'
---

This post lays out every Markdown element the theme supports, so you can check the typography and compare against it when you change styles.

## Heading levels one to four

`##` and `###` inside a post feed the table of contents on the right (it only appears once there are more than two headings).

### Third level

#### Fourth level

## Paragraphs and inline styles

A normal paragraph, with **bold**, *italic*, ~~strikethrough~~, `inline code`, and [a link](https://example.com).

Body line height is 1.75 and paragraph spacing comes from `margin` rather than empty `<p>` tags, so gaps never look uneven.

## Unordered list

- First item
- A slightly longer second item, to check that wrapped lines keep a proper hanging indent
  - Nested item
  - Another nested item
- Third item

## Ordered list

1. Prepare
2. Process
3. Wrap up

## Blockquote

> A quote gets a pink rule on the left and a background one step lighter than the body.
>
> Multiple paragraphs work too.

## Table

| Capability | Build time | Runtime | Note |
|---|---|---|---|
| Post pages | ✅ | — | Static HTML from the edge |
| Tag pages | ✅ | — | Pre-generated per tag |
| Search | — | ✅ | Reads the query string |
| Comments | — | ✅ | D1 read/write |
| View counts | — | ✅ | KV counter |

On narrow screens the table scrolls horizontally instead of breaking the layout.

## Code blocks

```ts
// Fenced blocks with a language tag get dual-theme highlighting:
// github-light by day, github-dark at night.
export async function getPosts(lang: 'zh' | 'en' = 'zh') {
  const posts = await getCollection('posts');
  return posts
    .filter((post) => isPublished(post) && langOf(post) === lang)
    .sort(byDateDesc);
}
```

```bash
# Development
npm run dev

# Build with type checking
npm run check && npm run build
```

Long lines never break the container — code blocks scroll inside themselves.

## Images

![A sample illustration showing image corner radius and shadow](/images/sample-figure.svg)

Images are block-level, centered, with rounded corners and a very soft shadow.

## Horizontal rule

---

Everything above covers the syntax you will actually use day to day.

## Footnotes and extras

The theme ships no extra Markdown plugins, so footnotes or math need your own `remark` / `rehype` plugin. That is one line in the Astro config — no theme code changes required.
