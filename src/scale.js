export function scaleLabel(work) {
  if (work.scaleStatus === "verified" && work.dimensionsM) {
    const { x, y, z } = work.dimensionsM;
    return `Verified physical scale · ${x.toFixed(2)} × ${y.toFixed(2)} × ${z.toFixed(2)} m`;
  }
  return `Display scale only · ${Number(work.displayHeightM ?? 1.5).toFixed(2)} m presentation height`;
}

export function hasVerifiedPhysicalScale(work) {
  return work.scaleStatus === "verified" && Boolean(work.dimensionsM);
}
