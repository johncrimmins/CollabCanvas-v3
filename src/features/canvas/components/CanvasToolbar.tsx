// Canvas toolbar component - zoom controls and tools
'use client';

import { useCanvas } from '../hooks/useCanvas';

export function CanvasToolbar() {
  const { viewport, zoom, resetViewport } = useCanvas();
  
  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
      <button
        onClick={() => zoom(-1)}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Zoom out"
        aria-label="Zoom out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>
      
      <button
        onClick={resetViewport}
        className="px-3 py-1 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium"
        title="Reset zoom"
      >
        {Math.round(viewport.scale * 100)}%
      </button>
      
      <button
        onClick={() => zoom(1)}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Zoom in"
        aria-label="Zoom in"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-2" />
      
      <div className="text-xs text-gray-500">
        Click and drag to pan
      </div>
    </div>
  );
}

