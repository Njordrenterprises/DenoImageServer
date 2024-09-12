import { Handlers } from "$fresh/server.ts";
import { join } from "https://deno.land/std@0.216.0/path/mod.ts";

const IMAGES_DIR = "./user_uploads";

export const handler: Handlers = {
  async GET(req, ctx) {
    const imagePath = ctx.params.path;
    const fullPath = join(IMAGES_DIR, imagePath);

    try {
      const file = await Deno.readFile(fullPath);
      const contentType = getContentType(imagePath);
      return new Response(file, {
        headers: { "Content-Type": contentType },
      });
    } catch (error) {
      console.error("Error serving image:", error);
      return new Response("Image not found", { status: 404 });
    }
  },
};

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}
