import type { ThemeId } from '../geometry/types';

export type ThemeConfig = {
  id: ThemeId;
  label: string;
  background: string;           // CSS hex
  fogColor: string;             // hex
  fogNear: number;
  fogFar: number;
  ambientIntensity: number;
  pointLightIntensity: number;
  gridHelper: boolean;
  axesHelper: boolean;
  starField: boolean;
  tetraAColor: string;
  tetraBColor: string;
  octaColor: string;
  cubeColor: string;
  wireframeOpacity: number;
  faceOpacity: number;
  useMeshBasicMaterial: boolean;
};

const THEMES: Record<ThemeId, ThemeConfig> = {
  cosmic: {
    id: 'cosmic',
    label: 'Cosmic Mode',
    background: '#030712',
    fogColor: '#030712',
    fogNear: 15,
    fogFar: 40,
    ambientIntensity: 0.4,
    pointLightIntensity: 1.2,
    gridHelper: false,
    axesHelper: false,
    starField: true,
    tetraAColor: '#6699ff',
    tetraBColor: '#ff6688',
    octaColor: '#aaffaa',
    cubeColor: '#ffdd88',
    wireframeOpacity: 0.9,
    faceOpacity: 0.18,
    useMeshBasicMaterial: false,
  },
  'light-field': {
    id: 'light-field',
    label: 'Light Field Mode',
    background: '#f0f4ff',
    fogColor: '#f0f4ff',
    fogNear: 20,
    fogFar: 50,
    ambientIntensity: 0.8,
    pointLightIntensity: 0.8,
    gridHelper: false,
    axesHelper: false,
    starField: false,
    tetraAColor: '#2255cc',
    tetraBColor: '#cc2244',
    octaColor: '#228833',
    cubeColor: '#885500',
    wireframeOpacity: 0.95,
    faceOpacity: 0.12,
    useMeshBasicMaterial: false,
  },
  'research-grid': {
    id: 'research-grid',
    label: 'Research Grid Mode',
    background: '#0a0f1a',
    fogColor: '#0a0f1a',
    fogNear: 30,
    fogFar: 80,
    ambientIntensity: 1.0,
    pointLightIntensity: 0.0,
    gridHelper: true,
    axesHelper: true,
    starField: false,
    tetraAColor: '#44aaff',
    tetraBColor: '#ff4488',
    octaColor: '#44ff88',
    cubeColor: '#ffaa44',
    wireframeOpacity: 1.0,
    faceOpacity: 0.10,
    useMeshBasicMaterial: true,
  },
};

export function getTheme(id: ThemeId): ThemeConfig {
  return THEMES[id];
}

export function getAllThemes(): ThemeConfig[] {
  return Object.values(THEMES);
}
