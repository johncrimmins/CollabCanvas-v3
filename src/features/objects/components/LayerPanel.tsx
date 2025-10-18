'use client';

import { useEffect, useState } from 'react';
import { CanvasObject } from '../types';
import { LayerPanelHeader } from './LayerPanelHeader';
import { LayerItem } from './LayerItem';
import { useObjectsStore } from '../lib/objectsStore';

interface LayerPanelProps {
  objects: CanvasObject[];
  onToggleVisibility: (objectId: string) => void;
}

export function LayerPanel({ objects, onToggleVisibility }: LayerPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Get selection functions from store
  const selectedObjectIds = useObjectsStore((state) => state.selectedObjectIds);
  const toggleObjectSelection = useObjectsStore((state) => state.toggleObjectSelection);
  const setSelection = useObjectsStore((state) => state.setSelection);
  
  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('layerPanelCollapsed');
    if (saved) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('layerPanelCollapsed', String(newState));
  };

  const handleLayerClick = (objectId: string, ctrlKey: boolean, metaKey: boolean) => {
    const isMultiSelect = ctrlKey || metaKey;
    
    if (isMultiSelect) {
      toggleObjectSelection(objectId);
    } else {
      setSelection([objectId]);
    }
  };

  // Sort objects by creation time (newest first)
  const sortedObjects = [...objects].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="w-[280px] bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
      <LayerPanelHeader
        objectCount={objects.length}
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
      />
      
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          {sortedObjects.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No layers yet. Create objects to see them here.
            </div>
          ) : (
            <div>
              {sortedObjects.map((object) => (
                <LayerItem
                  key={object.id}
                  object={object}
                  isSelected={selectedObjectIds.includes(object.id)}
                  onClick={(ctrl, meta) => handleLayerClick(object.id, ctrl, meta)}
                  onToggleVisibility={() => onToggleVisibility(object.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

