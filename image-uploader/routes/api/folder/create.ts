import { Handlers } from "$fresh/server.ts";
import { ensureDir } from "https://deno.land/std@0.216.0/fs/ensure_dir.ts";

const IMAGES_DIR = "./static/images";

export const handler: Handlers = {
  async POST(req) {
    const { folderName, currentPath } = await req.json();
    if (!folderName) {
      return new Response("Folder name is required", { status: 400 });
    }

    const folderPath = `${IMAGES_DIR}/${currentPath}/${folderName}`.replace(/\/+/g, '/');

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
