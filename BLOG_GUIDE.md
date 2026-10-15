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

