import { definePlugin } from "@expressive-code/core";
import type { Element } from "hast";

/** 在块里找第一个 <pre>（语言名写在它的 data-language 上） */
function findPre(node: Element): Element | null {
	for (const child of node.children ?? []) {
		if (child.type !== "element") continue;
		if (child.tagName === "pre") return child;
		const found = findPre(child);
		if (found) return found;
	}
	return null;
}

/**
 * 代码块左上角加一块「折叠标签」：写着语言（PLAINTEXT / JS …）和一个三角形，
 * 点一下收起 / 展开这块代码。复制按钮不动，还是右上角那个。
 *
 * 全部靠纯 CSS 工作（label 里包一个 checkbox，用 :has() 选状态），
 * 所以不用 JS，也不怕 Swup 换页后脚本没重跑。
 */
export function pluginCollapsibleCode() {
	return definePlugin({
		name: "Collapsible Code",
		hooks: {
			postprocessRenderedBlock: (context) => {
				const figure = context.renderData.blockAst;
				if (!figure || figure.type !== "element" || figure.tagName !== "figure") return;

				const rawClass = figure.properties?.className;
				const classes = Array.isArray(rawClass) ? rawClass.map(String) : String(rawClass ?? "").split(/\s+/);
				// 自带标题栏（editor tab / 终端窗口）的块已经有自己的头，不再叠一个标签
				if (classes.includes("has-title") || classes.includes("is-terminal")) return;

				const pre = findPre(figure);
				const preProps = (pre?.properties ?? {}) as Record<string, unknown>;
				const preLanguage = String(preProps["data-language"] ?? preProps.dataLanguage ?? "");

				const title = String(context.codeBlock?.props?.title ?? "").trim();
				const label = (title || preLanguage || context.codeBlock?.language || "code").trim();

				// Markdown 里用 Tab / 4 空格缩进出来的块会被当成 plaintext 代码块：
				// 这种块不加左上角折叠标签（也就不显示 PLAINTEXT），打个标记交给
				// markdown.css 按 VS Code 预览那种浅灰块来画。
				if (!title && (!preLanguage || /^(plaintext|text|txt)$/i.test(preLanguage))) {
					figure.properties.className = [...classes.filter(Boolean), "is-plaintext"];
					return;
				}

				const checkbox: Element = {
					type: "element",
					tagName: "input",
					properties: {
						type: "checkbox",
						className: ["ec-fold-checkbox"],
						checked: true,
						tabIndex: 0,
						"aria-label": "收起 / 展开代码",
					},
					children: [],
				};

				const tab: Element = {
					type: "element",
					tagName: "label",
					properties: {
						className: ["ec-fold-tab"],
						title: "点击收起 / 展开",
					},
					children: [
						checkbox,
						{
							type: "element",
							tagName: "span",
							properties: { className: ["ec-fold-lang"] },
							children: [{ type: "text", value: label }],
						},
						{
							type: "element",
							tagName: "span",
							properties: { className: ["ec-fold-arrow"], "aria-hidden": "true" },
							children: [],
						},
					],
				};

				if (!figure.children) figure.children = [];
				figure.children.unshift(tab);
			},
		},
	});
}
