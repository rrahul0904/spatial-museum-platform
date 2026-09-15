import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.argv[2] || "dist");
const port = Number(process.env.PORT || 4173);
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml" };

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    const requested = url.pathname === "/" ? "/index.html" : url.pathname;
    const safe = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, "");
    let file = resolve(join(root, safe));
    if (!file.startsWith(root)) throw new Error("outside root");
    try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); } catch {}
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream", "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found\n");
  }
}).listen(port, "0.0.0.0", () => console.log(`Spatial Museum listening on http://0.0.0.0:${port}`));
