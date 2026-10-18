import { friendsConfig } from "@/config";

/**
 * 朋友们最近的动态：构建时抓一遍每个友链站点的 RSS / Atom，按发布时间倒序汇总。
 *
 * 为什么不把 RSS 地址写进 config：BlogGUI 的「朋友们」编辑功能只认 name / url / avatar /
 * description 四个字段，保存时会把其它字段丢掉，所以这里改成从站点首页自动发现
 * （<link rel="alternate" type="application/rss+xml">），发现不到再去撞几个常见路径。
 */
const UA = "Mozilla/5.0 (compatible; Map1eSuk1BlogFeed/1.0; +https://map1e-suk1.github.io/)";
const TIMEOUT_MS = 8000;
const MAX_PER_FRIEND = 5;
const MAX_TOTAL = 60;
const FEED_PATHS = ["rss.xml", "atom.xml", "feed", "feed.xml", "index.xml", "rss", "atom", "feed/"];

export type FriendPost = {
	friend: string;
	site: string;
	avatar: string;
	title: string;
	link: string;
	date: string; // ISO 字符串，解析不出来时是空串
};

export type FriendActivity = {
	posts: FriendPost[];
	/** 没有 RSS（或这次没连上）的朋友，页面上会单独提一句 */
	missing: { name: string; site: string }[];
};

async function fetchText(input: string, ms = TIMEOUT_MS): Promise<string> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), ms);
	try {
		const res = await fetch(input, {
			headers: { "user-agent": UA, accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.8, */*;q=0.5" },
			signal: controller.signal,
			redirect: "follow",
		});
		if (!res.ok) return "";
		return await res.text();
	} catch {
		return "";
	} finally {
		clearTimeout(timer);
	}
}

const looksLikeFeed = (text: string) => /<(rss|feed|rdf:RDF)[\s>]/i.test(text.slice(0, 4000));

function decodeEntities(text: string): string {
	const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
	return text
		.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
		.replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
		.replace(/&([a-z]+);/gi, (all, name) => named[name.toLowerCase()] ?? all);
}

const cleanText = (raw: string) =>
	decodeEntities(
		raw
			.replace(/<!\[CDATA\[/g, "")
			.replace(/\]\]>/g, "")
			.replace(/<[^>]+>/g, " "),
	)
		.replace(/\s+/g, " ")
		.trim();

/** RSS 的 <link> 是文本，Atom 的是 <link href="…"/>；都兼容一下 */
function itemLink(block: string, feedUrl: string): string {
	const atom = block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\/?>/i);
	const raw =
		(atom && atom[1]) ||
		(block.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i) || [])[1] ||
		(block.match(/<guid\b[^>]*>([\s\S]*?)<\/guid>/i) || [])[1] ||
		"";
	if (!raw.trim()) return "";
	try {
		return new URL(raw.trim(), feedUrl).href;
	} catch {
		return "";
	}
}

/**
 * 有的站点（比如 Miso）RSS 里把文章链接写成了 github.com/<用户名>/<文章路径>，
 * 点进去是 GitHub 主页。这里把这种链接搬回站点自己的域名上。
 */
function fixLink(link: string, site: string): string {
	if (!link) return "";
	let target: URL;
	let home: URL;
	try {
		target = new URL(link);
		home = new URL(site);
	} catch {
		return link;
	}
	if (target.host !== "github.com" || !home.host.endsWith(".github.io")) return link;
	const owner = home.host.split(".")[0].toLowerCase();
	const segs = target.pathname.split("/").filter(Boolean);
	if (!segs.length || segs[0].toLowerCase() !== owner) return link;
	const rest = segs.slice(1);
	if (!rest.length) return link;
	const base = home.pathname.endsWith("/") ? home.pathname : home.pathname + "/";
	return new URL(base + rest.join("/") + "/", home.origin).href;
}

function itemDate(block: string): string {
	const raw =
		(block.match(/<pubDate\b[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] ||
		(block.match(/<published\b[^>]*>([\s\S]*?)<\/published>/i) || [])[1] ||
		(block.match(/<updated\b[^>]*>([\s\S]*?)<\/updated>/i) || [])[1] ||
		(block.match(/<dc:date\b[^>]*>([\s\S]*?)<\/dc:date>/i) || [])[1] ||
		"";
	const time = Date.parse(cleanText(raw));
	return Number.isNaN(time) ? "" : new Date(time).toISOString();
}

function parseFeed(xml: string, feedUrl: string, site: string): { title: string; link: string; date: string }[] {
	const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/gi) || [];
	return blocks
		.map((block) => ({
			title: cleanText((block.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ""),
			link: fixLink(itemLink(block, feedUrl), site),
			date: itemDate(block),
		}))
		.filter((post) => post.title && post.link);
}

async function discoverFeed(site: string): Promise<string> {
	const home = await fetchText(site);
	if (home) {
		const tags = home.match(/<link\b[^>]*>/gi) || [];
		for (const tag of tags) {
			if (!/rel=["']?alternate/i.test(tag)) continue;
			if (!/(application\/(rss|atom)\+xml|application\/xml|text\/xml)/i.test(tag)) continue;
			const href = tag.match(/href=["']([^"']+)["']/i);
			if (!href) continue;
			try {
				const candidate = new URL(href[1], site).href;
				if (looksLikeFeed(await fetchText(candidate))) return candidate;
			} catch {
				/* 忽略单个坏链接 */
			}
		}
	}
	for (const path of FEED_PATHS) {
		let candidate: string;
		try {
			candidate = new URL(path, site).href;
		} catch {
			continue;
		}
		if (looksLikeFeed(await fetchText(candidate))) return candidate;
	}
	return "";
}

async function friendPosts(friend: { name: string; url: string; avatar?: string }): Promise<FriendPost[]> {
	const feed = await discoverFeed(friend.url);
	if (!feed) return [];
	const xml = await fetchText(feed);
	if (!xml) return [];
	return parseFeed(xml, feed, friend.url)
		.sort((a, b) => (b.date || "").localeCompare(a.date || ""))
		.slice(0, MAX_PER_FRIEND)
		.map((post) => ({
			friend: friend.name,
			site: friend.url,
			avatar: friend.avatar || "",
			title: post.title,
			link: post.link,
			date: post.date,
		}));
}

let cached: FriendActivity | undefined;

export async function getFriendsActivity(): Promise<FriendActivity> {
	if (cached) return cached;

	const friends = friendsConfig.friends ?? [];
	const results = await Promise.all(
		friends.map(async (friend) => {
			try {
				return { friend, posts: await friendPosts(friend) };
			} catch {
				return { friend, posts: [] as FriendPost[] };
			}
		}),
	);

	const posts = results
		.flatMap((result) => result.posts)
		.sort((a, b) => (b.date || "").localeCompare(a.date || ""))
		.slice(0, MAX_TOTAL);

	const missing = results
		.filter((result) => result.posts.length === 0)
		.map((result) => ({ name: result.friend.name, site: result.friend.url }));

	cached = { posts, missing };
	return cached;
}
