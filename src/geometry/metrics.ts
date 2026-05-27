import type { MerkabaGeometry } from './types';
import { dist, centroid } from './merkaba';

/** Format a number to fixed decimal places */
export function fmt(n: number, decimals = 6): string {
  return n.toFixed(decimals);
}

/** Format a Vec3 */
export function fmtVec3(v: readonly [number, number, number], decimals = 6): string {
  return `(${fmt(v[0], decimals)}, ${fmt(v[1], decimals)}, ${fmt(v[2], decimals)})`;
}

/** Compute all derived metrics summary from a MerkabaGeometry (single source of truth) */
export function computeGeometrySummary(geo: MerkabaGeometry) {
  const [tA, tB] = geo.tetrahedra;

  // Verify edge lengths (just compute for display)
  const tetraAEdgeLengths = [
    [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3],
  ].map(([a, b]) => dist(tA.vertices[a], tA.vertices[b]));

  const centrA = centroid(tA.vertices);
  const centrB = centroid(tB.vertices);

  return {
    center: geo.center,
    scale: geo.scale,
    tetraAVertices: tA.vertices,
    tetraBVertices: tB.vertices,
    cubeVertices: geo.outerCube.vertices,
    octahedronVertices: geo.innerOctahedron.vertices,
    metrics: geo.metrics,
    derived: {
      tetraAEdgeLength: tetraAEdgeLengths[0],
      tetraACentroid: centrA,
      tetraBCentroid: centrB,
    },
  };
}
