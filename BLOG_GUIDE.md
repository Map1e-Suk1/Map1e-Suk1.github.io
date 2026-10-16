# 博客使用指南

站点基于 [Astro](https://astro.build/) + [Fuwari](https://github.com/saicaca/fuwari) 主题，内容为纯 Markdown，推送即部署。

## 用 VS Code 图形化维护（不用敲命令）

打开 VS Code → 「文件 → 打开文件夹」选 `D:\Blog`。已经装好这几个扩展：

| 扩展 | 作用 |
| --- | --- |
| **Front Matter CMS** | 左栏出现 Front Matter 图标：文章列表、表单化编辑 front matter、新建文章、封面图、草稿开关 |
| Astro | `.astro` 文件的语法高亮与补全 |
| Biome | 保存时自动格式化代码 |
| Git Graph | 图形化查看提交历史 |

三个常用操作：

1. **改文章**：在 Front Matter 面板里点开文章编辑（或 `Ctrl+P` 搜文件名直接打开，`Ctrl+Shift+V` 预览 Markdown）
2. **本地预览**：菜单「终端 → 运行任务 → ① 本地预览」，浏览器打开 <http://localhost:4321>
3. **发布**（二选一）：
   - 「终端 → 运行任务 → ② 发布到线上」，输入更新说明即可
   - 左侧「源代码管理」→ 写一句说明 → 点 ✓ 提交 → 点「同步更改」

> 网络说明：git 已配置走系统代理 `http://127.0.0.1:7897`。以后如果换了代理端口，执行
> `git config --global http.proxy http://127.0.0.1:新端口`；
> 想取消代理用 `git config --global --unset http.proxy` 和 `--unset https.proxy`。

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
- `profileConfig`：头像、昵称、签名（`bio`）、社交链接
- `heroConfig.slogans`：主页大卡片里那行轮播的「打字机」句子，写几句换着显示

## 页面结构（现在长什么样）

- **主页 `/`**（`src/pages/index.astro`）：顶上一张个人介绍大卡片（头像 + 名字 + 签名 + 打字机句子 + 联系方式 + 快捷入口），下面接「文章时间线」（按年份分组的紧凑列表，右上角有去文章列表的入口）；主页不显示右侧的分类/标签栏，为的是让人第一眼看到的是人而不是文章。
- **归档 `/archive/`**（`src/pages/archive/[...page].astro`）：完整的文章卡片列表（标题 / 摘要 / 字数 / 分页），也就是原来主页下面那部分；右侧是「分类 / 标签」。
- **关于我 `/about/`**：一张整页大卡片 —— 大头像、名字、签名，分隔线下面就是 `src/content/spec/about.md` 里的自我介绍（正文限制在 760px 宽，手机上更好读）；这一页也不显示右侧栏。
- **不要右侧栏的页面**：主页、朋友们、关于我（`src/layouts/Layout.astro` 里的 `hideSidebar`，客户端在 Swup 翻页时同步）。
- 时间线的过滤参数还在：主页或归档页加 `?tag=...`、`?category=...` 也能筛（沿用上游主题的行为）。
- 分页组件 `src/components/control/Pagination.astro` 会自动按当前目录算页码链接，放到 `/archive/` 下也指得对。
- 想恢复「侧栏里的小头像卡片」：那个组件还在 `src/components/widget/Profile.astro`，在 `src/components/widget/SideBar.astro` 里 import 并放回 `<div id="sidebar-sticky">` 上面即可。

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
| 「关于」页面 | `src/content/spec/about.md`（上半部分的大头像 + 签名在 `src/pages/about.astro`，一般不用改） |
| 主页顶部的个人介绍大卡片 | `src/components/misc/HomeHero.astro`；里面轮播的句子在 `src/config.ts` 的 `heroConfig.slogans` |
| 主页/关于页的签名文字 | `src/config.ts` 的 `profileConfig.bio` |
| 文章 | `src/content/posts/` 新建 `.md`，或 `pnpm new-post 标题` |
| 首页顶部横幅 banner | `src/config.ts` 的 `siteConfig.banner` |
| 全站背景图 / 不透明度 | 图片放 `src/assets/images/`；透明度改 `src/config.ts` 的 `appearanceConfig.background.opacity` |
| 头像 | 替换 `public/avatar.webp`（固定地址，不带哈希，不会因更新而破图） |
| 樱花飘落动效 | `src/config.ts` 的 `sakuraConfig`：`enable` 开关、`count` 花瓣数量、`opacity` 不透明度 |
| 主题色（现在固定为 `#39c5bb`） | `src/config.ts` 的 `themeColor`：`hue` 是 oklch 色相（`fixed: true` 对访客隐藏调色板）；精确色值写在 `src/styles/variables.styl` 的 `--primary` |
| UI 圆角大小 | `tailwind.config.cjs` 的 `borderRadius`（默认值已整体减半，`rounded-full` 圆形不受影响）+ `src/styles/variables.styl` 的 `--radius-large` |
| 亚克力毛玻璃（卡片/导航/浮层） | `src/styles/main.css` 的 `.card-base`、`.float-panel`：改 `blur()` 半径与 `color-mix` 里的透明度百分比；描边色是 `src/styles/variables.styl` 的 `--glass-border` |
| 进入首页的进场动画 | `src/styles/transition.css`：`--intro-offset`（UI 延迟出现的时长，默认 700ms）、`site-bg-in`（背景图淡入时长） |
| 页面结构 / 新页面 | `src/pages/`（复制 `friends.astro` 改最省事） |

几条经验：

- **只改引号里的内容**，别删括号和逗号；`pnpm dev` 会立刻告诉你哪一行出错
- 文章 frontmatter 里 `draft: true` 表示「不发布，只在本地可见」
- 推之前 `git status` 看一眼改了哪些文件；`git checkout <文件>` 可以撤销还没提交的改动
- 改坏了别慌：`git log --oneline` 找到上一个提交，把文件改回去再推一次即可
- 部署结果在仓库的 **Actions** 页面看，绿勾＝已上线

