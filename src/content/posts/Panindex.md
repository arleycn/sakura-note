---
title: '记录宝塔安装 Panindex 网盘挂载程序'
description: '1、宝塔安装Docker 2、打开 Docker管理器，点击 镜像管理 - 获取镜像 - 官方库 3、输入 iicm/pan-index:latest 后点击 获取镜像 4、点击 容器列表 - 创建容器,配置如图，端口映…'
emoji: '📂'
pubDate: 2022-04-17T16:50:48+08:00
tags:
  - '宝塔'
  - 'Docker'
  - 'Panindex'
  - '网盘挂载'
  - '反代理'
categories:
  - '技术教程'
---
## 1、宝塔安装Docker


## 2、打开 Docker管理器，点击 镜像管理 -> 获取镜像 -> 官方库


<img src="/pic/77904517.webp" alt="" width="856" height="606" loading="lazy" decoding="async">

## 3、输入 `iicm/pan-index:latest` 后点击 获取镜像


## 4、点击 容器列表 -> 创建容器,配置如图，端口映射**随意**，目录映射`/app/data` || 随意


<img src="/pic/1315605677.webp" alt="" width="854" height="713" loading="lazy" decoding="async">

## 5、提交


## 6、添加PHP **纯静态** 站点，设置反代理


<img src="/pic/863967857.webp" alt="" width="453" height="348" loading="lazy" decoding="async">

<img src="/pic/4245710775.webp" alt="" width="789" height="573" loading="lazy" decoding="async">

## 7、完成！

[Panindex][1]

  [1]: https://github.com/libsgh/PanIndex
  [2]: /pic/77904517.jpg
  [3]: /pic/1315605677.jpg
  [4]: /pic/863967857.jpg
  [5]: /pic/4245710775.jpg
