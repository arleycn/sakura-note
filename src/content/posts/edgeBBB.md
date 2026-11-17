---
title: '新版本Edge隐藏右上角B'
description: '由于未关闭edge浏览器自动更新，当我打开浏览器弹出的更新介绍，我蒙了；虽说新版本固然好用，但习惯了原版看到右上角的"B"太丑了，于是开始整活。 如何隐藏侧边栏及浏览器右上角“B” 以下文本保存为 .reg 文件后双击导…'
emoji: '🧭'
pubDate: 2023-03-16T21:21:21+08:00
tags:
  - 'Edge'
  - 'WIN11'
  - '浏览器'
categories:
  - '技术教程'
---
> 由于未关闭edge浏览器自动更新，当我打开浏览器弹出的更新介绍，我蒙了；虽说新版本固然好用，但习惯了原版看到右上角的"B"太丑了，于是开始整活。



## 如何隐藏侧边栏及浏览器右上角“B”

以下文本保存为 .reg 文件后双击导入注册表：

```
Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge]
"HubsSidebarEnabled"=dword:00000000
```
如果未生效请在浏览器地址栏输入代码：`edge://policy/`，重新加载策略。
之前我打包过一个一键删除恢复的 bat，云盘迁移后没保留，就不放了。想恢复的话，把 `HubsSidebarEnabled` 改回 `dword:00000001` 重新加载策略即可，改注册表需要管理员权限。


附丑图，及美化后
<img src="/pic/edge1.webp" alt="" width="1600" height="1013" loading="lazy" decoding="async">
<img src="/pic/edge2.webp" alt="" width="1600" height="1013" loading="lazy" decoding="async">




  [1]: /pic/edge1.png
  [2]: /pic/edge2.png
