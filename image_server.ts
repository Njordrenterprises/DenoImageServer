import { extname } from "@std/path";
import { contentType } from "@std/media-types";

const IMAGES_DIR = "./images";

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const imagePath = decodeURIComponent(url.pathname.slice(1));
  const fullPath = `${IMAGES_DIR}/${imagePath}`;

  try {
    const file = await Deno.open(fullPath, { read: true });
    const stat = await file.stat();

    if (!stat.isFile) {
      file.close();
      return new Response("Not found", { status: 404 });
    }

    const ext = extname(fullPath).toLowerCase();
    const mimeType = contentType(ext) || "application/octet-stream";

    const headers = new Headers({
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
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
}

const port = 8000;
console.log(`Image server running on http://localhost:${port}`);

Deno.serve({ port }, handleRequest);
