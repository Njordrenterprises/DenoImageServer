import { Handlers } from "$fresh/server.ts";

const IMAGES_DIR = "./images";

export const handler: Handlers = {
  async GET(_req) {
    try {
      const images = [];
      for await (const dirEntry of Deno.readDir(IMAGES_DIR)) {
        if (dirEntry.isFile) {
          images.push(dirEntry.name);
        }
      }
      return new Response(JSON.stringify(images), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error listing images:", error);
      return new Response("Error listing images", { status: 500 });
    }
  },
};
