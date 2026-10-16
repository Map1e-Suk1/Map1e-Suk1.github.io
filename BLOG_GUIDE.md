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
- `siteConfig.themeColor.hue`：主题色相（0～360）。**250 = Fuwari 自带的蓝色（当前值）**，188 是之前那套青色；全站颜色都从它推导
- `siteConfig.themeColor.fixed`：`true` = 固定主题色，对访客隐藏主题色选择器（全站只用 `hue` 这一个色相）；想要 Fuwari 默认的「访客也能拖色相」就改成 `false`
- `navBarConfig.links`：顶部导航
- `profileConfig`：头像、昵称、签名（`bio`）、社交链接
- `heroConfig.enable` / `heroConfig.showTitle`：主页大卡片的开关、以及大卡片顶部要不要显示大号的站点标题（`siteConfig.title`）
- `heroConfig.slogans`：主页大卡片里那行轮播的「打字机」句子，写几句换着显示
- `appearanceConfig.bioFont` / `titleFont` / `titleSize`：**自定义字体**。`bioFont` = 「一句话简介」用哪款字体，`titleFont` = 主页中央大号站点标题用哪款字体，`titleSize` = 大标题字号（px，24～160，默认 64）。取值就是 `public/fonts/script/` 里的文件名（不带扩展名），留空 = 不用。软件里内置 12 款：英文花体 `great-vibes` / `dancing-script` / `pacifico` / `satisfy` / `allura`，中英通用 `zcool-kuaile`（站酷快乐体）/ `zcool-qingke-huangyou`（站酷庆科黄油体）/ `zcool-xiaowei`（站酷小薇）/ `ma-shan-zheng`（马善政毛笔楷书）/ `long-cang`（龙藏）/ `zhi-mang-xing`（志莽行书）/ `liu-jian-mao-cao`（刘建毛草）

> 上面这些都**不用手改**——打开「Blog Manager」软件 →「站点设置」，滑杆和下拉框点一点、点右上角「保存所有设置」就写回去了。

## 页面结构（现在长什么样）

- **主页 `/`**（`src/pages/index.astro`，大卡片本体是 `src/components/misc/HomeHero.astro`）：顶上一张个人介绍大卡片（**大号花体站点标题** + 头像 + 名字 + **花体签名** + 打字机句子 + 联系方式 + 快捷入口），下面接「文章时间线」（按年份分组的紧凑列表，右上角有去文章列表的入口）；主页不显示右侧的分类/标签栏，为的是让人第一眼看到的是人而不是文章。
- **归档 `/archive/`**（`src/pages/archive/[...page].astro`）：完整的文章卡片列表（标题 / 摘要 / 字数 / 分页），也就是原来主页下面那部分；右侧是「分类 / 标签」。
- **关于我 `/about/`**：一张整页大卡片 —— 大头像、名字、签名，分隔线下面就是 `src/content/spec/about.md` 里的自我介绍（正文限制在 760px 宽，手机上更好读）；这一页也不显示右侧栏。
- **不要右侧栏的页面**：主页、朋友们、关于我（`src/layouts/Layout.astro` 里的 `hideSidebar`，客户端在 Swup 翻页时同步）。
- 时间线的过滤参数还在：主页或归档页加 `?tag=...`、`?category=...` 也能筛（沿用上游主题的行为）。
- 分页组件 `src/components/control/Pagination.astro` 会自动按当前目录算页码链接，放到 `/archive/` 下也指得对。
- 想恢复「侧栏里的小头像卡片」：那个组件还在 `src/components/widget/Profile.astro`，在 `src/components/widget/SideBar.astro` 里 import 并放回 `<div id="sidebar-sticky">` 上面即可。

## 自定义字体（主页大标题 / 一句话简介）

