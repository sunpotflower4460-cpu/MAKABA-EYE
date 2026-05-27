import { useMerkabaStore } from '../state/useMerkabaState';

export function ValidationOverlay() {
  const validation = useMerkabaStore(s => s.validation);
  const layers = useMerkabaStore(s => s.layers);

  if (!layers.numericValidationOverlay) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur border border-gray-700 rounded p-3 text-xs font-mono max-w-sm z-10">
      <div className={`font-bold mb-2 ${validation.ok ? 'text-green-400' : 'text-red-400'}`}>
        {validation.ok ? '✓ PASS' : '✗ FAIL'} — {validation.confidenceLabel}
      </div>
      <div className="text-gray-400 mb-2">ε = {validation.epsilon.toExponential(0)}</div>
      <div className="space-y-1">
        {validation.checks.map(c => (
          <div key={c.id} className="flex items-start gap-2">
            <span className={`${c.ok ? 'text-green-400' : 'text-red-400'} flex-shrink-0`}>
              {c.ok ? 'PASS' : 'FAIL'}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-gray-300 truncate">{c.id}</div>
              {!c.ok && (
                <div className="text-gray-500">
                  exp: {c.expected} | act: {c.actual}
                  {c.delta !== undefined && ` | Δ: ${c.delta.toExponential(3)}`}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
