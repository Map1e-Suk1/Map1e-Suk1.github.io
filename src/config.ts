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
	title: "Map1e-Suk1的个人空间",
	subtitle: "大佬大佬快来带带我",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
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
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "朋友们",
			url: "/friends/", // 内部链接不要带 base 前缀，主题会自动加上
		},
		{
			name: "GitHub",
			url: "https://github.com/Map1e-Suk1", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
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
	],
};

// 友链：朋友们页面（/friends/）的内容，加人就在 friends 数组里加一组
export const friendsConfig: FriendsConfig = {
	title: "My Friends",
	intro: "这里是我的朋友们！欢迎你去他们的站点逛一逛~",
	friends: [
		{
			name: "宛宛",
			url: "https://blog.3w3.asia",
			avatar: "/friends/wanwan.webp",
			description: "",
		},
		{
			name: "aClosure",
			url: "https://aclosure.github.io/",
			avatar: "/friends/aclosure.webp",
			description: "",
		},
		{
			name: "Kioroshi Aki",
			url: "https://kioroshiaki.github.io/",
			avatar: "/friends/kioroshiaki.webp",
			description: "",
		},
		{
			name: "Miso",
			url: "https://miso2233.github.io/",
			avatar: "/friends/miso.png",
			description: "",
		},
		{
			name: "yuanmuyan",
			url: "https://yuanmuyan.github.io/",
			avatar: "/friends/yuanmuyan.webp",
			description: "",
		},
		{
			name: "圆周率的废纸堆",
			url: "https://piyuanzhoulv.github.io/",
			avatar: "/friends/piyuanzhoulv.png",
			description: "",
		},
	],
};

// 外观设置：全站背景图 + 正文字体（供 Fuwari 管家读写）
export const appearanceConfig = {
	background: {
		enable: true,
		opacity: 0.3,
	},
	fontFamily: "",
};

// 樱花飘落动效：不想要就把 enable 改成 false
export const sakuraConfig = {
	enable: true,
	count: 34, // 花瓣数量上限（窄屏会自动按比例减少）
	opacity: 0.85, // 花瓣最大不透明度
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
