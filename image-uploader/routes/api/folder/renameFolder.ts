import { Handlers } from "$fresh/server.ts";
import { join, dirname } from "https://deno.land/std@0.216.0/path/mod.ts";

const IMAGES_DIR = "./user_uploads";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { currentPath, newName } = await req.json();
      if (!currentPath || !newName) {
        return new Response(JSON.stringify({ error: "Current path and new name are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const oldPath = join(IMAGES_DIR, currentPath);
      const parentDir = dirname(oldPath);
      const newPath = join(parentDir, newName);

      await Deno.rename(oldPath, newPath);
      
      // Return the new path relative to IMAGES_DIR
      const newRelativePath = newPath.slice(IMAGES_DIR.length + 1);
      return new Response(JSON.stringify({ 
        message: "Folder renamed successfully",
        newPath: newRelativePath
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error renaming folder:", error);
      return new Response(JSON.stringify({ error: "Error renaming folder: " + error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
