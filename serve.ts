// serve.ts — a tiny static file server for trying the guide locally.
//
// Run it with:  node serve.ts
// Then open:    http://localhost:8080
//
// It serves only the app/ folder next to this file, maps a handful of
// extensions to content types, and refuses paths that try to escape app/.
// Node standard library only; nothing here is needed by the hand-in itself.

import { readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = join(dirname(fileURLToPath(import.meta.url)), "app");
const port = 8080;

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") {
    pathname = "/index.html";
  }
  const filePath = normalize(join(appDir, pathname));
  if (!filePath.startsWith(appDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  try {
    const stat = statSync(filePath);
    if (!stat.isFile()) {
      throw new Error("not a file");
    }
    const body = readFileSync(filePath);
    const type = contentTypes[extname(filePath)] ?? "application/octet-stream";
    response.writeHead(200, { "content-type": type });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found: " + pathname);
  }
});

server.listen(port, () => {
  console.log("gta6-trophy-guide serving app/ at http://localhost:" + port);
});
