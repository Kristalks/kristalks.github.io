# Kris 讲明白了 · 个人科技博客

纯静态博客：HTML + CSS + 少量 JavaScript，文章用 Markdown 写。不需要安装任何框架。

## 目录结构

```
index.html        首页（文章列表、搜索、标签筛选）
post.html         文章页（渲染 Markdown）
about.html        关于页
assets/style.css  样式（支持深色模式）
assets/app.js     脚本（开场动画、主题、字号、文章渲染）
assets/fonts/     本地字体
assets/lib/       Markdown 渲染库（marked）
posts/posts.json  文章目录
posts/*.md        文章正文
```

## 本地预览

浏览器不允许直接双击打开的页面读取本地文件，所以需要起一个小服务器：

```bash
python3 -m http.server 8000
```

然后打开 http://localhost:8000

## 写一篇新文章

1. 在 `posts/` 下新建 `my-post.md`，用 Markdown 写正文（标题不用写，会自动显示）
2. 在 `posts/posts.json` 里加一条：

```json
{
  "slug": "my-post",
  "title": "文章标题",
  "date": "2026-12-01",
  "tags": ["AI"],
  "summary": "一句话简介"
}
```

`slug` 要和文件名一致。加上 `"draft": true` 可以先隐藏不发布。

## 发布上线（大陆 + 海外都能访问）

本博客**不依赖任何外部网站**：字体在 `assets/fonts/`，Markdown 渲染脚本在 `assets/lib/`。所以在大陆不会因为 Google 字体或外部 CDN 被墙而白屏。

### 第一阶段：GitHub Pages + 自己的域名（免费，推荐先这样）

1. 注册 github.com，新建公开仓库，名字填 `你的用户名.github.io`
2. **Add file → Upload files**，把博客文件夹里的所有内容拖进去（`.claude` 文件夹不用传），点 Commit
3. **Settings → Pages**：Source 选 `Deploy from a branch`，分支 `main`，目录 `/ (root)`
4. 一两分钟后打开 `https://你的用户名.github.io`

**强烈建议绑定自己的域名**（一年几十元，阿里云 / 腾讯云 / Cloudflare 都能买）：
- `github.io` 这类公共域名在大陆偶尔会被干扰，自己的域名稳定得多
- 以后换托管平台，读者的网址也不用变
- 绑定方法：Settings → Pages → Custom domain 填入域名；在域名商那里加一条 CNAME 记录指向 `你的用户名.github.io`；勾选 Enforce HTTPS

上线后用 **itdog.cn** 或 **17ce.com** 测一下全国各地的访问速度。

### 第二阶段：大陆也要很快（需要 ICP 备案）

当大陆读者变多、想要秒开时：
1. 给域名做 ICP 备案（需要身份证和一台国内云服务器或云存储，审核约 1–3 周）
2. 大陆线路：把博客放到 腾讯云 COS / 阿里云 OSS 静态网站托管，加国内 CDN
3. 海外线路：继续用 GitHub Pages
4. 用 DNSPod / 阿里云 DNS 的「分线路解析」：境内访问走国内，境外访问走 GitHub

这样两边都是就近访问，网站内容完全一样。

### 更新文章

改完文件后，在 GitHub 仓库里重新上传改过的文件（新文章的 `.md` 和 `posts/posts.json`）即可，一两分钟后生效。

## 个性化

- 博客名：全局搜索“Kris 讲明白了”替换
- 主题色：改 `assets/style.css` 顶部的 `--a1` / `--a2` 渐变色（默认深色，右上角可切换浅色）
- 个人介绍：编辑 `about.html`
