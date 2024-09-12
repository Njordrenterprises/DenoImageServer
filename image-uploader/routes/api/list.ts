import { Handlers } from "$fresh/server.ts";
import { walk } from "https://deno.land/std@0.216.0/fs/walk.ts";
import { join, relative } from "https://deno.land/std@0.216.0/path/mod.ts";

const IMAGES_DIR = "./user_uploads";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const currentPath = url.searchParams.get("path") || "";
    const fullPath = join(IMAGES_DIR, currentPath);

    try {
      const items = [];
      for await (const entry of walk(fullPath, { maxDepth: 1 })) {
        if (entry.path === fullPath) continue;
        const relativePath = relative(IMAGES_DIR, entry.path);
        items.push({
          name: entry.name,
          isDirectory: entry.isDirectory,
          path: relativePath,
        });
      }
      return new Response(JSON.stringify(items), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error listing items:", error);
      return new Response(JSON.stringify({ error: "Error listing items", details: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
