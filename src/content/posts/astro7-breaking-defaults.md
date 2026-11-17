---
title: "Astro 7 升级清单：那些会静默改变输出的默认值"
description: "Sätteri 取代 remark、compressHTML 默认 'jsx'、Rust 编译器收紧 HTML 校验——升级到 v7 必须逐条核对的变化。"
pubDate: 2026-11-14
tags: ["Astro", "升级"]
emoji: "🧪"
---

Astro 7 最危险的地方不是新 API，而是**默认值变了但不报错**。下面几条是实测会影响渲染结果或构建能否通过的。

## 1. Markdown 处理器换成 Sätteri

v7 默认用内置的 Sätteri 渲染 `.md` / `.mdx`，`@astrojs/markdown-remark` 不再随包安装。

- 不用 remark / rehype 插件 → 无需改动。
- 用了插件 → 要么移植到 Sätteri 的 MDAST/HAST 插件，要么装回 `@astrojs/markdown-remark` 并显式 `markdown.processor: unified()`。

## 2. compressHTML 默认从 true 变成 'jsx'

JSX 规则会删掉行内元素之间的空白，`<span>hello</span><em>world</em>` 在 v7 会渲染成 `helloworld`。中文排版对空格更敏感，建议显式写回：

```js
export default defineConfig({
  compressHTML: true,
});
```

## 3. Rust 编译器：未闭合标签直接报错

旧的 Go 编译器会默默补标签、默默纠正非法嵌套。Rust 编译器不做这些：

- 非空元素必须有闭合标签；
- `<p>` 里塞 `<div>` 这种非法嵌套不再被重排，交给浏览器处理，布局可能和以前不同。

升级后第一件事是跑构建，看有没有 unexpected token。

## 4. `src/fetch.ts` 成了保留文件名

v7 的高级路由会把它当配置文件自动加载。如果项目里正好有同名工具文件，要么改名，要么：

```js
export default defineConfig({
  fetchFile: null, // 关闭高级路由
});
```

## 5. `@astrojs/db` 已移除

不再维护，直接用目标平台的数据库驱动（本站是 D1）。

## 迁移顺序

1. `npx @astrojs/upgrade` 同步核心与官方集成；
2. 跑构建，先修编译错误；
3. 逐页目视核对行内空格与嵌套；
4. 最后再考虑新特性（routeRules、缓存、高级路由）。

> 升级不是「能 build 就完事」：默认值的变化不会报错，只会安静地改掉你的输出。
