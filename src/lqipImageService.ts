// src/services/lqip-image-service.js
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import sharpService, {
    type SharpImageServiceConfig,
} from "astro/assets/services/sharp";
import type { LocalImageService } from "astro";

/**
 * Custom image service that delegates the normal image work to Astro's sharp service,
 * but injects a `data-lqip` HTML attribute (a base64 tiny image) via getHTMLAttributes.
 *
 * Note: this implementation creates the LQIP by reading the original image (local or http),
 * resizing to a small width, applying a light blur, and encoding as JPEG base64.
 */
const lqipService: LocalImageService<SharpImageServiceConfig> = {
    // reuse existing he,lpers from the shipping sharp service where possible
    ...sharpService,

    // This is the key override: attach `data-lqip` to the attributes returned to Astro's <Image> / <img> output.
    async getHTMLAttributes(options, serviceOptions) {
        // get default attributes (width/height/loading/etc) from the wrapped service if available
        const attrs = sharpService.getHTMLAttributes
            ? await sharpService.getHTMLAttributes(options, serviceOptions)
            : {};

        try {
            const buffer = await readSourceAsBuffer(options.src as string);
            // produce a very small blurred image for placeholder
            const lqipBuffer = await sharp(buffer)
                .resize({ width: 12 }) // tiny width (adjust as needed)
                .toFormat("jpeg", { quality: 40 })
                .toBuffer();

            const mime = "image/jpeg";
            const dataUri = `data:${mime};base64,${lqipBuffer.toString("base64")}`;

            // attach the base64 data uri to a custom attribute
            attrs["data-lqip"] = dataUri;
        } catch (err) {
            // fail silently: if LQIP generation fails, we still return normal attributes.
            // (Useful for remote images or ACL-protected assets.)
            console.warn("LQIP generation failed for", options.src, err);
        }

        return attrs;
    },
};

export default lqipService;

/* Robust helper to accept the different `src` shapes Astro may pass:
   - string URLs ("/images/foo.jpg", "/@fs/...", "https://...")
   - ESM image import objects ({ src: '/@fs/...', width, height, format, ... })
   - Vite file URLs (file:///...)
*/
async function readSourceAsBuffer(src: string | ImageMetadata) {
    if (!src) throw new Error("No src provided to readSourceAsBuffer");

    // Normalize to a string where possible
    let srcStr = "";
    if (typeof src === "string") {
        srcStr = src;
    } else if (src && typeof src === "object") {
        if (typeof src.src === "string") srcStr = src.src;
        else if (typeof src.toString === "function") srcStr = String(src);
    } else {
        throw new Error("Unsupported src type for LQIP generation");
    }

    // remove any query string / hash for filesystem resolution
    const [clean = ""] = srcStr.split("?");

    // remote http(s)
    if (/^https?:\/\//i.test(srcStr)) {
        const res = await fetch(srcStr);
        if (!res.ok)
            throw new Error(`Failed to fetch ${srcStr}: ${res.status}`);
        const ab = await res.arrayBuffer();
        return Buffer.from(ab);
    }

    // Vite's /@fs/ prefix -> absolute filesystem path
    if (clean.startsWith("/@fs/")) {
        const fsPath = clean.replace(/^\/@fs\//, "/"); // turns '/@fs/workspaces/...' => '/workspaces/...'
        return fs.readFile(fsPath);
    }

    // file:// URL
    if (clean.startsWith("file://")) {
        const p = new URL(clean).pathname;
        return fs.readFile(p);
    }

    // root-absolute path served by dev server or public/ assets (starts with '/')
    if (clean.startsWith("/")) {
        let current = "";
        if (clean.startsWith("/_astro"))
            current = clean.replace("/_astro", "./dist/_astro");
        // try resolving from project root first
        const rel = current.replace(/^\//, "");
        const candidate = path.join(process.cwd(), rel);
        try {
            return await fs.readFile(candidate);
        } catch {
            // fallback: try reading the raw absolute path (in case it's already absolute)
            try {
                return await fs.readFile(current);
            } catch (err) {
                throw err;
            }
        }
    }

    // relative path (resolve from project root)
    const candidate = path.join(process.cwd(), clean);
    return fs.readFile(candidate);
}
