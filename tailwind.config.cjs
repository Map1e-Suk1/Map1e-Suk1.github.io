/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme")

// 圆角整体减半（rounded-full / rounded-none 保持原样），基准是 Tailwind 的默认值
const borderRadius = Object.fromEntries(
  Object.entries(defaultTheme.borderRadius).map(([key, value]) => {
    if (key === "full" || key === "none") return [key, value]
    return [key, typeof value === "string" && value.endsWith("rem") ? `${parseFloat(value) / 2}rem` : value]
  })
)

module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}"],
  darkMode: "class", // allows toggling dark mode manually
  theme: {
    borderRadius,
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
