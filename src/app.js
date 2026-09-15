import { works, catalogFacets, getWork } from "./catalog.js";
import { filterWorks } from "./search.js";
import { hasVerifiedPhysicalScale, scaleLabel } from "./scale.js";
import { mountViewer } from "./viewer.js";

const app = document.querySelector("#app");
let disposeViewer = () => {};
let state = { query: "", wing: "all", scale: "all" };

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
const icon = (verified) => verified ? "●" : "○";

function shell(content) {
  return `<header class="site-header"><a class="brand" href="#/">Spatial Museum</a><span class="eyebrow">OPEN SPATIAL COLLECTION</span><a class="about-link" href="#/about">About</a></header>${content}<footer>Clean-room spatial museum prototype · procedural CC0 demo collection · MIT software</footer>`;
}

function card(work) {
  return `<article class="work-card" data-wing="${escapeHtml(work.wing)}">
    <a href="#/work/${work.slug}" aria-label="Open ${escapeHtml(work.title)}">
      <div class="card-art shape-${work.shape}"><span>${escapeHtml(work.wing)}</span></div>
      <div class="card-copy"><div class="card-meta"><span>${work.year}</span><span>${escapeHtml(work.material.replace("Procedural ", ""))}</span></div>
      <h2>${escapeHtml(work.title)}</h2><p>${escapeHtml(work.maker)}</p>
      <div class="scale-chip ${work.scaleStatus}">${icon(hasVerifiedPhysicalScale(work))} ${escapeHtml(work.scaleStatus === "verified" ? "verified scale" : "display scale")}</div></div>
    </a></article>`;
}

function renderHome() {
  disposeViewer();
  const filtered = filterWorks(works, state);
  app.innerHTML = shell(`<main>
    <section class="hero"><div><p class="eyebrow">A CLEAN-ROOM REVERSE-ENGINEERING STUDY</p><h1>Culture, rendered<br>in space.</h1><p class="lede">A data-driven museum shell for searchable collections, interactive 3D works, provenance, and trustworthy physical-scale metadata.</p></div><div class="hero-stat"><strong>${works.length}</strong><span>procedural works</span><strong>${works.filter(hasVerifiedPhysicalScale).length}</strong><span>verified-scale studies</span></div></section>
    <section class="controls" aria-label="Catalog filters"><label>Search<input id="search" type="search" placeholder="Title, material, movement…" value="${escapeHtml(state.query)}"></label><label>Wing<select id="wing"><option value="all">All wings</option>${catalogFacets.wing.map((v)=>`<option ${state.wing===v?"selected":""}>${escapeHtml(v)}</option>`).join("")}</select></label><label>Scale<select id="scale"><option value="all">All scale states</option><option value="verified" ${state.scale==="verified"?"selected":""}>Verified physical scale</option><option value="display-only" ${state.scale==="display-only"?"selected":""}>Display scale only</option></select></label><div class="result-count" aria-live="polite">${filtered.length} work${filtered.length===1?"":"s"}</div></section>
    <section class="catalog" id="catalog">${filtered.length ? filtered.map(card).join("") : `<div class="empty"><h2>No works match.</h2><p>Try removing a filter or using a broader search.</p></div>`}</section>
  </main>`);
  document.querySelector("#search").addEventListener("input", (e)=>{ state.query=e.target.value; renderHome(); queueMicrotask(()=>{ const el=document.querySelector("#search"); el?.focus(); el?.setSelectionRange(state.query.length,state.query.length); }); });
  document.querySelector("#wing").addEventListener("change", (e)=>{ state.wing=e.target.value; renderHome(); });
  document.querySelector("#scale").addEventListener("change", (e)=>{ state.scale=e.target.value; renderHome(); });
}

function renderWork(work) {
  disposeViewer();
  app.innerHTML = shell(`<main class="work-page"><a class="back" href="#/">← Collection</a><div class="work-layout">
    <section class="viewer-panel"><canvas id="viewer" aria-label="Interactive 3D view of ${escapeHtml(work.title)}"></canvas><div class="viewer-help">Drag to rotate · Scroll to zoom</div></section>
    <section class="work-info"><p class="eyebrow">${escapeHtml(work.wing)} WING · ${work.year}</p><h1>${escapeHtml(work.title)}</h1><p class="maker">${escapeHtml(work.maker)}</p><p class="description">${escapeHtml(work.description)}</p>
      <dl><div><dt>Material</dt><dd>${escapeHtml(work.material)}</dd></div><div><dt>Movement</dt><dd>${escapeHtml(work.movement)}</dd></div><div><dt>Scale</dt><dd class="${work.scaleStatus}">${icon(hasVerifiedPhysicalScale(work))} ${escapeHtml(scaleLabel(work))}</dd></div><div><dt>License</dt><dd>${escapeHtml(work.provenance.license)}</dd></div><div><dt>Source</dt><dd>${escapeHtml(work.provenance.source)}</dd></div><div><dt>Asset</dt><dd>${escapeHtml(work.provenance.assetType)}</dd></div></dl>
      <aside class="trust-note"><strong>${hasVerifiedPhysicalScale(work)?"Physical dimensions verified":"Display dimensions only"}</strong><p>${hasVerifiedPhysicalScale(work)?"This demo record contains explicit physical dimensions and may be presented at a meaningful 1:1 scale in future AR modes.":"No authoritative physical dimensions are asserted. Future AR placement should label any chosen size as presentation scale."}</p></aside>
    </section></div></main>`);
  disposeViewer = mountViewer(document.querySelector("#viewer"), work);
}

function renderAbout() {
  disposeViewer();
  app.innerHTML = shell(`<main class="about"><p class="eyebrow">ABOUT THE BUILD</p><h1>A museum shell with evidence boundaries.</h1><p class="lede">This repository is a clean-room implementation inspired by public spatial-museum patterns. It intentionally ships no third-party museum scans or proprietary catalog assets.</p><div class="about-grid"><section><h2>Phase 1</h2><p>Catalog, faceted search, data-driven work pages, procedural WebGL, provenance, trustworthy scale states, production serving, tests, and CI.</p></section><section><h2>Next</h2><p>GLB ingestion, optimization and thumbnails; AR/Quick Look; curator workflows; semantic search; and object-storage publishing.</p></section><section><h2>Rights</h2><p>Software is MIT. Demo geometry and demo collection records are generated in-repository and labeled CC0 for clean testing.</p></section></div></main>`);
}

function route() {
  const path = location.hash.slice(1) || "/";
  if (path === "/" || path === "") return renderHome();
  if (path === "/about") return renderAbout();
  if (path.startsWith("/work/")) {
    const work = getWork(path.split("/")[2]);
    return work ? renderWork(work) : renderNotFound();
  }
  renderNotFound();
}
function renderNotFound(){ disposeViewer(); app.innerHTML=shell(`<main class="about"><p class="eyebrow">404</p><h1>That gallery is empty.</h1><p><a class="back" href="#/">Return to the collection</a></p></main>`); }

addEventListener("hashchange", route);
route();
