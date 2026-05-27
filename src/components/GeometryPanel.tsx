import { useMerkabaStore } from '../state/useMerkabaState';
import { computeGeometrySummary, fmt, fmtVec3 } from '../geometry/metrics';

export function GeometryPanel() {
  const { geometry, cameraMetrics, validation } = useMerkabaStore(s => ({
    geometry: s.geometry,
    cameraMetrics: s.cameraMetrics,
    validation: s.validation,
  }));

  // All data comes from single geometry object
  const summary = computeGeometrySummary(geometry);
  const { metrics } = summary;

  return (
    <div className="space-y-4 text-xs font-mono">
      {/* Center & Scale */}
      <Section title="Origin">
        <Row label="center" value={fmtVec3(summary.center)} />
        <Row label="scale" value={fmt(summary.scale)} />
      </Section>

      {/* Tetra A vertices */}
      <Section title="Tetrahedron A">
        {summary.tetraAVertices.map((v, i) => (
          <Row key={i} label={`v${i}`} value={fmtVec3(v)} />
        ))}
      </Section>

      {/* Tetra B vertices */}
      <Section title="Tetrahedron B">
        {summary.tetraBVertices.map((v, i) => (
          <Row key={i} label={`v${i}`} value={fmtVec3(v)} />
        ))}
      </Section>

      {/* Metrics */}
      <Section title="Metrics">
        <Row label="cube edge" value={fmt(metrics.cubeEdgeLength)} />
        <Row label="tetra edge" value={fmt(metrics.tetraEdgeLength)} />
        <Row label="octa edge" value={fmt(metrics.innerOctahedronEdgeLength)} />
        <Row label="dihedral (rad)" value={fmt(metrics.tetrahedronDihedralRad)} />
        <Row label="dihedral (deg)" value={fmt(metrics.tetrahedronDihedralDeg)} />
      </Section>

      {/* Camera */}
      <Section title="Camera">
        <Row label="distance" value={fmt(cameraMetrics.distance)} />
        <Row label="azimuthal" value={`${fmt(cameraMetrics.azimuthal)} rad / ${fmt((cameraMetrics.azimuthal * 180) / Math.PI, 2)}°`} />
        <Row label="polar" value={`${fmt(cameraMetrics.polar)} rad / ${fmt((cameraMetrics.polar * 180) / Math.PI, 2)}°`} />
      </Section>

      {/* Validation summary */}
      <Section title="Validation">
        <div className={`px-2 py-1 rounded text-center font-semibold ${
          validation.ok ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
        }`}>
          {validation.ok ? '✓ PASS' : '✗ FAIL'} — {validation.confidenceLabel}
        </div>
        <Row label="epsilon" value={validation.epsilon.toExponential(0)} />
        {validation.checks.map(c => (
          <div key={c.id} className="flex items-start gap-1 py-0.5">
            <span className={c.ok ? 'text-green-400' : 'text-red-400'}>{c.ok ? '✓' : '✗'}</span>
            <span className="text-gray-400 flex-1 truncate">{c.id}</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1 border-b border-gray-700 pb-1">
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1 text-xs leading-4">
      <span className="text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className="text-gray-200 break-all">{value}</span>
    </div>
  );
}
