---
title: Markdown 排版全展示
description: 标题、列表、引用、表格、代码块、图片、脚注——主题对每种 Markdown 元素的具体样式。
pubDate: 2026-11-16
tags: ['Markdown', '排版']
categories: ['开始']
emoji: '📐'
---

这一篇把主题支持的 Markdown 元素一次排开，方便你检查排版细节，也方便改样式时做对照。

## 一到四级标题

正文里的 `##` 与 `###` 会自动进入右侧目录（超过两个标题才显示）。

### 三级标题

#### 四级标题

## 段落与行内样式

普通段落。里面有 **加粗**、*斜体*、~~删除线~~、`行内代码`，以及[一个链接](https://example.com)。

中文排版的行高是 1.75，段间距靠 `margin` 而不是空 `<p>`，所以不会出现「段与段之间忽大忽小」。

## 无序列表

- 第一项
- 第二项，稍微长一点，看看换行后的悬挂缩进是否对齐
  - 嵌套项
  - 另一个嵌套项
- 第三项

## 有序列表

1. 准备
2. 处理
3. 收尾

## 引用

> 引用块的左边是一条粉色竖线，背景比正文浅一档。
>
> 多行引用同样适用。

## 表格

| 能力 | 构建期 | 运行期 | 备注 |
|---|---|---|---|
| 文章页 | ✅ | — | 静态 HTML，边缘直出 |
| 标签页 | ✅ | — | 按标签预生成 |
| 搜索 | — | ✅ | 读 URL 查询参数 |
| 评论 | — | ✅ | D1 读写 |
| 阅读量 | — | ✅ | KV 计数 |

表格在窄屏会横向滚动，不会撑破布局。

## 代码块

```ts
// 带语言标记的代码块会用双主题高亮：日间 github-light，夜间 github-dark
export async function getPosts(lang: 'zh' | 'en' = 'zh') {
  const posts = await getCollection('posts');
  return posts
    .filter((post) => isPublished(post) && langOf(post) === lang)
    .sort(byDateDesc);
}
```

```bash
# 开发
npm run dev

# 构建 + 类型检查
npm run check && npm run build
```

长行不会撑破容器，代码块内部横向滚动。

## 图片

![一张示例插图，说明图片在正文里的圆角与阴影](/images/sample-figure.svg)

图片默认块级居中、圆角、带一层很淡的阴影。

## 分隔线

---

分隔线以上的内容已经覆盖了日常写作会用到的全部语法。

## 脚注与细节

主题没有额外引入 Markdown 插件，所以脚注、数学公式这类扩展语法需要自己装 `remark` / `rehype` 插件。Astro 的配置里加一行即可，不必改主题代码。
