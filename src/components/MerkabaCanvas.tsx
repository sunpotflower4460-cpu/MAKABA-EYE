import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, GizmoHelper, GizmoViewport } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useMerkabaStore } from '../state/useMerkabaState';
import { getTheme } from '../render/sceneThemes';
import {
  buildEdgeGeometry,
  buildFaceGeometry,
  buildCubeSpaceDiagonals,
  buildStarField,
} from '../render/lineBuilders';
import type { Vec3 } from '../geometry/types';

// ─── CameraTracker ────────────────────────────────────────────────────────────

function CameraTracker() {
  const setCameraMetrics = useMerkabaStore(s => s.setCameraMetrics);
  const { camera } = useThree();
  const lastUpdateRef = useRef(Number.NEGATIVE_INFINITY);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (elapsed - lastUpdateRef.current < 0.15) return;
    lastUpdateRef.current = elapsed;

    const dist = camera.position.length();
    if (dist <= 1e-8) {
      setCameraMetrics({ distance: 0, azimuthal: 0, polar: 0 });
      return;
    }

    // Spherical coords
    const phi = Math.acos(Math.max(-1, Math.min(1, camera.position.y / dist)));
    const theta = Math.atan2(camera.position.z, camera.position.x);
    setCameraMetrics({ distance: dist, azimuthal: theta, polar: phi });
  });

  return null;
}

// ─── Tetrahedron mesh ─────────────────────────────────────────────────────────

type TetraMeshProps = {
  vertices: Vec3[];
  faces: readonly (readonly [number, number, number])[];
  edges: readonly (readonly [number, number])[];
  color: string;
  wireframeOpacity: number;
  faceOpacity: number;
  showWireframe: boolean;
  showFaces: boolean;
  useMeshBasicMaterial: boolean;
};

function TetraMesh({
  vertices, faces, edges, color,
  wireframeOpacity, faceOpacity,
  showWireframe, showFaces, useMeshBasicMaterial,
}: TetraMeshProps) {
  const faceGeo = useMemo(() => buildFaceGeometry(vertices, faces), [vertices, faces]);
  const edgeGeo = useMemo(() => buildEdgeGeometry(vertices, edges), [vertices, edges]);

  return (
    <group>
      {showFaces && (
        <mesh geometry={faceGeo} renderOrder={1}>
          {useMeshBasicMaterial ? (
            <meshBasicMaterial
              color={color}
              transparent
              opacity={faceOpacity}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          ) : (
            <meshPhongMaterial
              color={color}
              transparent
              opacity={faceOpacity}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          )}
        </mesh>
      )}
      {showWireframe && (
        <lineSegments geometry={edgeGeo} renderOrder={2}>
          <lineBasicMaterial color={color} transparent opacity={wireframeOpacity} />
        </lineSegments>
      )}
    </group>
  );
}

// ─── Vertex labels ────────────────────────────────────────────────────────────

function VertexLabels({ vertices, prefix, color }: { vertices: Vec3[]; prefix: string; color: string }) {
  return (
    <>
      {vertices.map((v, i) => (
        <Html
          key={`${prefix}-${i}`}
          position={[v[0] * 1.08, v[1] * 1.08, v[2] * 1.08]}
          style={{ pointerEvents: 'none' }}
        >
          <span style={{ color, fontSize: '10px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.5)', padding: '1px 3px', borderRadius: 2 }}>
            {prefix}{i}
          </span>
        </Html>
      ))}
    </>
  );
}

// ─── Edge labels ─────────────────────────────────────────────────────────────

