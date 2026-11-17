---
title: The animation budget — why nine of them got cut
description: Measure with A/B switches, then keep only what earns its frame. Full before/after numbers included.
pubDate: 2026-11-11
tags: ['CSS', 'Performance']
categories: ['Internals']
emoji: '📊'
---

A sakura theme drifts naturally toward stacked decoration. The first version had ten always-on `infinite` animations: a drifting gradient sky, twinkling stars, three drifting clouds, bobbing icons, a flowing gradient button.

It felt sluggish even locally. So instead of guessing, I measured.

## A/B switches first

I turned suspicious features off one at a time, same route, same measurement:

| Variant | Main thread | Style recalc | p95 frame |
|---|---|---|---|
| Everything on (10 animations) | 362.8 ms | 57.2 ms | 11.4 ms |
| Only `backdrop-filter` off | 355.1 ms | 51.7 ms | 11.5 ms |
| Only canvas petals off | 336.8 ms | 58.3 ms | 9.0 ms |
| Only the persistent animations off | **170.4 ms** | **8.0 ms** | **7.5 ms** |

The result is counter-intuitive: the frosted glass costs 2%. **The persistent animations were the whole problem.**

## Why `background-position` is so expensive

`sky-drift` and `grad-flow` animated `background-position`:

```css
.backdrop__sky {
  background: var(--grad-sky);
  background-size: 200% 200%;
  animation: sky-drift 30s ease-in-out infinite alternate;
}
```

`transform` and `opacity` can be handed to the compositor. `background-position` cannot — it forces the main thread to re-rasterise that region. The sky is full-screen, and so are the button and footer gradients, so it was repainting half the viewport every frame.

`twinkle` had the same issue: a full-screen element continuously changing `opacity` keeps re-compositing the whole layer.

## What changed

- Removed the three `background-position` / full-screen `opacity` animations; the gradient and stars are now static
- Petals dropped to 30fps (24fps on low-end), DPR capped at 1.5, count from 36 down to 26
- Clouds went from three to two, keeping only `transform` — that one is compositor-friendly
- Page entrance went from 550ms plus a translate to a 150ms pure fade (translation triggers extra compositing)
- Removed the duplicated fixed gradient on `body`; the backdrop layer paints it once

## Result

| Metric | Before | After |
|---|---|---|
| Main thread | 362.8 ms | 120.4 ms |
| Style recalc | 57.2 ms | 19.7 ms |
| Longest frame | 69.9 ms | 24.2 ms |
| Dropped frames (>33ms) | 1 | 0 |
| Always-on animations | 10 | 3 |

Visually there is almost no difference — same sky, same stars, petals still drift. What went away is the per-frame paint cost.

> The test is not "does this effect look good" but "is this effect worth this frame". Anything the compositor can handle stays; anything that forces a main-thread repaint goes.
