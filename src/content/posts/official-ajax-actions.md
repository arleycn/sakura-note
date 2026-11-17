---
title: "官方版 Ajax：ClientRouter + Actions 怎么配合"
description: "不手写 fetch，也不引前端框架：用 Astro 官方的客户端路由与动作层，把无刷新导航和表单交互一次做完。"
pubDate: 2026-11-06
tags: ["Astro", "交互", "Actions"]
emoji: "⚡"
---

「官方版 ajax」在本站指两件事，都不是自己写 XMLHttpRequest：

1. **页面切换**：`<ClientRouter />` 接管站内链接，无刷新替换 DOM；
2. **数据交互**：`actions.xxx()` 直接调用服务端函数，自动做 JSON 序列化与 Zod 校验。

## 客户端路由

布局 `<head>` 里放一行就够：

```astro
---
import { ClientRouter } from 'astro:transitions';
---
<head>
  <ClientRouter />
</head>
```

之后站内 `<a>` 变成 SPA 式跳转，脚本要挂在 `astro:page-load` 上才会在每次导航后重新执行：

```js
document.addEventListener('astro:page-load', () => {
  // 首次加载 + 每次前进/后退都会跑到这里
});
```

这一步是必须的：`DOMContentLoaded` 只触发一次，ClientRouter 换页后不会再触发。

## 动作层

服务端定义：

```ts
import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';

export const server = {
  views: {
    hit: defineAction({
      input: z.object({ postId: z.string().max(120) }),
      handler: async ({ postId }, ctx) => {
        // 服务端逻辑
        return { views: 1 };
      },
    }),
  },
};
```

客户端调用：

```js
import { actions } from 'astro:actions';

const { data, error } = await actions.views.hit({ postId: 'hello' });
if (error) return;
console.log(data.views);
```

没有手写 URL、没有手写 `JSON.stringify`、没有手写 `res.ok` 判断。

## 两个容易忽略的点

- **表单动作要求页面按需渲染**。静态页面上 `<form action={actions.x}>` 会 POST 回静态文件，拿不到处理。静态页要用 RPC 调用。
- **Actions 是公开端点**。每个 action 都相当于一个 API，必须在 handler 里自己做鉴权、限流、人机校验。

> 判断标准：能力是官方的就用官方封装，只有官方覆盖不到的地方才手写，并且写清为什么。
