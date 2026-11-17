---
title: 配置指南：改这五个文件就够
description: 站名域名、界面文案、配色、导航、社交链接——每个配置项在哪个文件、改了影响哪里。
pubDate: 2026-11-14
tags: ['Astro', '配置']
categories: ['指南']
emoji: '⚙️'
---

主题把配置集中到了五个地方。想换成自己的站，按顺序改一遍就行。

## 一、`src/config.ts`：站点身份

```ts
export const SITE = {
  url: 'https://example.com',   // 域名，canonical / sitemap / RSS / OG 都用它
  name: 'Sakura Note',          // 站名，出现在 logo、标题、页脚
  theme: 'Sakura Note',         // 主题名，只用于署名与 JSON-LD
  author: 'Sakura',             // 作者，用于 meta author 与关于页
  email: 'hello@example.com',
  github: 'https://github.com/example',
  since: 2026,                  // 建站年份，页脚版权区间
  repo: 'https://github.com/example/sakura-note',
};
```

同一个文件里还有 `NAV`（导航项）、`SOCIAL`（页脚社交链接）、`MY_SITES`（关于页的站点卡片）、`PAGE_SIZE`（每页文章数）。

> `SITE.url` 必须改。留着 `example.com` 会让 sitemap、canonical、OG 图地址全是错的。

## 二、`src/lib/i18n.ts`：界面文案

所有按钮、标题、提示语都在这里，按 `zh` / `en` 分成两份。想改措辞、或者只留一种语言，都只动这个文件。

```ts
const zh = {
  nav: { home: '首页', archives: '归档', /* ... */ },
  hero: { start: '开始阅读', rss: '订阅 RSS' },
  // ...
};
```

加一门新语言：在 `LANGS` 里加一项、补一份同构的字典、在 `LANG_LABEL` / `LANG_HTML` 里登记。

## 三、`src/styles/global.css`：配色与排版

文件顶部的 `:root` 就是全部设计变量：

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

深色在下面两处：`html[data-theme='dark']`（手动切换）和 `@media (prefers-color-scheme: dark)`（跟随系统）。**两处都要改**，否则跟随系统时会漏掉。

## 四、`astro.config.mjs`：域名与集成

```js
const SITE = 'https://example.com';   // 和 config.ts 的 url 保持一致
```

这里还控制 i18n 语言列表、代码高亮的双主题、sitemap 过滤规则、环境变量 schema。

## 五、`src/components/`：布局结构

想加一个导航项、换掉页脚布局、去掉「关于页的站点卡片」，改这里。组件里不硬编码文案，都从 `i18n.ts` 取——所以改文案不用碰组件。

## 改完自检

```bash
npm run check    # 类型与内容校验，应为 0 error
npm run build    # 构建，顺带验证 front-matter
```

再打开首页、随便一篇文章、`/en` 下的对应页面，看语言切换、深色模式、移动端三处有没有问题。
