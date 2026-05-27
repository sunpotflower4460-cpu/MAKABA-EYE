import { useMerkabaStore } from '../state/useMerkabaState';
import type { LayerState } from '../geometry/types';

const LAYER_LABELS: Record<keyof LayerState, string> = {
  wireframeMerkaba: 'Wireframe Merkaba',
  solidTransparentFaces: 'Solid transparent faces',
  twoTetrahedraColoredSeparately: 'Two tetrahedra colored',
  centerPoint: 'Center point',
  innerOctahedron: 'Inner octahedron',
  outerCubeGuide: 'Outer cube guide',
  vertexLabels: 'Vertex labels',
  edgeLabels: 'Edge labels (lengths)',
  axisXYZ: 'Axis XYZ',
  symmetryLines: 'Symmetry lines (C3)',
  numericValidationOverlay: 'Validation overlay',
};

export function LayerControls() {
  const { layers, toggleLayer } = useMerkabaStore(s => ({ layers: s.layers, toggleLayer: s.toggleLayer }));

  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Display Layers</div>
      {(Object.keys(LAYER_LABELS) as (keyof LayerState)[]).map(key => (
        <label key={key} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={() => toggleLayer(key)}
            className="rounded"
          />
          <span className={`text-xs transition-colors ${layers[key] ? 'text-gray-200' : 'text-gray-500'}`}>
            {LAYER_LABELS[key]}
          </span>
        </label>
      ))}
    </div>
  );
}
