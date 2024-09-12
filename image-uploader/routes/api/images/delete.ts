import { Handlers } from "$fresh/server.ts";
import { join } from "$std/path/mod.ts";

const IMAGES_DIR = "./user_uploads";

export const handler: Handlers = {
  async POST(req) {
    const { items } = await req.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response("Invalid request", { status: 400 });
    }

    const deletedItems = [];
    const failedItems = [];

    for (const item of items) {
      const fullPath = join(IMAGES_DIR, item);
      try {
        await Deno.remove(fullPath);
        deletedItems.push(item);
      } catch (error) {
        console.error(`Error deleting item ${item}:`, error);
        failedItems.push(item);
      }
    }

    const message = deletedItems.length > 0
      ? `Successfully deleted ${deletedItems.length} item(s)`
      : "No items were deleted";

    return new Response(JSON.stringify({
      message,
      deletedItems,
      failedItems,
    }), {
      status: failedItems.length === 0 ? 200 : 207,
      headers: { "Content-Type": "application/json" },
    });
  },
};
