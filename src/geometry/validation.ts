import type { Vec3, MerkabaGeometry, ValidationCheck, ValidationSummary, ValidationCheckId } from './types';
import { dist, centroid, tetraDihedralAngle } from './merkaba';
import { buildCanonicalMerkaba } from './merkaba';
import { computeGeometrySummary } from './metrics';

const DEFAULT_EPSILON = 1e-6;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function posEps(epsilon: number, scale: number): number {
  return epsilon * Math.max(1, Math.abs(scale));
}

function pass(
  id: ValidationCheckId,
  expected: string,
  actual: string,
  delta: number,
  epsilon: number,
): ValidationCheck {
  return { id, ok: true, expected, actual, delta, epsilon };
}

function fail(
  id: ValidationCheckId,
  expected: string,
  actual: string,
  delta: number,
  epsilon: number,
): ValidationCheck {
  return { id, ok: false, expected, actual, delta, epsilon };
}

function check(
  id: ValidationCheckId,
  expectedVal: number,
  actualVal: number,
  threshold: number,
  epsilon: number,
  decimals = 8,
): ValidationCheck {
  const delta = Math.abs(expectedVal - actualVal);
  const ok = delta <= threshold;
  const fmt = (n: number) => n.toFixed(decimals);
  const c = ok ? pass : fail;
  return c(id, fmt(expectedVal), fmt(actualVal), delta, epsilon);
}

// ─── Individual validators ────────────────────────────────────────────────────

/** All 6 edges of a tetrahedron must have equal length */
export function validateEqualEdgeLengths(
  verts: Vec3[],
  id: 'A' | 'B',
  epsilon = DEFAULT_EPSILON,
  scale = 1,
): ValidationCheck {
  const checkId: ValidationCheckId =
    id === 'A' ? 'equal-edge-lengths-A' : 'equal-edge-lengths-B';

  const edges = [
    [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3],
  ] as const;
  const lengths = edges.map(([a, b]) => dist(verts[a], verts[b]));
  const expected = lengths[0];
  let minLen = lengths[0];
  let maxLen = lengths[0];
  let maxDelta = 0;
  for (const l of lengths) {
    if (l < minLen) minLen = l;
    if (l > maxLen) maxLen = l;
    const d = Math.abs(l - expected);
    if (d > maxDelta) maxDelta = d;
  }
  const threshold = posEps(epsilon, scale);
  return {
    id: checkId,
    ok: maxDelta <= threshold,
    expected: expected.toFixed(8),
    actual: `min=${minLen.toFixed(8)}, max=${maxLen.toFixed(8)}`,
    delta: maxDelta,
    epsilon,
  };
}

/** Both tetrahedra must share centroid at origin */
export function validateSharedCenter(
  vertsA: Vec3[],
  vertsB: Vec3[],
  epsilon = DEFAULT_EPSILON,
  scale = 1,
): ValidationCheck {
  const cA = centroid(vertsA);
  const cB = centroid(vertsB);
  const dA = dist(cA, [0, 0, 0]);
  const dB = dist(cB, [0, 0, 0]);
  const maxD = Math.max(dA, dB);
  const threshold = posEps(epsilon, scale);
  const ok = maxD <= threshold;
  return {
    id: 'shared-center',
    ok,
    expected: '0.000000',
    actual: maxD.toFixed(8),
    delta: maxD,
    epsilon,
  };
}

/** The 8 combined vertices of both tetrahedra must match the 8 cube corners */
export function validateCubeCorrespondence(
  vertsA: Vec3[],
  vertsB: Vec3[],
  cubeVerts: Vec3[],
  epsilon = DEFAULT_EPSILON,
  scale = 1,
): ValidationCheck {
  const all = [...vertsA, ...vertsB];
  const threshold = posEps(epsilon, scale);
  let maxD = 0;
  for (const v of all) {
    let minD = Infinity;
    for (const c of cubeVerts) {
      const d = dist(v, c);
      if (d < minD) minD = d;
    }
    if (minD > maxD) maxD = minD;
  }
  return {
    id: 'cube-correspondence',
    ok: maxD <= threshold,
    expected: '0.000000',
    actual: maxD.toFixed(8),
    delta: maxD,
    epsilon,
  };
}

/** Inner octahedron vertices must lie at (±s, 0, 0), (0, ±s, 0), (0, 0, ±s) */
export function validateInnerOctahedronVertices(
  octaVerts: Vec3[],
  scale: number,
  epsilon = DEFAULT_EPSILON,
): ValidationCheck {
  const expected: Vec3[] = [
    [ scale, 0, 0], [-scale, 0, 0],
    [0,  scale, 0], [0, -scale, 0],
    [0, 0,  scale], [0, 0, -scale],
  ];
  const threshold = posEps(epsilon, scale);
  let maxD = 0;
  for (const v of octaVerts) {
    let minD = Infinity;
    for (const e of expected) {
      const d = dist(v, e);
      if (d < minD) minD = d;
    }
    if (minD > maxD) maxD = minD;
  }
  return {
    id: 'inner-octahedron',
    ok: maxD <= threshold,
    expected: '0.000000',
    actual: maxD.toFixed(8),
    delta: maxD,
    epsilon,
  };
}

