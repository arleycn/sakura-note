---
title: '超简短PHP代码实现随机一言API'
description: '1、新建文件夹onesay（你可以设置其他名称），onesay根目录新建index.php; 2、复制下列代码到index.php： 3、onesay根目录新建onesay.txt文件，添加你喜欢的一言短句，这是我收藏的…'
emoji: '💬'
pubDate: 2022-04-17T13:44:31+08:00
tags:
  - '一言'
  - 'PHP代码'
  - 'API'
categories:
  - '技术教程'
---
## 1、新建文件夹**onesay**（你可以设置其他名称），**onesay**根目录新建**index.php**;
## 2、复制下列代码到**index.php**：

```php
<?php
$path = dirname(__FILE__);
$file = file($path."/onesay.txt");
$arr  = mt_rand( 0, count( $file ) - 1 );
$content  = trim($file[$arr]);
if (isset($_GET['charset']) && !empty($_GET['charset'])) {
    $charset = $_GET['charset'];
    if (strcasecmp($charset,"gbk") == 0 ) {
        $content = mb_convert_encoding($content,'gbk', 'utf-8');
    }
} else {
    $charset = 'utf-8';
}
header("Content-Type: text/html; charset=$charset");
if ($_GET['format'] === 'js') {
    echo "function onesay(){document.write('" . $content ."');}";
} else {
    echo $content;
}
```


3、**onesay**根目录新建**onesay.txt**文件，添加你喜欢的一言短句，这是我收藏的[onesay][1]；

4、以上完成后把**onesay**放到你可以方便访问的服务器下，我放到了网站根目录下，这时候访问`https://域名.cn/onesay/`就可以看到输出内容了,如下：

[https://onesayapi.vercel.app/api][2]

5、在需要显示一言的地方添加以下代码：

```
<script type="text/javascript" src="https://域名.cn/onesay/?format=js&charset=utf-8"></script>
<div id="onesay"><script>onesay()</script></div>

```




目前已托管到 `vercel` ，项目地址：[onesayapi][3]

  [1]: https://github.com/arleycn/onesayapi/blob/source/api/onesay.txt
  [2]: https://onesayapi.vercel.app/
  [3]: https://github.com/arleycn/onesayapi