- 字体文件放在 `public/fonts/script/`，**一个字体一个文件**（文件名去掉扩展名就是配置里写的 key，比如 `zcool-kuaile.woff2` → `titleFont: "zcool-kuaile"`），支持 `.woff2` / `.woff` / `.ttf` / `.otf`；同名文件只注册一个，优先 `.woff2`（体积最小）。OFL 的许可证 `.LICENSE.txt` 建议一起放进来。
- 加字体最简单的办法：打开「Blog Manager」→「站点设置」→「网页外观」→「自定义字体」，点「导入我自己的字体…」选文件（多选），或把文件直接丢进那个目录再刷新软件。也可以直接在 `src/config.ts` 里写 key。
- 内置 12 款：**英文花体** Great Vibes / Dancing Script / Pacifico / Satisfy / Allura；**中英通用** 站酷快乐体 / 站酷庆科黄油体 / 站酷小薇 / 马善政毛笔楷书 / 龙藏 / 志莽行书 / 刘建毛草。中英通用的可以从 [Fontsource](https://fontsource.org/) 的 CJK 包拿（要选 `chinese-simplified` 是单文件、CSS 里没有 `unicode-range` 的那种，它本身就含拉丁字母）。
- 样式在 `src/layouts/Layout.astro`：启动时扫描 `public/fonts/script/` 自动生成 `@font-face`（按扩展名写对应的 `format(...)`，文件名做 URL 编码）和 `--font-bio` / `--font-title` / `--title-size` 变量；`.script-bio` 用在主页、关于我、侧栏的签名上，`.script-title` 用在主页中央的大标题上。所以**不需要**在 `main.css` 里再写一份 `@font-face`（软件也不会重复写）。
- **英文花体只对英文和数字生效**，中文会回退到正文字体，是「花体英文 + 常规中文」的混排；想要中英文统一风格，大标题就选中英通用那几款。
- **体积**：访客只下载页面真正用到的那一款字体，没用到的不占访客流量，但占仓库体积，目前 `public/fonts/script/` 约 14MB。不用了的字体直接从目录里删掉即可。

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
| 全站背景图 / 不透明度 | 图片放 `src/assets/images/`；透明度改 `src/config.ts` 的 `appearanceConfig.background.opacity`。开着背景图时页面底色会自动换成中性灰（`src/layouts/Layout.astro` 的 `html.has-site-bg`），否则半透明背景图会被主题色染色 |
| 头像 | 替换 `public/avatar.webp`（固定地址，不带哈希，不会因更新而破图） |
| 樱花飘落动效 | `src/config.ts` 的 `sakuraConfig`：`enable` 开关、`count` 花瓣数量、`opacity` 不透明度 |
| 主题色（现在是 Fuwari 默认蓝 `hue: 250`，已取消 `#39c5bb` 那套青色） | 只改 `src/config.ts` 的 `themeColor.hue`：`src/styles/variables.styl` 的 `--primary: oklch(0.70 0.14 var(--hue))` 会跟着变（`fixed: true` 时对访客隐藏调色板） |
| UI 圆角大小 | `tailwind.config.cjs` 的 `borderRadius`（默认值已整体减半，`rounded-full` 圆形不受影响）+ `src/styles/variables.styl` 的 `--radius-large` |
| 亚克力毛玻璃（卡片/导航/浮层） | `src/styles/main.css` 的 `.card-base`、`.float-panel`：改 `blur()` 半径与 `color-mix` 里的透明度百分比；描边色是 `src/styles/variables.styl` 的 `--glass-border` |
| 鼠标框选渐变大标题时字会「隐身」 | `src/layouts/Layout.astro` 的 `.bg-clip-text::selection`：渐变裁剪的文字被选中时只剩一块底色，这条让选中的字用主题色画出来 |
| 进入首页的进场动画 | `src/styles/transition.css`：`--intro-offset`（UI 延迟出现的时长，默认 700ms）、`site-bg-in`（背景图淡入时长） |
| 主页头像（现在不显示名字、右下角也没有闪动的绿点） | `src/components/misc/HomeHero.astro`：头像下面是签名与大标题；名字和绿点已删掉，想加回来照 `Profile` 组件的写法补一个 `<div>{profileConfig.name}</div>` 即可 |
| 顶部导航栏「当前在哪一页」的高亮 | `src/components/Navbar.astro`：`data-nav-path` + `nav-current` 类，样式在 `src/styles/main.css` 的 `#navbar a.nav-current`；站内翻页由脚本的 `syncCurrentNav()`（挂在 swup 的 `page:view`）重算 |
| 侧栏进场动画（翻页时右侧栏不要跟着再跳一次） | `src/styles/transition.css` 的 `html.intro-done #sidebar.onload-animation { animation: none }`；`intro-done` 由 `src/layouts/Layout.astro` 在首屏动画结束后挂上 |
| 页面结构 / 新页面 | `src/pages/`（复制 `friends.astro` 改最省事） |

几条经验：

- **只改引号里的内容**，别删括号和逗号；`pnpm dev` 会立刻告诉你哪一行出错
- 文章 frontmatter 里 `draft: true` 表示「不发布，只在本地可见」
- 推之前 `git status` 看一眼改了哪些文件；`git checkout <文件>` 可以撤销还没提交的改动
- 改坏了别慌：`git log --oneline` 找到上一个提交，把文件改回去再推一次即可
- 部署结果在仓库的 **Actions** 页面看，绿勾＝已上线
- 元素从 `display: none` 切回可见时，浏览器会把它的 CSS 进场动画**从头再播一遍**（本站右侧栏就是这样被左右 `body.no-sidebar` 切换触发的，所以给首屏之后加了 `html.intro-done` 来关掉重播）；判断「动画写了两遍」时先看元素是不是被隐藏过
- `src/styles/*.css` 之间**不要**用 `@apply` 引用别的文件里的自定义类（比如 `@apply link`、`@apply btn-regular-dark`）：Tailwind 处理多个 CSS 文件的顺序不固定，会随机报 The `link` class does not exist，构建时好时坏。要用就把那边的属性展开成工具类照抄过来（`src/styles/markdown.css` 里已经这么改了）

