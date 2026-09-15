import { works } from "../src/catalog.js";

const slugs = new Set();
for (const work of works) {
  for (const field of ["slug","title","maker","year","material","movement","wing","shape","description","scaleStatus","provenance"]) {
    if (work[field] === undefined || work[field] === null || work[field] === "") throw new Error(`${work.slug || "unknown"}: missing ${field}`);
  }
  if (slugs.has(work.slug)) throw new Error(`duplicate slug: ${work.slug}`);
  slugs.add(work.slug);
  if (!/^[a-z0-9-]+$/.test(work.slug)) throw new Error(`unsafe slug: ${work.slug}`);
  if (!work.provenance.license || !work.provenance.source || !work.provenance.assetType) throw new Error(`${work.slug}: incomplete provenance`);
  if (work.scaleStatus === "verified") {
    if (!work.dimensionsM || Object.values(work.dimensionsM).some((n) => !Number.isFinite(n) || n <= 0)) throw new Error(`${work.slug}: verified scale requires positive dimensions`);
  } else if (work.scaleStatus === "display-only") {
    if (!Number.isFinite(work.displayHeightM) || work.displayHeightM <= 0) throw new Error(`${work.slug}: display-only scale requires a displayHeightM`);
  } else throw new Error(`${work.slug}: invalid scale status`);
}
console.log(`Catalog verified: ${works.length} works, ${slugs.size} unique slugs.`);
