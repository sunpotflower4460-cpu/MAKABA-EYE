import { describe, expect, test } from 'vitest';
import { buildCanonicalMerkaba, centroid, dist, tetraDihedralAngle } from '../merkaba';

const TETRA_EDGES = [
  [0, 1], [0, 2], [0, 3],
  [1, 2], [1, 3], [2, 3],
] as const;

describe('canonical merkaba geometry', () => {
  const geometry = buildCanonicalMerkaba(1);
  const [tetraA, tetraB] = geometry.tetrahedra;

  test('tetra A and B dihedral angle matches acos(1/3)', () => {
    const expected = Math.acos(1 / 3);

    expect(tetraDihedralAngle(tetraA.vertices)).toBeCloseTo(expected, 8);
    expect(tetraDihedralAngle(tetraB.vertices)).toBeCloseTo(expected, 8);
  });

  test('all tetrahedron edges equal 2√2', () => {
    const expected = 2 * Math.SQRT2;

    for (const [a, b] of TETRA_EDGES) {
      expect(dist(tetraA.vertices[a], tetraA.vertices[b])).toBeCloseTo(expected, 10);
      expect(dist(tetraB.vertices[a], tetraB.vertices[b])).toBeCloseTo(expected, 10);
    }
  });

  test('cube and inner octahedron edge metrics match the canonical scale', () => {
    expect(geometry.metrics.cubeEdgeLength).toBeCloseTo(2, 10);
    expect(geometry.metrics.innerOctahedronEdgeLength).toBeCloseTo(Math.SQRT2, 10);
    expect(dist(geometry.outerCube.vertices[0], geometry.outerCube.vertices[1])).toBeCloseTo(2, 10);
    expect(dist(geometry.innerOctahedron.vertices[0], geometry.innerOctahedron.vertices[2])).toBeCloseTo(Math.SQRT2, 10);
  });

  test('tetrahedra share the origin centroid and fill the cube corners', () => {
    expect(centroid(tetraA.vertices)).toEqual([0, 0, 0]);
    expect(centroid(tetraB.vertices)).toEqual([0, 0, 0]);

    const asKey = ([x, y, z]: readonly [number, number, number]) => `${x},${y},${z}`;
    const tetraVertexSet = new Set([...tetraA.vertices, ...tetraB.vertices].map(asKey));
    const cubeVertexSet = new Set(geometry.outerCube.vertices.map(asKey));

    expect(tetraVertexSet).toEqual(cubeVertexSet);
  });
});
