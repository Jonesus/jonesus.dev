// @ts-check
import { defineConfig } from "astro/config";

// @ts-ignore
import rehypeFigureTitle from "rehype-figure-title";

import { viteStaticCopy } from "vite-plugin-static-copy";

// https://astro.build/config
export default defineConfig({
    site: "https://jonesus.dev",
    markdown: {
        rehypePlugins: [rehypeFigureTitle],
    },
    image: {
        service: { entrypoint: "src/lqipImageService" },
        responsiveStyles: true,
        layout: "full-width",
    },
    vite: {
        assetsInclude: ["**/*.webm"],
        plugins: [
            viteStaticCopy({
                targets: [
                    {
                        src: "content/projects/**/*.webm",
                        dest: "videos",
                    },
                ],
            }),
        ],
    },
});
