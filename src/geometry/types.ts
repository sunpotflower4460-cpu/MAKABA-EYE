// ─── Primitive types ──────────────────────────────────────────────────────────
export type Vec3 = readonly [number, number, number];
export type Edge = readonly [number, number];
export type Face = readonly [number, number, number];

// ─── Polyhedra ────────────────────────────────────────────────────────────────
export type Polyhedron = {
  vertices: Vec3[];
  edges: Edge[];
  faces: Face[];
};

export type Tetrahedron = Polyhedron & {
  id: 'A' | 'B';
};

// ─── Metrics ─────────────────────────────────────────────────────────────────
export type MerkabaMetrics = {
  cubeEdgeLength: number;
  tetraEdgeLength: number;
  innerOctahedronEdgeLength: number;
  tetrahedronDihedralRad: number;
  tetrahedronDihedralDeg: number;
};

// ─── Main geometry object ─────────────────────────────────────────────────────
export type MerkabaGeometry = {
  center: Vec3;
  scale: number;
  tetrahedra: [Tetrahedron, Tetrahedron];
  outerCube: Polyhedron;
  innerOctahedron: Polyhedron;
  metrics: MerkabaMetrics;
};

// ─── Validation ───────────────────────────────────────────────────────────────
export type ValidationCheckId =
  | 'equal-edge-lengths-A'
  | 'equal-edge-lengths-B'
  | 'shared-center'
  | 'cube-correspondence'
  | 'origin-center'
  | 'inner-octahedron'
  | 'dihedral-angle-A'
  | 'dihedral-angle-B'
  | 'scale-invariance'
  | 'panel-sync';

export type ValidationCheck = {
  id: ValidationCheckId;
  ok: boolean;
  expected: string;
  actual: string;
  delta?: number;
  epsilon: number;
};

export type ValidationSummary = {
  ok: boolean;
  epsilon: number;
  confidenceLabel: 'Analytic + validated' | 'Validation failed';
  checks: ValidationCheck[];
};

// ─── Theme ────────────────────────────────────────────────────────────────────
export type ThemeId = 'cosmic' | 'light-field' | 'research-grid';

// ─── Layer state ──────────────────────────────────────────────────────────────
export type LayerState = {
  wireframeMerkaba: boolean;
  solidTransparentFaces: boolean;
  twoTetrahedraColoredSeparately: boolean;
  centerPoint: boolean;
  innerOctahedron: boolean;
  outerCubeGuide: boolean;
  vertexLabels: boolean;
  edgeLabels: boolean;
  axisXYZ: boolean;
  symmetryLines: boolean;
  numericValidationOverlay: boolean;
};
