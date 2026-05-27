import { useState } from 'react';
import { MerkabaCanvas } from '../components/MerkabaCanvas';
import { GeometryPanel } from '../components/GeometryPanel';
import { ControlsPanel } from '../components/ControlsPanel';
import { LayerControls } from '../components/LayerControls';
import { ThemeControls } from '../components/ThemeControls';
import { ValidationOverlay } from '../components/ValidationOverlay';
import { useMerkabaStore } from '../state/useMerkabaState';

type PanelTab = 'controls' | 'layers' | 'geometry' | 'theme';

export function App() {
  const [activeTab, setActiveTab] = useState<PanelTab>('controls');
  const { panelOpen, setPanelOpen } = useMerkabaStore(s => ({
    panelOpen: s.panelOpen,
    setPanelOpen: s.setPanelOpen,
  }));

  const tabs: { id: PanelTab; label: string }[] = [
    { id: 'controls', label: 'Controls' },
    { id: 'layers', label: 'Layers' },
    { id: 'geometry', label: 'Geometry' },
    { id: 'theme', label: 'Theme' },
  ];

  return (
    <div className="h-[100dvh] w-full bg-gray-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between gap-3 px-3 sm:px-4 py-2 bg-gray-900/90 border-b border-gray-800 z-40">
        <div className="min-w-0 flex items-center gap-3">
          <div className="text-blue-400 font-bold tracking-widest text-sm truncate">MAKABA-EYE</div>
          <div className="hidden sm:block text-gray-500 text-xs truncate">Stella Octangula Observatory</div>
        </div>
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="flex-shrink-0 whitespace-nowrap text-xs text-gray-400 hover:text-gray-200 border border-gray-700 rounded px-2 py-1 transition-colors"
        >
          {panelOpen ? 'Hide Panel' : 'Show Panel'}
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* 3D Canvas (fills remaining space) */}
        <div className="min-w-0 flex-1 relative">
          <MerkabaCanvas />
          <ValidationOverlay />
        </div>

        {/* Panel: overlay on mobile, right sidebar on larger screens */}
        {panelOpen && (
          <div className="absolute inset-x-3 top-3 bottom-3 z-30 flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900/95 shadow-2xl backdrop-blur sm:relative sm:inset-auto sm:z-auto sm:w-72 sm:flex-shrink-0 sm:rounded-none sm:border-y-0 sm:border-r-0 sm:border-l sm:bg-gray-900 sm:shadow-none sm:backdrop-blur-0">
            {/* Tab bar */}
            <div className="grid grid-cols-4 border-b border-gray-800">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-w-0 truncate py-2 px-1 text-[11px] sm:text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {activeTab === 'controls' && <ControlsPanel />}
              {activeTab === 'layers' && <LayerControls />}
              {activeTab === 'geometry' && <GeometryPanel />}
              {activeTab === 'theme' && <ThemeControls />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
