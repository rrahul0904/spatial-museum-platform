export const works = [
  {
    slug: "helix-no-1",
    title: "Helix No. 1",
    maker: "Spatial Museum Studio",
    year: 2026,
    material: "Procedural bronze study",
    movement: "Generative form",
    wing: "Form",
    shape: "helix",
    description: "A procedural double-helix study built from open geometry for WebGL and spatial-interface testing.",
    dimensionsM: { x: 0.62, y: 1.8, z: 0.62 },
    scaleStatus: "verified",
    provenance: { license: "CC0-1.0", source: "Generated in repository", assetType: "procedural" }
  },
  {
    slug: "orbit-study",
    title: "Orbit Study",
    maker: "Spatial Museum Studio",
    year: 2026,
    material: "Procedural steel study",
    movement: "Computational sculpture",
    wing: "Motion",
    shape: "orbit",
    description: "Nested orbital bands explore negative space and silhouette without external 3D assets.",
    dimensionsM: { x: 1.4, y: 1.4, z: 1.4 },
    scaleStatus: "verified",
    provenance: { license: "CC0-1.0", source: "Generated in repository", assetType: "procedural" }
  },
  {
    slug: "monolith-variation",
    title: "Monolith Variation",
    maker: "Spatial Museum Studio",
    year: 2026,
    material: "Procedural basalt study",
    movement: "Minimal form",
    wing: "Mass",
    shape: "monolith",
    description: "A faceted monolith used to exercise lighting, camera fit, and physically meaningful scale labels.",
    dimensionsM: { x: 0.7, y: 2.25, z: 0.5 },
    scaleStatus: "verified",
    provenance: { license: "CC0-1.0", source: "Generated in repository", assetType: "procedural" }
  },
  {
    slug: "folded-signal",
    title: "Folded Signal",
    maker: "Spatial Museum Studio",
    year: 2026,
    material: "Procedural aluminum study",
    movement: "Digital constructivism",
    wing: "Surface",
    shape: "fold",
    description: "A folded ribbon demonstrates how a catalog can distinguish exhibition display size from verified physical dimensions.",
    dimensionsM: null,
    displayHeightM: 1.6,
    scaleStatus: "display-only",
    provenance: { license: "CC0-1.0", source: "Generated in repository", assetType: "procedural" }
  },
  {
    slug: "lattice-bloom",
    title: "Lattice Bloom",
    maker: "Spatial Museum Studio",
    year: 2026,
    material: "Procedural polymer study",
    movement: "Parametric form",
    wing: "Structure",
    shape: "bloom",
    description: "A radial lattice form for testing dense geometry, interaction, and metadata-driven exhibition grouping.",
    dimensionsM: null,
    displayHeightM: 1.35,
    scaleStatus: "display-only",
    provenance: { license: "CC0-1.0", source: "Generated in repository", assetType: "procedural" }
  },
  {
    slug: "counterweight",
    title: "Counterweight",
    maker: "Spatial Museum Studio",
    year: 2026,
    material: "Procedural stone and brass study",
    movement: "Balance study",
    wing: "Balance",
    shape: "counterweight",
    description: "Asymmetric primitives form a balancing study and provide a clean baseline for future GLB ingestion.",
    dimensionsM: { x: 1.2, y: 1.55, z: 0.75 },
    scaleStatus: "verified",
    provenance: { license: "CC0-1.0", source: "Generated in repository", assetType: "procedural" }
  }
];

export const catalogFacets = {
  wing: [...new Set(works.map((work) => work.wing))].sort(),
  material: [...new Set(works.map((work) => work.material))].sort(),
  movement: [...new Set(works.map((work) => work.movement))].sort()
};

export function getWork(slug) {
  return works.find((work) => work.slug === slug) ?? null;
}
