# Geometry Specification — Stella Octangula / Merkaba

## Overview

This document describes the analytic geometry used in MAKABA-EYE. All coordinates
are generated from `src/geometry/merkaba.ts` and serve as the single source of truth
for both the 3D renderer and the numeric panel.

---

## Coordinate System

- **Origin:** geometric centre at `(0, 0, 0)`
- **Scale parameter:** `s` (default `s = 1`)
- All coordinates scale linearly with `s`

---

## Outer Cube

The bounding convex hull is a cube with edge length `2s`.

Vertices (all 8 combinations of `±s`):

```
(-s, -s, -s)  (-s, -s, +s)  (-s, +s, -s)  (-s, +s, +s)
(+s, -s, -s)  (+s, -s, +s)  (+s, +s, -s)  (+s, +s, +s)
```

---

## Tetrahedron A

Vertices selected from cube corners where **sign product = +1** (even number of negatives):

```
(+s, +s, +s)   sign product = (+)(+)(+) = +1
(+s, -s, -s)   sign product = (+)(-)(-)  = +1
(-s, +s, -s)   sign product = (-)(+)(-) = +1
(-s, -s, +s)   sign product = (-)(-)(+) = +1
```

Half-space representation:
```
 x + y - z ≤ s
 x - y + z ≤ s
-x + y + z ≤ s
-x - y - z ≤ s
```

---

## Tetrahedron B

Vertices selected from cube corners where **sign product = −1** (odd number of negatives):

```
(-s, -s, -s)   sign product = (-)(-)(-)  = -1
(-s, +s, +s)   sign product = (-)(+)(+) = -1
(+s, -s, +s)   sign product = (+)(-)(+) = -1
(+s, +s, -s)   sign product = (+)(+)(-) = -1
```

Half-space representation:
```
 x + y + z ≤ s
 x - y - z ≤ s
-x + y - z ≤ s
-x - y + z ≤ s
```

---

## Inner Octahedron (Intersection)

The intersection of Tetrahedron A and Tetrahedron B is a regular octahedron.
Its vertices lie at the face centres of the cube:

```
(+s, 0, 0)  (-s, 0, 0)
(0, +s, 0)  (0, -s, 0)
(0, 0, +s)  (0, 0, -s)
```

Equivalent half-space: `|x| + |y| + |z| ≤ s`

---

## Expected Metric Values (at scale s)

| Quantity | Formula | Value at s=1 |
|---|---|---|
| Cube edge length | `2s` | 2.000000 |
| Tetrahedron edge length | `2√2 · s` | 2.828427 |
| Inner octahedron edge | `√2 · s` | 1.414214 |
| Tetra dihedral angle | `acos(1/3)` | 70.528779° / 1.231096 rad |

---

## Symmetry Lines

The 4 space diagonals of the outer cube are displayed as `Symmetry / relation lines`.
These correspond to the 4 `C₃` rotation axes of the cube (axes through opposite vertices).

---

## Validation Checks

All checks use `ε = 1e-6` (position comparisons scale with `max(1, |s|)`).

| Check ID | What is verified |
|---|---|
| `equal-edge-lengths-A` | All 6 edges of Tetra A are equal |
| `equal-edge-lengths-B` | All 6 edges of Tetra B are equal |
| `shared-center` | Both tetrahedra centroid at origin |
| `origin-center` | Combined centroid of all 8 vertices at origin |
| `cube-correspondence` | All 8 tetra vertices match cube corners |
| `inner-octahedron` | Octahedron vertices at `(±s, 0, 0)`, etc. |
| `dihedral-angle` | Tetra dihedral = `acos(1/3)` |
| `scale-invariance` | Metrics scale correctly with `s` |
| `panel-sync` | Panel data derived from same geometry object |

---

## References

- MathWorld, [Regular Tetrahedron](https://mathworld.wolfram.com/RegularTetrahedron.html)
- MathWorld, [Stella Octangula](https://mathworld.wolfram.com/StellaOctangula.html)
- MathWorld, [Regular Octahedron](https://mathworld.wolfram.com/RegularOctahedron.html)
- Britannica, [Merkabah](https://www.britannica.com/topic/Merkabah)
