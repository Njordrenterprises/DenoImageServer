import { extname } from "@std/path";
import { contentType } from "@std/media-types";

const IMAGES_DIR = "./images";

// Check if the images directory exists
try {
  const dirInfo = await Deno.stat(IMAGES_DIR);
  if (!dirInfo.isDirectory) {
    console.error(`${IMAGES_DIR} is not a directory`);
    Deno.exit(1);
  }
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    console.error(`${IMAGES_DIR} directory not found`);
    Deno.exit(1);
  }
  throw error;
}

async function handleRequest(request: Request): Promise<Response> {
  if (request.method === "POST") {
    return handleUpload(request);
  } else if (request.method === "GET") {
    return handleImageServe(request);
  } else {
    return new Response("Method not allowed", { status: 405 });
  }
}

async function handleUpload(request: Request): Promise<Response> {
  const form = await request.formData();
  const file = form.get("image") as File;

  if (!file) {
    return new Response("No file uploaded", { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = new Uint8Array(bytes);

  try {
    await Deno.writeFile(`${IMAGES_DIR}/${file.name}`, buffer);
    return new Response("File uploaded successfully", { status: 200 });
  } catch (error) {
    console.error("Error saving file:", error);
    return new Response("Error saving file", { status: 500 });
  }
}

async function handleImageServe(request: Request): Promise<Response> {
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
