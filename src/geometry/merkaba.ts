import type { Vec3, Edge, Face, MerkabaGeometry, Polyhedron, Tetrahedron } from './types';

// ─── Canonical edge index for a tetrahedron (all 6 pairs of 4 vertices) ───────
export const TETRA_EDGES: Edge[] = [
  [0, 1], [0, 2], [0, 3],
  [1, 2], [1, 3], [2, 3],
];

// ─── Face winding for tetra A (CCW from outside) ─────────────────────────────
export const TETRA_A_FACES: Face[] = [
  [0, 1, 2],
  [0, 3, 1],
  [0, 2, 3],
  [1, 3, 2],
];

// ─── Face winding for tetra B (reversed relative to A) ───────────────────────
export const TETRA_B_FACES: Face[] = [
  [0, 2, 1],
  [0, 1, 3],
  [0, 3, 2],
  [1, 2, 3],
];

// ─── Cube edges (12 edges connecting adjacent vertices) ──────────────────────
// Cube vertices indexed 0-7 in the order defined by buildCanonicalMerkaba
const CUBE_EDGES: Edge[] = [
  // Bottom face (y = -s): 0(-,-,-), 1(-,-,+), 4(+,-,-), 5(+,-,+)
  [0, 1], [0, 4], [1, 5], [4, 5],
  // Top face (y = +s): 2(-,+,-), 3(-,+,+), 6(+,+,-), 7(+,+,+)
  [2, 3], [2, 6], [3, 7], [6, 7],
  // Vertical edges
  [0, 2], [1, 3], [4, 6], [5, 7],
];

// Cube faces (6 quads split into 2 triangles each → 12 triangles)
const CUBE_FACES: Face[] = [
  // -x face: 0,1,2,3
  [0, 1, 3], [0, 3, 2],
  // +x face: 4,5,6,7
  [4, 6, 7], [4, 7, 5],
  // -y face: 0,1,4,5
  [0, 4, 5], [0, 5, 1],
  // +y face: 2,3,6,7
  [2, 3, 7], [2, 7, 6],
  // -z face: 0,2,4,6
  [0, 2, 6], [0, 6, 4],
  // +z face: 1,3,5,7
  [1, 5, 7], [1, 7, 3],
];

// ─── Octahedron edges (12 edges) ──────────────────────────────────────────────
// Vertices: 0(+x), 1(-x), 2(+y), 3(-y), 4(+z), 5(-z)
const OCTA_EDGES: Edge[] = [
  [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 4], [2, 5], [3, 4], [3, 5],
];

// Octahedron faces (8 triangles)
const OCTA_FACES: Face[] = [
  [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
  [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5],
];

// ─── Main builder ─────────────────────────────────────────────────────────────

/**
 * Build the canonical Merkaba / stella octangula geometry.
 *
 * Coordinate system: centred at origin, scale s.
 *   Tetra A vertices: sign-product xyz = +1 (corners of the cube where #negatives is even)
 *   Tetra B vertices: sign-product xyz = -1 (corners of the cube where #negatives is odd)
 *
 * At scale s=1:
 *   - Cube edge length        = 2
 *   - Tetra edge length       = 2√2
 *   - Inner octahedron edge   = √2
 *   - Tetra dihedral angle    = acos(1/3) ≈ 70.5288°
 */
export function buildCanonicalMerkaba(scale = 1): MerkabaGeometry {
  const s = scale;

  // Tetrahedron A: vertices where product of signs = +1
  const tetraAVerts: Vec3[] = [
    [ s,  s,  s],
    [ s, -s, -s],
    [-s,  s, -s],
    [-s, -s,  s],
  ];

  // Tetrahedron B: vertices where product of signs = -1
  const tetraBVerts: Vec3[] = [
    [-s, -s, -s],
    [-s,  s,  s],
    [ s, -s,  s],
    [ s,  s, -s],
  ];

  // Outer cube: all 8 corners of the cube
  const cubeVerts: Vec3[] = [
    [-s, -s, -s],
    [-s, -s,  s],
    [-s,  s, -s],
    [-s,  s,  s],
    [ s, -s, -s],
    [ s, -s,  s],
    [ s,  s, -s],
    [ s,  s,  s],
  ];

  // Inner octahedron: face-centres of the cube = axis-aligned unit-ball vertices
  const octaVerts: Vec3[] = [
    [ s, 0, 0],
    [-s, 0, 0],
    [0,  s, 0],
    [0, -s, 0],
    [0, 0,  s],
    [0, 0, -s],
  ];

  const tetraA: Tetrahedron = {
    id: 'A',
    vertices: tetraAVerts,
    edges: TETRA_EDGES,
    faces: TETRA_A_FACES,
  };

  const tetraB: Tetrahedron = {
    id: 'B',
    vertices: tetraBVerts,
    edges: TETRA_EDGES,
    faces: TETRA_B_FACES,
  };

  const outerCube: Polyhedron = {
    vertices: cubeVerts,
    edges: CUBE_EDGES,
    faces: CUBE_FACES,
  };

  const innerOctahedron: Polyhedron = {
    vertices: octaVerts,
    edges: OCTA_EDGES,
    faces: OCTA_FACES,
  };

  return {
    center: [0, 0, 0],
    scale: s,
    tetrahedra: [tetraA, tetraB],
    outerCube,
    innerOctahedron,
    metrics: computeMetrics(s),
  };
}

function computeMetrics(s: number) {
  return {
    cubeEdgeLength: 2 * s,
    tetraEdgeLength: 2 * Math.sqrt(2) * s,
    innerOctahedronEdgeLength: Math.sqrt(2) * s,
    tetrahedronDihedralRad: Math.acos(1 / 3),
    tetrahedronDihedralDeg: (Math.acos(1 / 3) * 180) / Math.PI,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function dist(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function centroid(verts: Vec3[]): Vec3 {
  const n = verts.length;
  let sx = 0, sy = 0, sz = 0;
  for (const v of verts) { sx += v[0]; sy += v[1]; sz += v[2]; }
  return [sx / n, sy / n, sz / n];
}

/** Dihedral angle between two adjacent faces of a tetrahedron */
export function tetraDihedralAngle(verts: Vec3[]): number {
  // Use edge [0,1]. Adjacent faces sharing this edge: face [0,1,2] and [0,1,3]
  const [v0, v1, v2, v3] = verts;
  const n1 = faceNormal(v0, v1, v2);
  const n2 = faceNormal(v0, v1, v3);
  const dot = n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2];
  // clamp for numerical safety
  return Math.acos(Math.max(-1, Math.min(1, Math.abs(dot))));
}

function faceNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const ab: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ac: Vec3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const nx = ab[1] * ac[2] - ab[2] * ac[1];
  const ny = ab[2] * ac[0] - ab[0] * ac[2];
  const nz = ab[0] * ac[1] - ab[1] * ac[0];
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  return [nx / len, ny / len, nz / len];
}
