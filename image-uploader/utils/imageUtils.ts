import { extname } from "https://deno.land/std@0.216.0/path/mod.ts";

export function getImageMimeType(filename: string): string {
  const ext = extname(filename).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".tiff":
      return "image/tiff";
    case ".bmp":
      return "image/bmp";
    default:
      return "application/octet-stream";
  }
}

export function isImageFile(filename: string): boolean {
  const mimeType = getImageMimeType(filename);
  return mimeType.startsWith("image/");
}