/** Combined centroid of all tetrahedra vertices must be at origin */
export function validateOriginCenter(
  vertsA: Vec3[],
  vertsB: Vec3[],
  epsilon = DEFAULT_EPSILON,
  scale = 1,
): ValidationCheck {
  const all = [...vertsA, ...vertsB];
  const c = centroid(all);
  const d = dist(c, [0, 0, 0]);
  const threshold = posEps(epsilon, scale);
  return {
    id: 'origin-center',
    ok: d <= threshold,
    expected: '0.000000',
    actual: d.toFixed(8),
    delta: d,
    epsilon,
  };
}

/** Dihedral angle of tetrahedron must equal acos(1/3) */
export function validateDihedralAngle(
  verts: Vec3[],
  id: 'A' | 'B',
  expectedRad: number,
  epsilon = DEFAULT_EPSILON,
): ValidationCheck {
  const actual = tetraDihedralAngle(verts);
  return check(id === 'A' ? 'dihedral-angle-A' : 'dihedral-angle-B', expectedRad, actual, epsilon, epsilon, 10);
}

/** Geometry scaled by k must preserve all ratios */
export function validateScaleInvariance(
  baseGeometry: MerkabaGeometry,
  testScale: number,
  epsilon = DEFAULT_EPSILON,
): ValidationCheck {
  const scaled = buildCanonicalMerkaba(testScale);
  const ratio = testScale / baseGeometry.scale;
  const expectedTetraEdge = baseGeometry.metrics.tetraEdgeLength * ratio;
  const actualTetraEdge = scaled.metrics.tetraEdgeLength;
  const delta = Math.abs(actualTetraEdge - expectedTetraEdge);
  const threshold = posEps(epsilon, testScale);
  return {
    id: 'scale-invariance',
    ok: delta <= threshold,
    expected: expectedTetraEdge.toFixed(8),
    actual: actualTetraEdge.toFixed(8),
    delta,
    epsilon,
  };
}

/**
 * Verify the derived geometry summary remains consistent with the geometry object.
 * This is a runtime self-consistency check, not a UI integration test.
 */
export function validateGeometrySelfConsistency(
  geometry: MerkabaGeometry,
  summaryVerticesA: Vec3[],
  summaryVerticesB: Vec3[],
  epsilon = DEFAULT_EPSILON,
  scale = 1,
): ValidationCheck {
  const threshold = posEps(epsilon, scale);
  let maxD = 0;
  for (let i = 0; i < geometry.tetrahedra[0].vertices.length; i++) {
    const d = dist(geometry.tetrahedra[0].vertices[i], summaryVerticesA[i]);
    if (d > maxD) maxD = d;
  }
  for (let i = 0; i < geometry.tetrahedra[1].vertices.length; i++) {
    const d = dist(geometry.tetrahedra[1].vertices[i], summaryVerticesB[i]);
    if (d > maxD) maxD = d;
  }
  return {
    id: 'geometry-self-consistency',
    ok: maxD <= threshold,
    expected: '0.000000',
    actual: maxD.toFixed(8),
    delta: maxD,
    epsilon,
  };
}

// ─── Run all validations ──────────────────────────────────────────────────────

export function runAllValidations(
  geometry: MerkabaGeometry,
  epsilon = DEFAULT_EPSILON,
): ValidationSummary {
  const { tetrahedra, outerCube, innerOctahedron, scale, metrics } = geometry;
  const [tA, tB] = tetrahedra;
  const summary = computeGeometrySummary(geometry);

  const checks: ValidationCheck[] = [
    validateEqualEdgeLengths(tA.vertices, 'A', epsilon, scale),
    validateEqualEdgeLengths(tB.vertices, 'B', epsilon, scale),
    validateSharedCenter(tA.vertices, tB.vertices, epsilon, scale),
    validateOriginCenter(tA.vertices, tB.vertices, epsilon, scale),
    validateCubeCorrespondence(tA.vertices, tB.vertices, outerCube.vertices, epsilon, scale),
    validateInnerOctahedronVertices(innerOctahedron.vertices, scale, epsilon),
    validateDihedralAngle(tA.vertices, 'A', metrics.tetrahedronDihedralRad, epsilon),
    validateDihedralAngle(tB.vertices, 'B', metrics.tetrahedronDihedralRad, epsilon),
    validateScaleInvariance(geometry, scale * 2, epsilon),
    validateGeometrySelfConsistency(geometry, summary.tetraAVertices, summary.tetraBVertices, epsilon, scale),
  ];

  const ok = checks.every(c => c.ok);

  return {
    ok,
    epsilon,
    confidenceLabel: ok ? 'Analytic + validated' : 'Validation failed',
    checks,
  };
}
