import { Handlers } from "$fresh/server.ts";
import { join, dirname, normalize } from "https://deno.land/std@0.216.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.216.0/fs/ensure_dir.ts";
import { exists } from "https://deno.land/std@0.216.0/fs/exists.ts";

const IMAGES_DIR = "./user_uploads";

export const handler: Handlers = {
  async POST(req) {
    const { items, currentPath, destination } = await req.json();
    if (!items || !Array.isArray(items) || items.length === 0 || destination === undefined || currentPath === undefined) {
      return new Response(JSON.stringify({ error: "Invalid request: missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const movedItems = [];
    const failedItems = [];

    for (const item of items) {
      const sourcePath = normalize(join(IMAGES_DIR, item));
      const fileName = item.split('/').pop() || '';
      const destPath = destination === ''
        ? normalize(join(IMAGES_DIR, fileName))
        : normalize(join(IMAGES_DIR, destination, fileName));

      console.log(`Attempting to move: ${sourcePath} to ${destPath}`);

      try {
        // Check if source file exists
        if (!(await exists(sourcePath))) {
          throw new Error(`Source file not found: ${sourcePath}`);
        }

        // Check if destination folder exists, if not, create it
        await ensureDir(dirname(destPath));

        // Perform the move operation
        await Deno.rename(sourcePath, destPath);
        console.log(`Successfully moved: ${sourcePath} to ${destPath}`);
        movedItems.push(item);
      } catch (error) {
        console.error(`Error moving item ${item}:`, error);
        failedItems.push({ item, error: error.message });
      }
    }

    const message = movedItems.length > 0
      ? `Successfully moved ${movedItems.length} item(s)`
      : "No items were moved";

    return new Response(JSON.stringify({
      message,
      movedItems,
      failedItems,
    }), {
      status: failedItems.length === 0 ? 200 : 207,
      headers: { "Content-Type": "application/json" },
    });
  },
};
