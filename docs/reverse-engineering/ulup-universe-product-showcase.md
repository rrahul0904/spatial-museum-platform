# UluP Universe donor analysis — RE-220

## Scope

This document captures a clean-room reverse-engineering plan for the public UluP Universe experience linked from:

- Reddit: https://www.reddit.com/r/saasbuild/s/rWca1vKXsH
- Public route: https://www.ulupstudio.com/universe

The goal is **not** to copy UluP branding, code, proprietary prompts, assets, or visual styling. The reusable capability is a generic browser-based spatial product-discovery showroom.

## 1. Product thesis

Traditional product studios usually expose a grid of project cards. UluP Universe reframes that catalog as a place:

1. Enter a browser-based 3D room.
2. Move through the environment without a VR headset.
3. Encounter one product per lit pedestal.
4. Focus/select a pedestal.
5. Read the product pitch.
6. Follow an explicit link to the selected product.

The source creator describes the motivation as cross-product discovery: visitors who enter through one product often never notice the rest of the suite.

## 2. Observable source behavior

Directly observable from the public Reddit post:

- Browser-based 3D environment.
- No headset requirement.
- Multiple products represented as exhibits.
- Each product sits on a lit pedestal.
- Selecting an exhibit exposes a pitch and link.
- The spatial experience replaces a conventional cross-sell grid.

These are the behaviors to reproduce cleanly.

## 3. Ecosystem context

Public UluP material describes the suite as one connected system:

- **Spaces** — visual projects as connected nodes, with tasks, notes, collaboration, templates, public sharing, Present Mode, search, and MCP.
- **Desktop** — files/folders as connected canvas nodes, local AI/MCP, persisted positions, export to Spaces.
- **Life** — memories/goals as a constellation; photos, time-lapse, poster export, MCP, export to Spaces.
- **Spatial** — mixed-reality view of the Spaces node map.
- **UluPy / MCP** — AI interoperability layer.

The Universe route is therefore best treated as an **ecosystem discovery shell**, not as the system of record for those products.

## 4. Public architecture evidence

### Directly evidenced elsewhere in the ecosystem

- UluP Spatial is publicly described as using **Next.js + React Three Fiber + @react-three/xr**.
- Spatial reads the same **Supabase** backend as Spaces.
- UluP Desktop is publicly described as an **Electron** desktop app with a local MCP server.
- UluPy/MCP is publicly described as using **OAuth + Dynamic Client Registration** with scoped permissions.
- Spaces is publicly described as using a Supabase/SQL data model after moving away from the original Bubble implementation.

### Not verified for /universe

The following must remain explicit unknowns until independently observed:

- Exact renderer/framework used by /universe.
- Exact scene graph and collision/navigation implementation.
- Exact analytics/telemetry implementation.
- Exact CMS or catalog-management path.
- Asset source and optimization pipeline.

The rebuild should not claim those implementation details as source facts.

## 5. Canonical mapping

**Destination:** `rrahul0904/spatial-museum-platform`

Why:

- already owns a searchable catalog,
- already owns a browser WebGL viewer,
- already has deep-link routing,
- already has provenance/trust-state concepts,
- already has CI/build/acceptance gates,
- roadmap already includes WebXR and curator/analytics capability.

The donor should therefore become a **Product Universe mode** inside the canonical spatial museum platform rather than a new repository.

## 6. Clean-room user flow

### Public viewer

```text
Landing
  -> Enter Universe
  -> capability check
     -> WebGL path
        -> room
        -> move/orbit
        -> focus exhibit
        -> inspect overlay
        -> explicit outbound product click
     -> fallback path
        -> accessible product catalog
        -> inspect product
        -> explicit outbound product click
```

### Future curator

```text
Sign in
  -> Showrooms
  -> Create/Edit showroom
  -> Add product
  -> upload/select first-party asset
  -> place product / choose template
  -> preview
  -> publish
  -> view analytics
```

Curator scope is a later phase. Phase A should remain static-first and public.

## 7. Canonical product schema

Proposed clean-room data model:

```js
{
  id,
  slug,
  name,
  tagline,
  description,
  href,
  category,
  status,
  media: {
    poster,
    model
  },
  exhibit: {
    pedestalStyle,
    position: [x, y, z],
    rotation: [x, y, z],
    scale,
    spotlight
  },
  accessibility: {
    shortLabel,
    longDescription
  },
  provenance: {
    source,
    license,
    rightsNote
  }
}
```

Important: `position` and presentation metadata are our own implementation contract, not claims about the donor internals.

## 8. Scene behavior

### Movement

Phase A can reuse the existing repository's viewer primitives and keep navigation simple:

- mouse/touch drag for camera orientation,
- wheel/pinch zoom or bounded forward/back movement,
- keyboard arrows/WASD for desktop,
- visible touch controls for narrow screens,
- bounded scene extents,
- deterministic initial camera.

Avoid physics/collision complexity until user value is proven.

### Exhibit focus

A product becomes focused when:

- the user explicitly activates it,
- or navigation places the camera inside a focus radius and the user confirms.

Do not surprise-navigate directly to the external product.

### Detail overlay

Overlay fields:

