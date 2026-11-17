---
title: '超简短PHP代码实现随机图API'
description: '1. 新建文件夹 【imgapi】（名字随意）后面访问网址会用到。 2. 新建【pic】文件夹用于存放随机的图片（随意），一定要放图片呀！ 3. 新建文件【index.php】，把以下代码复制进去保存。 4. 把 【im…'
emoji: '🖼️'
pubDate: 2022-04-17T16:28:30+08:00
tags:
  - '随机图API'
categories:
  - '技术教程'
---
## 1. 新建文件夹 【imgapi】（名字随意）后面访问网址会用到。

## 2. 新建【pic】文件夹用于存放随机的图片（随意），一定要放图片呀！

## 3. 新建文件【index.php】，把以下代码复制进去保存。

```php
<?php
$img_array = glob('pic/*.{gif,jpg,png,jpeg,webp,bmp}', GLOB_BRACE);
if(count($img_array) == 0) die(' 哎呀！你没给我图呀~'.dirname(__FILE__).'/pic/');
header('Content-Type: image/png');
echo(file_get_contents($img_array[array_rand($img_array)]));
?>
```

## 4. 把 【imgapi】放到网站根目录下，访问 *你的域名/imgapi* ,查看效果吧
