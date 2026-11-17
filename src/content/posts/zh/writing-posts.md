---
title: 写一篇文章要改哪些地方
description: front-matter 每个字段的含义、双语文章的对应关系、标签与分类的区别。
pubDate: 2026-11-15
tags: ['Markdown', '内容']
categories: ['指南']
emoji: '✍️'
---

在 `src/content/posts/zh/` 里新建一个 `.md` 文件，文件名就是 URL 的一部分：`hello-world.md` 对应 `/posts/hello-world`。

## front-matter 全部字段

```yaml
---
title: 文章标题          # 必填，最长 120 字
description: 一句话摘要   # 必填，最长 300 字，列表卡片和 SEO 都用它
pubDate: 2026-11-15      # 必填，发布时间
updatedDate: 2026-11-17  # 选填，填了会在日期旁显示「更新于」
tags: ['Astro', 'CSS']   # 选填，生成标签页，也用于文章底部「相关笔记」
categories: ['指南']      # 选填，大类，只展示不做独立页面
emoji: '✍️'              # 选填，卡片左上角的装饰符号
draft: false             # 选填，true 时生产构建会跳过
---
```

> 字段由 `src/content.config.ts` 里的 zod schema 校验。写错了构建会直接报错并指出哪一篇、哪个字段，不会带着脏数据上线。

## 标签和分类的区别

- **标签**：细粒度关键词，每种标签都会生成一个 `/tags/<名字>` 页面
- **分类**：只有展示，不生成页面。适合「指南 / 开始 / 折腾」这种一级划分

## 双语文章怎么放

同一个 slug 分别在两个目录里放一份：

```
src/content/posts/
├── zh/writing-posts.md   →  /posts/writing-posts
└── en/writing-posts.md   →  /en/posts/writing-posts
```

两篇的 `title` 和 `description` 各写各的语言，其余字段（日期、标签、emoji）保持一致。语言切换按钮就是靠「同 slug 换前缀」找到另一版的——**slug 不一致会导致切换后 404**。

## 写作时的几个约定

- 标题只用一级 `#`，正文里的章节从 `##` 开始，这样目录层级才对
- 不要手动写 `<h2 id="...">`，锚点由 Astro 自动生成
- 图片放 `public/` 下，用 `/images/xxx.png` 引用；要享受构建期压缩就改用 `src/assets` + `<Image>`
- 代码块一定要写语言标记，否则拿不到语法高亮

## 预览与发布

```bash
npm run dev     # 本地预览，改 md 即时刷新
npm run build   # 生产构建，顺带校验 front-matter
```

草稿加 `draft: true`，`npm run dev` 下仍然可见，`npm run build` 会跳过。
