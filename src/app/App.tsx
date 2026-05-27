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
    <div className="h-screen w-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-gray-900/90 border-b border-gray-800 z-20">
        <div className="flex items-center gap-3">
          <div className="text-blue-400 font-bold tracking-widest text-sm">MAKABA-EYE</div>
          <div className="hidden sm:block text-gray-500 text-xs">Stella Octangula Observatory</div>
        </div>
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="text-xs text-gray-400 hover:text-gray-200 border border-gray-700 rounded px-2 py-1 transition-colors"
        >
          {panelOpen ? 'Hide Panel' : 'Show Panel'}
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 3D Canvas (fills remaining space) */}
        <div className="flex-1 relative">
          <MerkabaCanvas />
          <ValidationOverlay />
        </div>

        {/* Side panel */}
        {panelOpen && (
          <div className="flex-shrink-0 w-72 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-gray-800">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
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
            <div className="flex-1 overflow-y-auto p-4">
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
