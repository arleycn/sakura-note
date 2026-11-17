---
title: "樱花主题的实现细节：渐变天空、花瓣与响应式"
description: "从樱云导航借来的一套视觉语言，怎么在博客上落地，又不把首屏性能和可访问性拖下水。"
pubDate: 2026-11-02
tags: ["设计", "CSS", "性能"]
emoji: "🌸"
---

这套主题的基因来自 [樱云导航](https://bm.arley.cn)：樱粉渐变天空、星点、飘过的云、落樱 canvas、糖果色按钮、手帐风便签。搬到博客上需要重新考虑三件事：阅读、性能、移动端。

## 视觉层用固定定位，不占文档流

天空、星点、云、花瓣四层都是 `position: fixed` + 负 `z-index`，正文永远在它们之上：

```css
.sky { position: fixed; inset: 0; z-index: -3; }
.stars { position: fixed; inset: 0; z-index: -2; }
.petal-canvas { position: fixed; inset: 0; z-index: -1; }
```

好处是滚动时不需要重绘背景，`background-attachment: fixed` 那套卡顿问题直接规避。

## 花瓣用 canvas，但必须能被关掉

花瓣是一个 40 个粒子的 canvas 池，低端设备按 `hardwareConcurrency` 减半，移动端降低密度。两条硬规则：

- `prefers-reduced-motion: reduce` 时**完全不启动**动画循环；
- 页面切到后台（`visibilitychange`）时暂停，回来再继续。

```js
if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
```

## 深色模式只换变量

所有颜色走 CSS 变量，`:root` 是日间，`html[data-theme='dark']` 是夜间。组件里不写死颜色，切换时只改 `<html>` 上的属性。

跟随系统的用户没有 `data-theme` 属性，所以夜间样式要写两路：

```css
html[data-theme='dark'] .note { background: #3a2d50; }
@media (prefers-color-scheme: dark) {
  html:not([data-theme='light']) .note { background: #3a2d50; }
}
```

只写属性一路，是最常见的「系统深色下背景不切换」bug。

## 响应式断点

- `1120px`：正文最大宽度，桌面双栏（正文 + 目录）；
- `900px`：目录收起，改为文末折叠；
- `760px`：导航折叠成菜单，卡片单列；
- `380px`：缩小字号与间距，避免按钮换行挤压。

移动端高度一律用 `100dvh`，不用 `100vh`——后者在移动浏览器地址栏收起时会跳。

## 阅读优先

主题再花，正文也必须克制：卡片有圆角和阴影，正文区保持纯色底、足够行高（1.85）、最大 68 个字符宽度。动效只用在进入和悬停，且都能被 `prefers-reduced-motion` 关掉。

> 装饰是给第一眼的，排版是给读下去的。两者冲突时，让排版赢。
