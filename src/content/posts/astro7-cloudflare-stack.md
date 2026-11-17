---
title: "Astro 7 + Cloudflare 全家桶：这套博客是怎么搭起来的"
description: "静态内容走边缘、动态能力走 Worker：一次讲清 Astro 7 与 Workers、D1、KV、R2、Images 的分工与边界。"
pubDate: 2026-11-17
tags: ["Astro", "Cloudflare", "架构"]
emoji: "🏗️"
---

做博客最容易踩的坑，是把「写文章」和「跑服务」混在一起：为了一个评论框，整站变成 SSR，每篇文章都要过一次 Worker，白白把边缘缓存让出去。

这套站点的原则很简单：**内容是构建期产物，交互是运行时能力。**

## 分工表

| 层 | 用什么 | 负责什么 |
|---|---|---|
| 页面 | Astro 内容集合 + `prerender = true` | 文章、列表、标签、归档，构建期出 HTML |
| 边缘 | Workers Static Assets | 静态资产直接从边缘返回，不消耗 Worker 调用 |
| 交互 | Astro Actions | 评论、浏览量，类型安全的服务端函数 |
| 数据 | D1 | 评论正文与索引 |
| 计数 | KV | 阅读量，读多写少 |
| 图片 | R2 + Images binding | 评论配图存储与运行期变换 |
| 人机校验 | Turnstile | 评论防刷 |

## 为什么内容页要预渲染

`output: 'server'` 只代表「默认按需渲染」，不代表每页都必须跑服务端。内容页加一行：

```astro
---
export const prerender = true;
---
```

构建后就是 `dist/posts/xxx/index.html`，由 Static Assets 直接命中，TTFB 与纯静态站没有区别。动态页面（搜索、媒体代理）保持默认，只在真正需要时才起 Worker。

## 为什么交互不用自己写接口

Astro Actions 把「定义服务端函数 → 生成端点 → 客户端调用 → 输入校验」收成一条链路，返回 `{ data, error }`。相比手写 `fetch('/api/...')`，少了三件事：自己拼 URL、自己校验入参、自己维护请求/响应的类型。

## 一条边界

预渲染页面上用 `<form action={actions.x}>` 是不行的——表单会 POST 回当前页面，而当前页面是静态文件。这种场景要么把页面改成按需渲染，要么在客户端用 Actions 的 RPC 调用（本站评论走的是后者）。

> 结论：能用构建期解决的，别拖到运行时；必须运行时的，用官方动作层，不要自建一套 HTTP 协议。
