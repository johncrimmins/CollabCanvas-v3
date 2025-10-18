'use client';

import { CanvasObject } from '../types';

interface LayerItemProps {
  object: CanvasObject;
  isSelected: boolean;
  onClick: (ctrlKey: boolean, metaKey: boolean) => void;
  onToggleVisibility: () => void;
}

export function LayerItem({ object, isSelected, onClick, onToggleVisibility }: LayerItemProps) {
  const isVisible = object.visible !== false;

  // Generate layer name based on object type and properties
  const getLayerName = () => {
    if (object.type === 'text' && object.text) {
      return object.text.substring(0, 20) + (object.text.length > 20 ? '...' : '');
    }
    
    if (object.type === 'rectangle') {
      return object.fill ? `${getColorName(object.fill)} Rectangle` : 'Rectangle';
    }
    
    if (object.type === 'circle') {
      return object.fill ? `${getColorName(object.fill)} Circle` : 'Circle';
    }
    
    if (object.type === 'arrow') {
      return 'Arrow';
    }
    
    return 'Object';
  };

  // Get icon for object type
  const getIcon = () => {
    switch (object.type) {
      case 'rectangle':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" strokeWidth={2} />
          </svg>
        );
      case 'circle':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" strokeWidth={2} />
          </svg>
        );
      case 'text':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10" />
          </svg>
        );
      case 'arrow':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
        ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}
        ${!isVisible ? 'opacity-60' : ''}
      `}
      onClick={(e) => onClick(e.ctrlKey, e.metaKey)}
    >
      {/* Visibility toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className="p-0.5 hover:bg-gray-200 rounded transition-colors"
        title={isVisible ? 'Hide layer' : 'Show layer'}
      >
        {isVisible ? (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        )}
      </button>

      {/* Object type icon */}
      <div className="text-gray-500">
        {getIcon()}
      </div>

      {/* Layer name */}
      <span className={`text-sm flex-1 ${isSelected ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
        {getLayerName()}
      </span>
    </div>
  );
}

// Helper to get simplified color names
function getColorName(hexColor: string): string {
  const colorMap: Record<string, string> = {
    '#FF0000': 'Red',
    '#ff0000': 'Red',
    '#00FF00': 'Green',
    '#00ff00': 'Green',
    '#0000FF': 'Blue',
    '#0000ff': 'Blue',
    '#3B82F6': 'Blue',
    '#3b82f6': 'Blue',
    '#FFFF00': 'Yellow',
    '#ffff00': 'Yellow',
    '#FF00FF': 'Magenta',
    '#ff00ff': 'Magenta',
    '#00FFFF': 'Cyan',
    '#00ffff': 'Cyan',
    '#000000': 'Black',
    '#FFFFFF': 'White',
    '#ffffff': 'White',
  };
  
  return colorMap[hexColor] || '';
}

