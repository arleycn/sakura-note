---
title: '如何使用免费服务器“Infinity Free”搭建博客网站'
description: 'Infinity Free 是一个免费虚拟服务器 Infinity Free官网：[Infinity Free][1] ---------- 目前可以免费创建三个虚拟服务器，每个虚拟服务器可以绑定不限数量网站，支持自定义…'
emoji: '🆓'
pubDate: 2021-08-29T00:00:00+08:00
tags:
  - 'infinity free'
categories:
  - '技术教程'
---
Infinity Free 是一个免费虚拟服务器

**Infinity Free官网：[Infinity Free][1]**

----------


目前可以免费创建三个虚拟服务器，每个虚拟服务器可以绑定不限数量网站，支持自定义域名，SSL等，可以说是白嫖服务器中最牛

之一。


<img src="/pic/3528256612.webp" alt="" width="1129" height="942" loading="lazy" decoding="async">
第一步：注册账户
---------
首先注册一个infinityfree，[点我直达][3]，没有过多的注册要求，门槛低。

<img src="/pic/3984282609.webp" alt="" width="494" height="696" loading="lazy" decoding="async">

第二步：创建虚拟机
---------
由于我已经注册使用两个了，正常可以注册三个，点击“Create Account”开始吧！

<img src="/pic/1362594425.webp" alt="" width="1349" height="102" loading="lazy" decoding="async">

默认使用他们的子域名，也可以使用自定义域名，前提是自定义域名已经绑定 Infinity free 的dns（需要在域名托管那里修改

dns为  **ns1.epizy.com**  **ns2.epizy.com**），填写域名后创建，进入账户管理界面，里面有创建好的 FTP账户、MySQL

账户和虚拟机IP等信息

<img src="/pic/821202805.webp" alt="" width="1304" height="392" loading="lazy" decoding="async">
<img src="/pic/3615714729.webp" alt="" width="1021" height="725" loading="lazy" decoding="async">

第三步：搭建网站
--------
目前他们自己的软件商店支持安装大部分网站系统，可以先去浏览看看有没有想要装的系统，点击上图中橙色按钮“Control Panel”

进入后台，第一次进入会有一个窗口，点 "I APPROVE"，先进入“Online File Manager”删除网站根目录下“htdocs”里的无用文件，

<img src="/pic/146729305.webp" alt="" width="1313" height="630" loading="lazy" decoding="async">

然后返回进入“Softaculous Apps Installer”，

<img src="/pic/353055742.webp" alt="" width="1098" height="604" loading="lazy" decoding="async">

<img src="/pic/2504557976.webp" alt="" width="1600" height="779" loading="lazy" decoding="async">
<img src="/pic/1075642989.webp" alt="" width="1600" height="634" loading="lazy" decoding="async">
支持的系统和环境还是挺多的，这里安装 “WordPress”，
<img src="/pic/2768914120.webp" alt="" width="1600" height="678" loading="lazy" decoding="async">
直接点“Install Now”，就可以啦，之后与其他安装的方式无异，需要的 MySQL 去信息页查看即可。

第四部：开启cloudflare CDN加速服务
------------------------

正常添加就好了，不会使用 cloudflare，坐等下期咯

最后附上官方问答教程：[infinityfree使用手册][13]


  [1]: https://infinityfree.net/
  [2]: /pic/3528256612.png
  [3]: https://app.infinityfree.net/register
  [4]: /pic/3984282609.png
  [5]: /pic/1362594425.png
  [6]: /pic/821202805.png
  [7]: /pic/3615714729.png
  [8]: /pic/146729305.png
  [9]: /pic/353055742.png
  [10]: /pic/2504557976.png
  [11]: /pic/1075642989.png
  [12]: /pic/2768914120.png
  [13]: https://support.infinityfree.net/domains-dns/cloudflare-shows-error-1016-origin-dns-error/
