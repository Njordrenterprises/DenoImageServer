import { Handlers } from "$fresh/server.ts";

const IMAGES_DIR = "./user_uploads";

export const handler: Handlers = {
  async POST(req) {
    const { folderPath } = await req.json();
    if (!folderPath) {
      return new Response("Folder path is required", { status: 400 });
    }

    const fullPath = `${IMAGES_DIR}/${folderPath}`.replace(/\/+/g, '/');

    try {
      await Deno.remove(fullPath, { recursive: true });
      return new Response(JSON.stringify({ message: "Folder deleted successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error deleting folder:", error);
      return new Response(JSON.stringify({ error: "Error deleting folder" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
