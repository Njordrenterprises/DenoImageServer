import { Handlers } from "$fresh/server.ts";
import { ensureDir } from "https://deno.land/std@0.216.0/fs/ensure_dir.ts";

const IMAGES_DIR = "./images";

export const handler: Handlers = {
  async POST(req) {
    const form = await req.formData();
    const file = form.get("image") as File;

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    try {
      await ensureDir(IMAGES_DIR);
      await Deno.writeFile(`${IMAGES_DIR}/${file.name}`, buffer);
      return new Response("File uploaded successfully", { status: 200 });
    } catch (error) {
      console.error("Error saving file:", error);
      return new Response("Error saving file", { status: 500 });
    }
  },
};
