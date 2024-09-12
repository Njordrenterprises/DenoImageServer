import { Handlers } from "$fresh/server.ts";
import { ensureDir } from "https://deno.land/std@0.216.0/fs/ensure_dir.ts";
import { join } from "https://deno.land/std@0.216.0/path/mod.ts";

const IMAGES_DIR = "./user_uploads";

export const handler: Handlers = {
  async POST(req) {
    const form = await req.formData();
    const files = form.getAll("images") as File[];
    const folder = form.get("folder") as string || "";

    if (files.length === 0) {
      return new Response("No files uploaded", { status: 400 });
    }

    try {
      const uploadDir = join(Deno.cwd(), IMAGES_DIR, folder);
      console.log(`Ensuring directory exists: ${uploadDir}`);
      await ensureDir(uploadDir);
      const uploadedFiles = [];

      for (const file of files) {
        const filePath = join(uploadDir, file.name);
        console.log(`Saving file: ${filePath}`);
        const bytes = await file.arrayBuffer();
        const buffer = new Uint8Array(bytes);
        await Deno.writeFile(filePath, buffer);
        uploadedFiles.push(join(folder, file.name));
      }

      console.log(`Files uploaded successfully: ${uploadedFiles.join(", ")}`);
      return new Response(JSON.stringify({ message: "Files uploaded successfully", files: uploadedFiles }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error saving files:", error);
      return new Response(`Error saving files: ${error.message}`, { status: 500 });
    }
  },
};
