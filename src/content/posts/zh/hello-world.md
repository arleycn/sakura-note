---
title: 认识 Sakura Note
description: 一套樱花主题的 Astro 7 博客模板：内容构建期生成，交互走 Cloudflare 边缘。
pubDate: 2026-11-17
tags: ['Astro', 'Cloudflare']
categories: ['开始']
emoji: '🌸'
---

Sakura Note 是一套以樱花为底色的 Astro 7 博客模板。它把「内容」和「交互」分成两条路：文章在构建期生成静态 HTML，直接由边缘节点返回；评论、阅读量这类需要读写的部分才走 Worker。

## 它做了什么

- **零客户端框架**：全站没有 React / Vue，只有一个 14 KB 左右的站点脚本
- **内容集合**：Markdown 放在 `src/content/posts/` 下，zod 校验 front-matter
- **官方无刷新导航**：`<ClientRouter />` 加悬停预取，切页面不整页刷新
- **官方 Actions**：评论与阅读量走类型安全的 RPC，不手写 fetch 封装
- **深色模式**：跟随系统，也能手动切换，切换后记忆在本地
- **双语**：中文不带前缀，英文在 `/en` 下

## 一屏能看到的细节

樱花渐变天空、飘落的花瓣、手帐质感的卡片、便签风格的留言板。这些都在 CSS 与一份很短的 canvas 脚本里，没有引入任何动画库。

> 装饰是用来衬托内容的。所以正文区的排版刻意克制：行高 1.75、正文字号 16px、代码块双主题、表格可横向滚动。

## 接下来看什么

| 想做的事 | 去这儿 |
|---|---|
| 改站名、域名、作者 | `src/config.ts` |
| 改界面文案 | `src/lib/i18n.ts` |
| 写第一篇文章 | `src/content/posts/zh/` |
| 换配色 | `src/styles/global.css` 顶部的 `:root` |
| 部署 | 看「部署到 Cloudflare」一篇 |

代码在仓库里，MIT 许可，随便改。
