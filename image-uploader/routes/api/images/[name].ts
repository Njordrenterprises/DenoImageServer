import { Handlers } from "$fresh/server.ts";
import { extname } from "$std/path/mod.ts";
import { contentType } from "$std/media_types/mod.ts";

const IMAGES_DIR = "./images";

export const handler: Handlers = {
  async GET(req, ctx) {
    const imageName = ctx.params.name;
    const imagePath = `${IMAGES_DIR}/${imageName}`;

    try {
      const file = await Deno.open(imagePath, { read: true });
      const stat = await file.stat();

      if (!stat.isFile) {
        file.close();
        return new Response("Not found", { status: 404 });
      }

      const ext = extname(imagePath).toLowerCase();
      const mimeType = contentType(ext) || "application/octet-stream";

      const headers = new Headers({
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=3600",
      });

      return new Response(file.readable, { headers });
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return new Response("Image not found", { status: 404 });
      } else {
        console.error("Error serving image:", error);
        return new Response("Internal server error", { status: 500 });
      }
    }
  },
};
