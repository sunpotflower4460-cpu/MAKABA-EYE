import { create } from 'zustand';
import type { ThemeId, LayerState, MerkabaGeometry, ValidationSummary } from '../geometry/types';
import { buildCanonicalMerkaba } from '../geometry/merkaba';
import { runAllValidations } from '../geometry/validation';

const DEFAULT_EPSILON = 1e-6;

export type CameraMetrics = {
  distance: number;
  azimuthal: number;
  polar: number;
};

type MerkabaState = {
  // Geometry (single source of truth)
  scale: number;
  geometry: MerkabaGeometry;
  validation: ValidationSummary;
  epsilon: number;

  // View
  autoSpin: boolean;
  theme: ThemeId;
  layers: LayerState;
  cameraMetrics: CameraMetrics;
  panelOpen: boolean;

  // Actions
  setScale: (scale: number) => void;
  setAutoSpin: (on: boolean) => void;
  setTheme: (theme: ThemeId) => void;
  toggleLayer: (key: keyof LayerState) => void;
  setLayerState: (layers: Partial<LayerState>) => void;
  setCameraMetrics: (m: CameraMetrics) => void;
  setPanelOpen: (open: boolean) => void;
};

const DEFAULT_LAYERS: LayerState = {
  wireframeMerkaba: true,
  solidTransparentFaces: true,
  twoTetrahedraColoredSeparately: true,
  centerPoint: true,
  innerOctahedron: false,
  outerCubeGuide: false,
  vertexLabels: false,
  edgeLabels: false,
  axisXYZ: false,
  symmetryLines: false,
  numericValidationOverlay: false,
};

function makeGeometry(scale: number, epsilon: number) {
  const geo = buildCanonicalMerkaba(scale);
  const validation = runAllValidations(geo, epsilon);
  return { geometry: geo, validation };
}

export const useMerkabaStore = create<MerkabaState>((set) => {
  const initialScale = 1;
  const { geometry, validation } = makeGeometry(initialScale, DEFAULT_EPSILON);

  return {
    scale: initialScale,
    geometry,
    validation,
    epsilon: DEFAULT_EPSILON,
    autoSpin: true,
    theme: 'cosmic',
    layers: DEFAULT_LAYERS,
    cameraMetrics: { distance: 6, azimuthal: 0, polar: Math.PI / 4 },
    panelOpen: true,

    setScale: (scale) => {
      const eps = DEFAULT_EPSILON;
      const { geometry, validation } = makeGeometry(scale, eps);
      set({ scale, geometry, validation });
    },

    setAutoSpin: (autoSpin) => set({ autoSpin }),

    setTheme: (theme) => {
      // Research Grid auto-enables validation overlay and axes
      if (theme === 'research-grid') {
        set({
          theme,
          layers: {
            ...DEFAULT_LAYERS,
            axisXYZ: true,
            outerCubeGuide: true,
            numericValidationOverlay: true,
          },
        });
      } else {
        set({ theme });
      }
    },

    toggleLayer: (key) =>
      set((state) => ({
        layers: { ...state.layers, [key]: !state.layers[key] },
      })),

    setLayerState: (partial) =>
      set((state) => ({
        layers: { ...state.layers, ...partial },
      })),

    setCameraMetrics: (cameraMetrics) => set({ cameraMetrics }),

    setPanelOpen: (panelOpen) => set({ panelOpen }),
  };
});
