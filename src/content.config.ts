import { defineCollection, z } from "astro:content";

import { glob } from "astro/loaders";

const blog = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/blog" }),
    schema: z.object({
        title: z.string(),
        slug: z.string(),
    }),
});
const projects = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/projects" }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            startYear: z.number(),
            slug: z.string().optional(),

            cover: image().optional(),
            coverAlt: z.string().optional(),
            githubLink: z.string().url().optional(),
        }),
});

export const collections = { blog, projects };
