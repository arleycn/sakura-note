---
title: '如何打造免费的私人网盘挂载服务'
description: '摘要 收藏了一些各大网盘挂载服务的github项目，各有各的优缺点，这里简单概括下: - TeambitionShare，只能挂载阿里云盘旗下的 Teambition 网盘，部署方式需要php服务器 - OneManag…'
emoji: '💾'
pubDate: 2022-04-13T00:00:00+08:00
tags:
  - '网盘挂载'
  - 'onedrive'
  - 'aliyunpan'
  - 'teambition'
  - 'Onemanage'
  - 'sharelist'
  - 'panindex'
  - 'oneindex'
  - 'zfile'
  - 'TeambitionShare'
  - 'onedrive-vercel-index'
  - 'cloudreve'
categories:
  - '建站相关'
---
## 摘要

  收藏了一些各大网盘挂载服务的github项目，各有各的优缺点，这里简单概括下:
  
- [TeambitionShare](https://github.com/FlxSNX/TeambitionShare)，只能挂载阿里云盘旗下的 Teambition 网盘，部署方式需要php服务器
- [OneManager](https://github.com/qkqpttgf/OneManager-php)可挂载onedrive、谷歌云盘、阿里云盘，部署方式很多，免费，推荐
- [sharelist](https://github.com/reruin/sharelist)支持多家网盘，包括不限于天翼云盘、阿里云盘、onedrive、谷歌云盘、teambition、蓝奏云、和彩云、本地云...部署方式需要服务器
- [oneindex](https://github.com/Layne666/oneindex)仅支持onedrive网盘挂载，部署需要php服务器
- [PanIndex](https://github.com/libsgh/PanIndex)支持天翼云、teambition盘、阿里云盘、OneDrive、和彩云、本地云等，部署略难，需要服务器，支持heroku部署，效果不太好，免费的限制很多
- [zfile](https://github.com/zhaojun1998/zfile)支持OneDrive、云存储、私有云、对象存储、h5ai等部署需要服务器
- [Cloudreve](https://github.com/cloudreve/Cloudreve)很强，自行进入项目查看，不太推荐个人使用
- [onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index)仅支持onedrive,部署方式vercel,强推，本站使用的就是此项目，支持全局搜索

这里只介绍如何使用`onedrive-vercel-index`搭建私人云盘！

## onedrive-vercel-index搭建私人网盘
这里有个前提，你有`onedrive`,[Microsoft Azure](https://portal.azure.com/#home)，`vercel`,
### 1.Fork项目
首先fork [onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index)，
### 2.修改配置
修改`onedrive-vercel-index/config/site.config.js` 里的 userPrincipleName 改为你的微软账户邮箱，`baseDirectory` 修改为你要分享的文件夹路径，默认根目录就行。

- `config/site.config.js`是用来定制你的网页的
- `config/api.config.js`是用来定义 API 参数的
- `userPrincipalName`是用来在 OAuth 步骤时认证你的个人信息的。通常是你的 微软账户邮箱。
- `baseDirectory`是你要分享的 OneDrive 目录。你必须保证此目录有效且与此参数一致。（你可以直接在 OneDrive 内创建一个叫做 Public 文件夹，并将此项设置为 /Public。）

### 3.创建自己的api
- 进入[Microsoft Azure](https://portal.azure.com/#home)，找到`应用注册`点`新注册`，名称随意，`受支持的帐户类型`选择`任何组织目录(任何 Azure AD 目录 - 多租户)中的帐户和个人 Microsoft 帐户(例如，Skype、Xbox)` `重定向URL`选择`Web` 填写`http://localhost`，注册
- 进入刚注册的应用找到`API权限`，在当前的权限下点击`Microsoft Graph(1)`新加`offline_access` `Files.Read.All`完了保存`更改`

### 4.创建`证书和密码`
- 进入`证书和密码` `新客户端密码`，选择日期尽量最大，目前没有不限时间的选项了
- 记住`值`，关了可就没了啊
api应用`应用程序(客户端) ID`在 `概述`下，值是密码
至此自己的api都已获得，去修改`api.config.js`吧

### 5.修改`api.config.js`
- 加密token,[AES加密](https://www.sojson.com/encrypt_aes.html)
- 修改`clientId`为上面的`应用程序(客户端) ID`
- 修改`obfuscatedClientSecret`为加密后的值

### 导入项目
- 注册登录vercel并导入项目
- 修改 `Build command` 为 `pnpm build`修改 `Install command` 为 `pnpm install`
- 部署


### 6.注册添加`REDIS_URL`环境变量
[Upstash](https://vercel.com/integrations/upstash)进入注册，用`vercel`注册登录，需要登录就用`Github`，环境变量应用于已导入的项目，完成后重新部署项目，部署成功后点链接注册，全程跟着做就好。

[官方文档](https://ovi.swo.moe/zh/docs/getting-started)

有问题联系我！
