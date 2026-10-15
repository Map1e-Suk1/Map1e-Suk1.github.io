---
title: 你好，世界：这个博客开张了
published: 2026-10-15
description: 为什么建这个博客，以及我打算在这里写些什么。
image: ""
tags: [随笔, 博客]
category: 随笔
draft: false
lang: ""
---

欢迎来到我的博客 👋

这里主要用来记录两件事：

1. **学习心得**——读书、写代码、踩坑之后留下的笔记，方便自己回看，也希望对路过的人有点用；
2. **分享**——一些觉得有意思的东西：工具、想法、生活碎片。

## 这个站是怎么搭的

- 生成器：[Astro](https://astro.build/) + [Fuwari](https://github.com/saicaca/fuwari) 主题
- 内容：Markdown 文件，全部放在 `src/content/posts/` 目录里
- 托管：GitHub Pages，推送到 `main` 分支后自动构建部署

## 怎么写一篇新文章

在 `src/content/posts/` 下新建一个 `.md` 文件，开头写上 frontmatter：

```markdown
---
title: 文章标题
published: 2026-10-15
description: 一句话摘要，会显示在列表和搜索结果里
tags: [标签1, 标签2]
category: 分类
draft: false
---

正文用 Markdown 写就好。
```

也可以用命令快速生成一个带 frontmatter 的模板：

```bash
pnpm new-post my-new-post
```

本地预览：

```bash
pnpm dev
```

然后打开 <http://localhost:4321>。

## 支持的一些写法

> 引用、代码块、表格、任务列表都支持。

- [x] 建好博客
- [ ] 写下第一篇真正的学习笔记

| 语法 | 用途 |
| --- | --- |
| `**粗体**` | 强调 |
| `> 引用` | 引用别人的话 |
| 代码块 | 贴代码 |

行内公式 $E = mc^2$ 和代码高亮也都开了，写技术笔记够用。

---

之后会慢慢把学习笔记搬过来。如果某篇文章帮到了你，欢迎在 GitHub 上打个招呼。
