'use client';

interface LayerPanelHeaderProps {
  objectCount: number;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function LayerPanelHeader({ objectCount, isCollapsed, onToggle }: LayerPanelHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
      <h3 className="text-sm font-semibold text-gray-900">
        Layers ({objectCount})
      </h3>
      <button
        onClick={onToggle}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
      >
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

