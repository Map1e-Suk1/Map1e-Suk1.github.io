import type {
	ExpressiveCodeConfig,
	FriendsConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Map1e-Suk1的秘密基地",
	subtitle: "",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // 主题色相（0-360）：250 就是 Fuwari 自带的蓝色，--primary 由它推导（见 src/styles/variables.styl）
		fixed: true, // 固定主题色：对访客隐藏主题色选择器；想恢复 Fuwari 默认的访客取色器就改成 false
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [{ src: "/favicon/icon.png" }],
};

export const navBarConfig: NavBarConfig = {
	links: [
		{
			name: "Home",
			url: "/",
		},
		{
			name: "Articles",
			url: "/archive/",
		},
		{
			name: "About me?",
			url: "/about/",
		},
		{
			name: "My Friends !",
			url: "/friends/",
		},
		{
			name: "GitHub",
			url: "https://github.com/Map1e-Suk1",
			external: true,
		}
	],
};

export const profileConfig: ProfileConfig = {
	// 以 / 开头 = public 目录里的固定地址（不带哈希，更新站点后不会出现破图）；
	// 想改用外部图床热链，直接写成 "https://..." 即可。
	avatar: "/avatar.webp",
	name: "Map1e-Suk1",
	bio: "Roam free, for life is wide.",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github", // Visit https://icones.js.org/ for icon codes
			url: "https://github.com/Map1e-Suk1",
		},
		{
			name: "Email",
			icon: "fa6-solid:envelope",
			url: "mailto:Map1e-Suk1@qq.com",
		},
		{
			name: "Bilibili",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/51436254",
		},
	],
};

// 主页大卡片：头像下面打字机轮流显示的「签名 / 座右铭」，喜欢哪句就增删哪句
export const heroConfig = {
	enable: true,
	showTitle: true, // 主页大卡片顶部是否显示大号站点标题（字体由 appearanceConfig.titleFont 决定）
	slogans: [
		"你好呀！",
		"欢迎来我的秘密基地~",
		"一个还在慢慢变强的 CTFer",
	],
};

// 友链：朋友们页面（/friends/）的内容，加人就在 friends 数组里加一组
export const friendsConfig: FriendsConfig = {
	title: "My Friends！",
	intro: "这里是我的朋友们！也去他们的站点逛一下吧~",
	friends: [
			{
				name: "宛宛",
				url: "https://blog.3w3.asia",
				avatar: "/friends/wanwan.webp",
				description: "人生五十年，如梦亦如幻",
			},
			{
				name: "aClosure",
				url: "https://aclosure.github.io/",
				avatar: "/friends/aclosure.webp",
				description: "Ciallo～(∠・ω< )⌒★",
			},
			{
				name: "Kioroshi Aki",
				url: "https://kioroshiaki.github.io/",
				avatar: "/friends/kioroshiaki.webp",
				description: "KioroshiAki，简称KA。",
			},
			{
				name: "Miso",
				url: "https://miso2233.github.io/",
				avatar: "/friends/miso.png",
				description: "让梦想起飞的不是鸡翅，而是少年气",
			},
			{
				name: "yuanmuyan",
				url: "https://yuanmuyan.github.io/",
				avatar: "/friends/yuanmuyan.webp",
				description: "web手一枚~，欢迎各位师傅的参观~",
			},
			{
				name: "圆周率的废纸堆",
				url: "https://piyuanzhoulv.github.io/",
				avatar: "/friends/piyuanzhoulv.png",
				description: "圆周率的废纸堆，里面或许有你需要的？",
			},
			{
				name: "Dalang",
				url: "https://xiaolang0817.github.io",
				avatar: "https://xiaolang0817.github.io/personal_blog/touxiang.jpg",
				description: "里面可能会有我半夜发疯想的东西和一些记录",
			},
			{
				name: "Ch0kk4ku's Blog",
				url: "https://ch0kk4ku.github.io/",
				avatar: "https://ch0kk4ku.github.io/assets/images/avatar.avif",
				description: "有趣有盼，无灾无难。",
			},
			{
				name: "Mortal",
				url: "https://aaaa521.github.io/mortal-blog/",
				avatar: "https://aaaa521.github.io/mortal-blog/avatar.png",
				description: "web 安全学习中~，偶尔打打 CTF，欢迎各位师傅参观~",
			},
		],
};

// 外观设置：全站背景图 + 正文字体（供 Fuwari 管家读写）
export const appearanceConfig = {
	background: {
		enable: true,
		opacity: 0.35,
	},
	fontFamily: "\"Noto Sans SC\", \"Source Han Sans SC\", \"Microsoft YaHei\", sans-serif",
	// 毛玻璃：卡片/悬浮面板底色百分比（越低越通透）+ 背景模糊 px
	glass: { enable: true, card: 35, panel: 40, blur: 7 },
	// 英文花体字体：只作用于英文和数字，中文会自动回退到上面的正文字体；留空 "" = 不用花体
	// 可选值 = public/fonts/script/ 下的文件名，目前有：great-vibes / dancing-script / pacifico / satisfy / allura
	bioFont: "great-vibes", // 「一句话简介」用哪款花体
	titleFont: "ma-shan-zheng", // 主页中央的大号站点标题用哪款花体
	titleSize: 96, // 大号标题的字号（px，24~160）
};

// 樱花飘落动效：不想要就把 enable 改成 false
export const sakuraConfig = {
	enable: true,
	count: 50, // 花瓣数量上限（窄屏会自动按比例减少）
	opacity: 0.3, // 花瓣最大不透明度
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
