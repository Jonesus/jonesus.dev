// @ts-check
import { defineConfig } from "astro/config";

// @ts-ignore
import rehypeFigureTitle from "rehype-figure-title";

// https://astro.build/config
export default defineConfig({
    markdown: {
        rehypePlugins: [rehypeFigureTitle],
    },
});
