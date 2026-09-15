# Spatial Museum Platform

A clean-room spatial museum prototype inspired by public 3D-museum interaction patterns. Phase 1 establishes the product shell without copying third-party museum assets: searchable collection browsing, data-driven work pages, procedural WebGL sculptures, provenance, and explicit physical-scale trust states.

## What ships

- Responsive museum homepage and catalog with search, wing, and scale filters.
- Six generated demo works with CC0 demo metadata and no third-party 3D assets.
- Interactive dependency-free WebGL viewer: drag to rotate and scroll/pinch-wheel to zoom.
- Explicit distinction between **verified physical scale** and **display scale only**.
- Per-work provenance, source, license, material, movement, wing, and description.
- Hash-routed deep links (`#/work/<slug>`) with a lightweight about surface.
- Dependency-free Node production server with path confinement and basic security headers.
- Catalog validation, Node test suite, deterministic build, syntax gates, CI, and live HTTP acceptance.

## Run locally

```bash
npm ci
npm run dev
# open http://localhost:4173
```

Production-style run:

```bash
npm run build
npm start
```

Full verification:

```bash
npm run check
```

## Architecture

```text
src/catalog.js  -> canonical collection records + facets
src/search.js   -> pure catalog filtering
src/scale.js    -> physical/display scale trust contract
src/viewer.js   -> dependency-free procedural WebGL renderer
src/app.js      -> routes, catalog UX, work-detail UX
scripts/        -> build, server, catalog verifier
test/           -> behavior and trust-contract tests
```

This deliberately keeps the first slice static-first. Later phases can replace procedural geometry with an ingestion pipeline for GLB/glTF while preserving the catalog, provenance, and scale contracts.

## Roadmap

1. **Phase 1 — foundation (this release):** catalog, search, 3D viewer, provenance, scale trust, CI.
2. **Phase 2 — asset pipeline:** upload/discovery, GLB validation/optimization, thumbnails, checksums, object storage.
3. **Phase 3 — spatial:** WebXR AR/VR, Apple Quick Look/USDZ, surface placement, verified 1:1 scale.
4. **Phase 4 — curator platform:** authentication, museum CMS, collections/exhibitions, semantic search, publishing and analytics.

## Rights and provenance

The software in this repository is MIT licensed. The demo catalog and procedural geometry are generated specifically for this project and marked CC0 so the repository can be tested and extended without importing rights from museum scans or institutional assets.
