import test from "node:test";
import assert from "node:assert/strict";
import { works, catalogFacets, getWork } from "../src/catalog.js";
import { filterWorks } from "../src/search.js";
import { hasVerifiedPhysicalScale, scaleLabel } from "../src/scale.js";

test("catalog ships six procedural works", () => assert.equal(works.length, 6));
test("all slugs are unique", () => assert.equal(new Set(works.map((w)=>w.slug)).size, works.length));
test("every demo work has explicit provenance", () => assert.ok(works.every((w)=>w.provenance?.license === "CC0-1.0" && w.provenance?.source)));
test("verified works have positive XYZ dimensions", () => assert.ok(works.filter(hasVerifiedPhysicalScale).every((w)=>Object.values(w.dimensionsM).every((n)=>n>0))));
test("display-only works never pretend to be verified", () => assert.ok(works.filter((w)=>w.scaleStatus==="display-only").every((w)=>!hasVerifiedPhysicalScale(w))));
test("scale labels distinguish verified and presentation scale", () => { assert.match(scaleLabel(works[0]), /Verified physical scale/); assert.match(scaleLabel(works.find((w)=>w.scaleStatus==="display-only")), /Display scale only/); });
test("getWork resolves canonical slug", () => assert.equal(getWork("orbit-study")?.title, "Orbit Study"));
test("getWork returns null for unknown work", () => assert.equal(getWork("missing"), null));
test("search matches metadata and prose case-insensitively", () => assert.deepEqual(filterWorks(works,{query:"BASALT"}).map((w)=>w.slug), ["monolith-variation"]));
test("wing filter is exact", () => assert.deepEqual(filterWorks(works,{wing:"Motion"}).map((w)=>w.slug), ["orbit-study"]));
test("combined scale and query filtering composes", () => assert.deepEqual(filterWorks(works,{query:"procedural",scale:"display-only"}).map((w)=>w.slug).sort(), ["folded-signal","lattice-bloom"]));
test("facets are unique and sorted", () => assert.deepEqual(catalogFacets.wing, [...catalogFacets.wing].sort()));
