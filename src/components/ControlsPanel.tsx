import { useMerkabaStore } from '../state/useMerkabaState';

export function ControlsPanel() {
  const {
    autoSpin, setAutoSpin,
    scale, setScale,
  } = useMerkabaStore(s => ({
    autoSpin: s.autoSpin,
    setAutoSpin: s.setAutoSpin,
    scale: s.scale,
    setScale: s.setScale,
  }));

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Viewer Controls</div>

      {/* Auto spin */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-300">Auto Spin</span>
        <button
          onClick={() => setAutoSpin(!autoSpin)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            autoSpin ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          {autoSpin ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Scale slider */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-xs text-gray-300">Scale</span>
          <span className="text-xs text-blue-400 font-mono">{scale.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.05}
          value={scale}
          onChange={e => setScale(parseFloat(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>0.5</span>
          <span>3.0</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-0.5 pt-1 border-t border-gray-700">
        <div>🖱 Drag to rotate</div>
        <div>🖱 Scroll to zoom</div>
        <div>🖱 Right-drag to pan</div>
        <div>📱 Touch: drag / pinch</div>
      </div>
    </div>
  );
}