function EdgeLabels({ vertices, edges, color }: { vertices: Vec3[]; edges: readonly (readonly [number, number])[]; color: string }) {
  return (
    <>
      {edges.map(([a, b], i) => {
        const va = vertices[a];
        const vb = vertices[b];
        const mx = (va[0] + vb[0]) / 2;
        const my = (va[1] + vb[1]) / 2;
        const mz = (va[2] + vb[2]) / 2;
        const dx = vb[0] - va[0], dy = vb[1] - va[1], dz = vb[2] - va[2];
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        return (
          <Html key={i} position={[mx, my, mz]} style={{ pointerEvents: 'none' }}>
            <span style={{ color, fontSize: '9px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '1px 2px', borderRadius: 2 }}>
              {len.toFixed(3)}
            </span>
          </Html>
        );
      })}
    </>
  );
}

// ─── Octahedron helper ────────────────────────────────────────────────────────

function OctahedronMesh({ vertices, faces, edges, color, faceOpacity, wireframeOpacity, useMeshBasicMaterial }: {
  vertices: Vec3[];
  faces: readonly (readonly [number, number, number])[];
  edges: readonly (readonly [number, number])[];
  color: string;
  faceOpacity: number;
  wireframeOpacity: number;
  useMeshBasicMaterial: boolean;
}) {
  const faceGeo = useMemo(() => buildFaceGeometry(vertices, faces), [vertices, faces]);
  const edgeGeo = useMemo(() => buildEdgeGeometry(vertices, edges), [vertices, edges]);

  return (
    <group>
      <lineSegments geometry={edgeGeo} renderOrder={3}>
        <lineBasicMaterial color={color} transparent opacity={wireframeOpacity} />
      </lineSegments>
      <mesh geometry={faceGeo} renderOrder={0}>
        {useMeshBasicMaterial ? (
          <meshBasicMaterial color={color} transparent opacity={faceOpacity} side={THREE.DoubleSide} depthWrite={false} />
        ) : (
          <meshPhongMaterial color={color} transparent opacity={faceOpacity} side={THREE.DoubleSide} depthWrite={false} />
        )}
      </mesh>
    </group>
  );
}

// ─── Cube guide ───────────────────────────────────────────────────────────────

function CubeGuide({ vertices, edges, color, wireframeOpacity }: {
  vertices: Vec3[];
  edges: readonly (readonly [number, number])[];
  color: string;
  wireframeOpacity: number;
}) {
  const edgeGeo = useMemo(() => buildEdgeGeometry(vertices, edges), [vertices, edges]);
  return (
    <lineSegments geometry={edgeGeo} renderOrder={4}>
      <lineBasicMaterial color={color} transparent opacity={wireframeOpacity * 0.7} />
    </lineSegments>
  );
}

// ─── Symmetry lines (space diagonals) ────────────────────────────────────────

function SymmetryLines({ scale, color }: { scale: number; color: string }) {
  const geo = useMemo(() => buildCubeSpaceDiagonals(scale), [scale]);
  return (
    <lineSegments geometry={geo} renderOrder={5}>
      <lineBasicMaterial color={color} transparent opacity={0.45} />
    </lineSegments>
  );
}

// ─── Star field ───────────────────────────────────────────────────────────────

function StarField() {
  const geo = useMemo(() => buildStarField(1200, 35), []);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.06} color="#ffffff" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

// ─── Auto-spin wrapper ────────────────────────────────────────────────────────

type AutoSpinProps = { controlsRef: RefObject<OrbitControlsImpl>; enabled: boolean };

function AutoSpinUpdater({ controlsRef, enabled }: AutoSpinProps) {
  useFrame(() => {
    if (enabled && controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 0.8;
      controlsRef.current.update();
    } else if (!enabled && controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  });
  return null;
}

// ─── Main scene ───────────────────────────────────────────────────────────────

function MerkabaScene() {
  const { geometry, layers, theme, autoSpin, scale } = useMerkabaStore(s => ({
    geometry: s.geometry,
    layers: s.layers,
    theme: s.theme,
    autoSpin: s.autoSpin,
    scale: s.scale,
  }));

  const themeConfig = getTheme(theme);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [tA, tB] = geometry.tetrahedra;

  const colorA = themeConfig.tetraAColor;
  const colorB = themeConfig.tetraBColor;
  const colorOcta = themeConfig.octaColor;
  const colorCube = themeConfig.cubeColor;

  const showWireframe = layers.wireframeMerkaba;
  const showFacesA = layers.solidTransparentFaces;
  const showFacesB = layers.solidTransparentFaces;

  return (
    <>
      {/* Lighting */}
      {!themeConfig.useMeshBasicMaterial && (
        <>
          <ambientLight intensity={themeConfig.ambientIntensity} />
          <pointLight position={[8, 8, 8]} intensity={themeConfig.pointLightIntensity} color="#ffffff" />
          <pointLight position={[-8, -4, -8]} intensity={themeConfig.pointLightIntensity * 0.5} color="#8888ff" />
        </>
      )}
      {themeConfig.useMeshBasicMaterial && (
        <ambientLight intensity={1.0} />
      )}

      {/* Fog */}
      <fog attach="fog" args={[themeConfig.fogColor, themeConfig.fogNear, themeConfig.fogFar]} />

      {/* Star field */}
      {themeConfig.starField && <StarField />}

      {/* Grid + axes */}
      {themeConfig.gridHelper && (
        <gridHelper args={[20, 20, '#334455', '#223344']} position={[0, -scale * 1.8, 0]} />
      )}
      {(themeConfig.axesHelper || layers.axisXYZ) && (
        <axesHelper args={[scale * 2.2]} />
      )}

      {/* Tetrahedron A */}
      <TetraMesh
        vertices={tA.vertices}
        faces={tA.faces}
        edges={tA.edges}
        color={colorA}
        wireframeOpacity={themeConfig.wireframeOpacity}
        faceOpacity={themeConfig.faceOpacity}
        showWireframe={showWireframe}
        showFaces={showFacesA}
        useMeshBasicMaterial={themeConfig.useMeshBasicMaterial}
      />

      {/* Tetrahedron B */}
      <TetraMesh
        vertices={tB.vertices}
        faces={tB.faces}
        edges={tB.edges}
        color={layers.twoTetrahedraColoredSeparately ? colorB : colorA}
        wireframeOpacity={themeConfig.wireframeOpacity}
        faceOpacity={themeConfig.faceOpacity}
        showWireframe={showWireframe}
        showFaces={showFacesB}
        useMeshBasicMaterial={themeConfig.useMeshBasicMaterial}
      />

      {/* Center point */}
      {layers.centerPoint && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.04 * scale, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}

      {/* Inner octahedron */}
      {layers.innerOctahedron && (
        <OctahedronMesh
          vertices={geometry.innerOctahedron.vertices}
          faces={geometry.innerOctahedron.faces}
          edges={geometry.innerOctahedron.edges}
          color={colorOcta}
          faceOpacity={0.12}
          wireframeOpacity={0.8}
          useMeshBasicMaterial={themeConfig.useMeshBasicMaterial}
        />
      )}

      {/* Outer cube guide */}
      {layers.outerCubeGuide && (
        <CubeGuide
          vertices={geometry.outerCube.vertices}
          edges={geometry.outerCube.edges}
          color={colorCube}
          wireframeOpacity={themeConfig.wireframeOpacity}
        />
      )}

      {/* Symmetry lines */}
      {layers.symmetryLines && (
        <SymmetryLines scale={scale} color="#aaaaaa" />
      )}

      {/* Vertex labels */}
      {layers.vertexLabels && (
        <>
          <VertexLabels vertices={tA.vertices} prefix="A" color={colorA} />
          <VertexLabels vertices={tB.vertices} prefix="B" color={colorB} />
        </>
      )}

      {/* Edge labels */}
      {layers.edgeLabels && (
        <>
          <EdgeLabels vertices={tA.vertices} edges={tA.edges} color={colorA} />
          <EdgeLabels vertices={tB.vertices} edges={tB.edges} color={colorB} />
        </>
      )}

      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoSpin}
        autoRotateSpeed={0.8}
      />
      <AutoSpinUpdater controlsRef={controlsRef} enabled={autoSpin} />
      <CameraTracker />

      {/* Gizmo helper (corner orientation indicator) */}
      <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
        <GizmoViewport axisColors={['#ff4444', '#44ff44', '#4488ff']} labelColor="white" />
      </GizmoHelper>
    </>
  );
}

// ─── Canvas wrapper ───────────────────────────────────────────────────────────

export function MerkabaCanvas() {
  const theme = useMerkabaStore(s => s.theme);
  const themeConfig = getTheme(theme);

  return (
    <Canvas
      frameloop="always"
      dpr={[1, 2]}
      camera={{ position: [4, 3, 4], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: themeConfig.background }}
    >
      <MerkabaScene />
    </Canvas>
  );
}
