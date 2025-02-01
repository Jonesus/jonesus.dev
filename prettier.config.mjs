/** @type {import("prettier").Config} */
export default {
    htmlWhitespaceSensitivity: "ignore",
    tabWidth: 4,
    plugins: ["prettier-plugin-astro"],
    overrides: [
        {
            files: "*.astro",
            options: {
                parser: "astro",
            },
        },
        {
            files: "*.md",
            options: {
                printWidth: 80,
                proseWrap: "always",
            },
        },
    ],
};
