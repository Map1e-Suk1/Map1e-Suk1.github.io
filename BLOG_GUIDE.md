# 博客使用指南

站点基于 [Astro](https://astro.build/) + [Fuwari](https://github.com/saicaca/fuwari) 主题，内容为纯 Markdown，推送即部署。

## 目录速查

| 路径 | 作用 |
| --- | --- |
| `src/config.ts` | **最常改**：站点标题、副标题、语言、导航栏、个人资料、主题色 |
| `src/content/posts/` | 所有文章（Markdown），一个文件一篇文章 |
| `src/content/spec/about.md` | 「关于」页面内容 |
| `public/` | favicon 等静态文件，路径以 `/` 开头直接引用 |
| `src/assets/` | 头像、横幅等需要被打包处理的图片 |
| `astro.config.mjs` | 站点地址、base 路径（已配置为部署时自动注入，一般不用改）|
| `.github/workflows/deploy.yml` | 推送到 main 后自动构建并发布到 GitHub Pages |

## 写一篇新文章

在 `src/content/posts/` 下新建 `我的文章.md`：

```markdown
---
title: 文章标题
published: 2026-10-15
description: 摘要，显示在列表页和搜索结果中
image: ""            # 封面图，可留空
tags: [标签1, 标签2]
category: 分类
draft: false         # true 则只在本地可见，不会发布
lang: ""
---

正文用 Markdown 写。
```

也可以让脚本生成模板：

```bash
pnpm new-post 我的文章   # 生成 src/content/posts/我的文章.md
```

## 本地预览

```bash
pnpm dev              # http://localhost:4321，改完立即生效
pnpm build            # 构建到 dist/，顺便跑一遍全文搜索索引
pnpm preview          # 预览构建结果
```

## 发布

```bash
git add -A
git commit -m "post: 新文章"
git push
```

推送后 GitHub Actions 会自动构建并部署，1～2 分钟后访问站点即可看到。

## 图片

- 想直接引用不处理：放进 `public/`，用 `/图片名.png` 引用；
- 想自动压缩优化：放进 `src/assets/`，在文章里用相对路径引用。

## 常改的配置（`src/config.ts`）

- `siteConfig.title` / `subtitle`：站点标题和副标题
- `siteConfig.lang`：界面语言，中文用 `"zh_CN"`
- `siteConfig.themeColor.hue`：主题色相（0～360）
- `navBarConfig.links`：顶部导航
- `profileConfig`：头像、昵称、简介、社交链接

## 备注

- 上游主题的英文说明保留在 `README.md` 和 `docs/` 目录里，遇到具体组件用法可以查阅。
- 原来的示例文章已删除，需要参考语法可以看 Fuwari 仓库的 `src/content/posts/`。

## 部署到 GitHub Pages

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动构建并发布，**不需要手动改任何路径配置**。
工作流会根据仓库名自动算出正确的 `base`：

| 仓库名 | 访问地址 | 自动使用的 base |
| --- | --- | --- |
| `<用户名>.github.io` | `https://<用户名>.github.io/` | `/` |
| 其他名字（例如 `Blog`） | `https://<用户名>.github.io/Blog/` | `/Blog/` |

首次部署需要手动做两件事：

1. 仓库 `Settings` → `Pages` → Build and deployment → Source 选 **GitHub Actions**；
2. 推送代码后，在仓库 `Actions` 页面等 `Deploy to GitHub Pages` 跑完（约 1–2 分钟）。

本地 `pnpm build` 用的是根路径配置，足够预览用；真实的 `site`/`base` 由 Actions 注入。
（在 Windows Git Bash 里手动 `BASE=/Blog/ pnpm build` 行不通：Git Bash 会把 `/Blog/` 当成路径改写，`export MSYS_NO_PATHCONV=1` 又会弄坏 pnpm 的启动脚本。）

如果 `github.com` 连不上导致 `git push` 超时：

```bash
# 有代理软件（Clash 默认 7890，v2rayN 默认 10809）
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 或者改用 SSH（22 端口被墙时，在 ~/.ssh/config 里指定 ssh.github.com:443）
git remote set-url origin git@github.com:<用户名>/<仓库名>.git
```

## 朋友们（友链）页面

页面地址 `/friends/`，内容在 `src/config.ts` 的 `friendsConfig` 里。

加一个友链（复制一段改引号里的内容就行）：

```ts
export const friendsConfig: FriendsConfig = {
	title: "朋友们",
	intro: "这里是我的朋友们，欢迎去他们的站点逛逛。",
	friends: [
		{
			name: "对方的名字",
			url: "https://example.com",
			avatar: "https://example.com/avatar.png", // 可选：没有就删掉这行
			description: "一句话介绍", // 可选
		},
	],
};
```

- `avatar` 留空或加载失败时，会自动显示名字的第一个字，不会出现破图
- 名字里含英文单引号时，写成 \' 或用双引号把整个名字包起来
- 导航栏上「朋友们」这个入口在同一个文件的 `navBarConfig.links` 里

## 想自己改网页内容，怎么改

记住一个流程：**本地改 → 本地预览 → 推送 → 自动上线**

```bash
cd /d D:\Blog
pnpm dev          # 本地预览 http://localhost:4321，改完自动刷新，Ctrl+C 停止
# ……编辑文件……
git add -A
git commit -m "改了什么"
git push          # 约 1 分钟后自动部署
```

改哪里：

| 想改的东西 | 文件 |
| --- | --- |
| 站点标题、副标题、主题色、导航栏、个人资料、邮箱 | `src/config.ts` |
| 友链（朋友们页面） | `src/config.ts` 的 `friendsConfig` |
| 「关于」页面 | `src/content/spec/about.md` |
| 文章 | `src/content/posts/` 新建 `.md`，或 `pnpm new-post 标题` |
| 首页顶部横幅 banner | `src/config.ts` 的 `siteConfig.banner` |
| 全站背景图 / 不透明度 | 图片放 `src/assets/images/`；透明度改 `src/layouts/Layout.astro` 里的 `opacity: 0.3` |
| 头像 | 替换 `src/assets/images/avatar.png`（换文件名要同步改 `profileConfig.avatar`） |
| 页面结构 / 新页面 | `src/pages/`（复制 `friends.astro` 改最省事） |

几条经验：

- **只改引号里的内容**，别删括号和逗号；`pnpm dev` 会立刻告诉你哪一行出错
- 文章 frontmatter 里 `draft: true` 表示「不发布，只在本地可见」
- 推之前 `git status` 看一眼改了哪些文件；`git checkout <文件>` 可以撤销还没提交的改动
- 改坏了别慌：`git log --oneline` 找到上一个提交，把文件改回去再推一次即可
- 部署结果在仓库的 **Actions** 页面看，绿勾＝已上线