- product name,
- short pitch,
- optional image/poster,
- category/status,
- explicit CTA,
- close/back control.

The overlay must be fully usable without pointer-only input.

## 9. Accessibility and fallback

A 3D experience cannot be the only route to product discovery.

Required:

- semantic product list outside/under the canvas,
- keyboard-accessible inspect actions,
- visible focus state,
- reduced-motion mode,
- WebGL-unavailable fallback,
- mobile/narrow viewport fallback,
- no autoplay audio,
- no mandatory pointer lock,
- clear external-link action.

The non-3D catalog must preserve full product-discovery parity.

## 10. Telemetry contract

Phase A can use local event capture first so behavior is testable without hosted analytics.

Event names:

- `scene_enter`
- `scene_ready`
- `scene_error`
- `fallback_used`
- `exhibit_focus`
- `exhibit_open`
- `exhibit_close`
- `outbound_click`

Suggested fields:

```json
{
  "event": "exhibit_open",
  "showroom_id": "default",
  "product_id": "product-1",
  "input_mode": "keyboard",
  "viewport_class": "desktop",
  "renderer": "webgl",
  "timestamp": "ISO-8601"
}
```

Later hosted telemetry should add session aggregation without collecting unnecessary personal data.

## 11. Metrics

The source creator explicitly questioned whether the experience is useful or merely a gimmick. That makes measurement part of the product, not an afterthought.

Primary comparison:

**spatial showroom vs existing catalog/grid**

Useful metrics:

- products viewed per visit,
- unique products focused,
- detail-open rate,
- outbound click-through rate,
- time to first product open,
- fallback rate,
- bounce/early-exit rate,
- mobile completion rate,
- p75 scene-ready time.

Do not optimize for raw time-in-room if it does not increase meaningful product discovery.

## 12. Performance budget

Initial budget:

- meaningful first paint before heavy scene assets,
- lazy-load 3D assets,
- no third-party model download before showroom entry,
- compressed textures,
- cap concurrent lights/shadows,
- degrade gracefully on low-power/mobile devices,
- keep a static first-party demo scene for CI.

Exact thresholds should be measured on the implemented slice rather than invented in this research doc.

## 13. Security / privacy

Public viewer:

- no authentication required,
- no arbitrary remote model URLs in Phase A,
- no executable scene content,
- strict outbound URL allowlist/schema validation,
- external links use safe rel attributes,
- telemetry contains no free-form user text.

Future curator:

- tenant-scoped showroom/product ownership,
- server-side URL validation,
- object-storage MIME/type/size validation,
- GLB/glTF parser hardening,
- upload quarantine/processing boundary,
- audit trail for publish changes.

## 14. Original monetization extension

This is **our** productization direction, not a claim about UluP's revenue model.

Possible packaging:

- **Free** — one public showroom, small product count, default theme.
- **Pro** — custom branding/domain, analytics, more products, scene templates.
- **Agency** — multiple client showrooms, reusable themes, role-based collaborators.
- **Spatial add-on** — optional WebXR exhibition mode after browser parity is certified.

The business case should be validated against whether spatial discovery measurably improves cross-product exploration.

## 15. Phase A implementation slice

1. Add a product-showcase schema.
2. Add six first-party demo products.
3. Add deterministic pedestal layout.
4. Add browser scene route/mode.
5. Add focus + inspect overlay.
6. Add URL/deep-link state.
7. Add keyboard/touch support.
8. Add accessible grid fallback.
9. Add local telemetry contract.
10. Add tests and build validation.

## 16. Phase A acceptance criteria

Repository gate:

- `npm run check` green.
- Product catalog schema validates.
- Deep links resolve deterministically.
- WebGL failure renders the complete fallback catalog.
- Reduced-motion path remains usable.
- Narrow/mobile viewport remains usable.
- Keyboard can reach/open every product via the fallback path.
- External links require explicit activation.
- Local telemetry payloads are deterministic and test-covered.
- Only first-party/CC0 demo assets are used.

## 17. Later phases

### Phase B — showroom polish

- configurable room templates,
- spotlight/pedestal variants,
- product posters and safe GLB/glTF assets,
- mobile interaction tuning,
- scene transitions.

### Phase C — hosted analytics

- event ingestion,
- product-discovery funnel,
- showroom vs grid experiment,
- privacy-preserving session aggregation.

### Phase D — curator platform

- authentication,
- multi-tenant showrooms,
- publishing,
- product CMS,
- custom branding/domain.

### Phase E — WebXR

Reuse the canonical scene/catalog data only after the 2D-browser experience is certified. WebXR must not become the primary product path.

## 18. Clean-room boundary

Allowed:

- reproduce publicly observable workflows,
- implement generic spatial-showroom concepts,
- use publicly documented ecosystem architecture as context,
- use original assets and schemas.

Not allowed:

- copy UluP code,
- copy UluP visual assets,
- copy product names/branding into our shipped demo,
- claim unverified /universe framework details as fact,
- import proprietary prompts or private APIs.

## 19. Tracker / GitHub lineage

- Master tracker ID: **RE-220**
- Canonical repo: `rrahul0904/spatial-museum-platform`
- GitHub issue: #2
- Branch: `reverse/ulup-universe-product-showcase`

