const searchable = (work) => [
  work.title,
  work.maker,
  work.material,
  work.movement,
  work.wing,
  work.description
].join(" ").toLowerCase();

export function filterWorks(works, { query = "", wing = "all", scale = "all" } = {}) {
  const needle = query.trim().toLowerCase();
  return works.filter((work) => {
    if (wing !== "all" && work.wing !== wing) return false;
    if (scale !== "all" && work.scaleStatus !== scale) return false;
    return !needle || searchable(work).includes(needle);
  });
}
