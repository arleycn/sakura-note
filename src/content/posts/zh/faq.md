---
title: 常见问题
description: 能不能只用一种语言、能不能换掉 Cloudflare、评论能不能关、配图放哪——几个高频问题。
pubDate: 2026-11-10
tags: ['FAQ']
categories: ['指南']
emoji: '💬'
---

## 我只想要中文，能删掉英文吗？

可以。三步：

1. `astro.config.mjs` 里把 `locales` 改成 `['zh']`
2. 删掉 `src/pages/en/` 整个目录
3. `src/lib/i18n.ts` 里删掉 `en` 字典

语言切换按钮会自动消失——它判断的是 `LANGS.length > 1`。

## 不想用 Cloudflare，能换别的吗？

能。路由和页面是纯 Astro 的，只有三处跟 Cloudflare 绑着：

- `astro.config.mjs` 的 adapter
- `src/actions/index.ts` 里的 D1 / KV 调用
- `wrangler.jsonc`

换成纯静态的话，把 `output` 改成 `'static'`、删掉 adapter 和 `src/actions`、把评论组件拿掉，`npm run build` 出来的 `dist/` 扔到任何静态托管都能跑。

## 评论能整个关掉吗？

可以。文章页里删掉这一行：

```astro
<Comments postId={post.id} />
```

再删掉 `src/components/Comments.astro`、`src/actions/index.ts` 里的 `comments` 部分、`src/lib/db.ts`。阅读量在 `post__views` 那个 span 里，一并删掉即可。

## 配图放 `public/` 还是 `src/assets/`？

- **`public/`**：文件原样复制，路径不变，适合已经在别处引用过的图
- **`src/assets/`**：可以走 Astro 的图片优化（压缩、响应式、AVIF/WebP），但要用 `<Image>` 组件引用

主题默认走前者，因为示例文章里的图是外链资源。想让首屏更轻，建议迁移到后者。

## 为什么我的文章页没有右侧目录？

目录只在 `##` 和 `###` 标题**超过两个**时才出现。检查一下正文里是不是只写了一级 `#`——一级标题不计入目录。

## 构建报 `front-matter` 校验失败？

zod 会指出文件名和字段。最常见的原因是：

- `pubDate` 写成了 `2026-13-01` 这种不存在的日期
- `tags` 用了字符串而不是数组（应该写 `tags: ['Astro']`）
- `description` 超过 300 字

## 深浅色只改了一半，跟随系统的用户看到的是旧配色？

`global.css` 里深色定义在**两个地方**：`html[data-theme='dark']`（手动切换走这条）和 `@media (prefers-color-scheme: dark)`（跟随系统走这条）。两处都要改。

## 部署后 `/search` 返回 404，本地却正常？

这是 Workers Static Assets 的行为：导航请求优先匹配静态文件，没命中就返回 404 页，Worker 没被调用。在 `wrangler.jsonc` 的 `assets.run_worker_first` 里加上 `/search`、`/media/*`、`/_actions/*` 即可。详见「部署到 Cloudflare」。
