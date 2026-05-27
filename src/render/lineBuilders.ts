import * as THREE from 'three';
import type { Vec3 } from '../geometry/types';

/**
 * Build a BufferGeometry of line segments from an array of vertex pairs.
 * Each element in `pairs` is [indexA, indexB] into `vertices`.
 */
export function buildEdgeGeometry(
  vertices: Vec3[],
  edges: readonly (readonly [number, number])[],
): THREE.BufferGeometry {
  const positions: number[] = [];
  for (const [a, b] of edges) {
    const va = vertices[a];
    const vb = vertices[b];
    positions.push(va[0], va[1], va[2], vb[0], vb[1], vb[2]);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}

/**
 * Build a BufferGeometry for triangular faces.
 */
export function buildFaceGeometry(
  vertices: Vec3[],
  faces: readonly (readonly [number, number, number])[],
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  for (const [a, b, c] of faces) {
    const va = vertices[a];
    const vb = vertices[b];
    const vc = vertices[c];
    positions.push(va[0], va[1], va[2]);
    positions.push(vb[0], vb[1], vb[2]);
    positions.push(vc[0], vc[1], vc[2]);
    // Face normal
    const abx = vb[0] - va[0], aby = vb[1] - va[1], abz = vb[2] - va[2];
    const acx = vc[0] - va[0], acy = vc[1] - va[1], acz = vc[2] - va[2];
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    for (let i = 0; i < 3; i++) {
      normals.push(nx / len, ny / len, nz / len);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return geo;
}

/**
 * Build line segments for the 4 space diagonals of the outer cube.
 * These are the C3 symmetry axes. Cube vertices at ±s on each axis combination.
 */
export function buildCubeSpaceDiagonals(s: number): THREE.BufferGeometry {
  const diagonals: [Vec3, Vec3][] = [
    [[-s, -s, -s], [ s,  s,  s]],
    [[ s, -s, -s], [-s,  s,  s]],
    [[-s,  s, -s], [ s, -s,  s]],
    [[ s,  s, -s], [-s, -s,  s]],
  ];
  const positions: number[] = [];
  for (const [a, b] of diagonals) {
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}

/**
 * Build a simple star-field Points geometry.
 */
export function buildStarField(count = 1000, radius = 30): THREE.BufferGeometry {
  const positions: number[] = [];
  for (let i = 0; i < count; i++) {
    // Random point on sphere surface
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.5 + Math.random() * 0.5);
    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}
