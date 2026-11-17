---
title: '关于使用Infinity Free服务器开启伪静态的教程'
description: '关于使用Infinity Free服务器开启伪静态的教程 博客系统：[Typecho][1] 主题：[VOID][2] ---------- 在htdocs根目录下创建【.htaccess】文件，复制以下代码 伪静态代码…'
emoji: '🔧'
pubDate: 2021-08-29T00:00:00+08:00
tags:
  - '伪静态'
  - 'infinity free'
categories:
  - '技术教程'
---
**关于使用Infinity Free服务器开启伪静态的教程**

博客系统：[Typecho][1]
主题：[VOID][2]

----------

在htdocs根目录下创建【.htaccess】文件，复制以下代码
伪静态代码

```apache
    <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /index.php/$1 [L]
    </IfModule>
```


Https跳转代码

```apache
    <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{HTTP:X-Forwarded-Proto} =http
    RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    </IfModule>
```

保存后去网站后台开启伪静态，如果开启失败勾选强制开启，如下图

<img src="/pic/2740130554.webp" alt="" width="1005" height="518" loading="lazy" decoding="async">

正常情况下，.PHP会消失，伪静态开启成功。

  [1]: http://typecho.org/
  [2]: https://github.com/AlanDecode/Typecho-Theme-VOID/blob/master/README.md
