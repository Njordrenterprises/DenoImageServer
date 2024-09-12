import { Handlers } from "$fresh/server.ts";
import { walk } from "https://deno.land/std@0.216.0/fs/walk.ts";
import { join, relative } from "https://deno.land/std@0.216.0/path/mod.ts";
import { isImageFile } from "../../utils/imageUtils.ts";

const IMAGES_DIR = "./user_uploads";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const currentPath = url.searchParams.get("path") || "";
    const getAllFolders = url.searchParams.get("getAllFolders") === "true";

    if (getAllFolders) {
      return await getAllFoldersHandler();
    }

    return await getItemsHandler(currentPath);
  },
};

async function getAllFoldersHandler() {
  try {
    const folders = [];
    for await (const entry of walk(IMAGES_DIR, { includeDirs: true, includeFiles: false })) {
      const relativePath = relative(IMAGES_DIR, entry.path);
      if (relativePath !== "") {
        folders.push({
          path: relativePath,
          name: entry.name,
        });
      }
    }
    return new Response(JSON.stringify(folders), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error listing all folders:", error);
    return new Response(JSON.stringify({ error: "Error listing all folders", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function getItemsHandler(currentPath: string) {
  const fullPath = join(IMAGES_DIR, currentPath);

  try {
    // Check if the directory exists
    const dirInfo = await Deno.stat(fullPath);
    if (!dirInfo.isDirectory) {
      throw new Error("Not a directory");
    }

    const items = [];
    for await (const entry of Deno.readDir(fullPath)) {
      const entryPath = join(fullPath, entry.name);
      const relativePath = relative(IMAGES_DIR, entryPath);
      items.push({
        name: entry.name,
        isDirectory: entry.isDirectory,
        path: relativePath,
        isImage: !entry.isDirectory && isImageFile(entry.name),
      });
    }
    return new Response(JSON.stringify(items), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error listing items:", error);
    if (error instanceof Deno.errors.NotFound || error.message === "Not a directory") {
      return new Response(JSON.stringify({ error: "Directory not found", items: [] }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Error listing items", details: error.message, items: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
