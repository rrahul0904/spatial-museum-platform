import { cp, mkdir, rm, access } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";

const source = resolve("src");
const dist = resolve("dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(source, dist, { recursive: true });
for (const required of ["index.html", "app.js", "viewer.js", "catalog.js", "styles.css"]) {
  await access(resolve(dist, required), constants.R_OK);
}
console.log("Built dist/ with spatial museum application assets.");
