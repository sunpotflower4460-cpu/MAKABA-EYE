import { useMerkabaStore } from '../state/useMerkabaState';
import { getAllThemes } from '../render/sceneThemes';
import type { ThemeId } from '../geometry/types';

export function ThemeControls() {
  const { theme, setTheme } = useMerkabaStore(s => ({ theme: s.theme, setTheme: s.setTheme }));
  const themes = getAllThemes();

  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Theme</div>
      {themes.map(t => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id as ThemeId)}
          className={`w-full text-left text-xs px-3 py-1.5 rounded transition-colors ${
            theme === t.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
