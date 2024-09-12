import { Handlers } from "$fresh/server.ts";
import { ensureDir } from "https://deno.land/std@0.216.0/fs/ensure_dir.ts";

const IMAGES_DIR = "./static/images";

export const handler: Handlers = {
  async POST(req) {
    const form = await req.formData();
    const files = form.getAll("images") as File[];
    const folder = form.get("folder") as string || "";

    if (files.length === 0) {
      return new Response("No files uploaded", { status: 400 });
    }

    try {
      const uploadDir = `${IMAGES_DIR}/${folder}`;
      await ensureDir(uploadDir);
      const uploadedFiles = [];

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = new Uint8Array(bytes);
        await Deno.writeFile(`${uploadDir}/${file.name}`, buffer);
        uploadedFiles.push(`${folder}/${file.name}`);
      }

      return new Response(JSON.stringify({ message: "Files uploaded successfully", files: uploadedFiles }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error saving files:", error);
      return new Response("Error saving files", { status: 500 });
    }
  },
};
