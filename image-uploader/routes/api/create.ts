import { Handlers } from "$fresh/server.ts";
import { ensureDir } from "https://deno.land/std@0.216.0/fs/ensure_dir.ts";
import { join } from "https://deno.land/std@0.216.0/path/mod.ts";

const IMAGES_DIR = "./user_uploads";

export const handler: Handlers = {
  async POST(req) {
    const { folderName, currentPath } = await req.json();
    if (!folderName) {
      return new Response("Folder name is required", { status: 400 });
    }

    const folderPath = join(IMAGES_DIR, currentPath, folderName);

    try {
      await ensureDir(folderPath);
      return new Response(JSON.stringify({ message: "Folder created successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error creating folder:", error);
      return new Response("Error creating folder", { status: 500 });
    }
  },
};
