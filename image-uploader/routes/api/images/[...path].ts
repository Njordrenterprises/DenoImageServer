import { Handlers } from "$fresh/server.ts";
import { join } from "https://deno.land/std@0.210.0/path/mod.ts";
import { getImageMimeType } from "../../../../utils/imageUtils.ts";

const IMAGES_DIR = "./user_uploads";

export const handler: Handlers = {
  async GET(req, ctx) {
    const imagePath = ctx.params.path;
    const fullPath = join(IMAGES_DIR, imagePath);

    try {
      const file = await Deno.open(fullPath, { read: true });
      const stat = await file.stat();

      if (!stat.isFile) {
        file.close();
        return new Response("Not found", { status: 404 });
      }

      const headers = new Headers();
      headers.set("Content-Length", stat.size.toString());
      headers.set("Content-Type", getImageMimeType(imagePath));

      return new Response(file.readable, { headers });
    } catch (e) {
      console.error(`Error serving image: ${e}`);
      return new Response("Not found", { status: 404 });
    }
  },
};
