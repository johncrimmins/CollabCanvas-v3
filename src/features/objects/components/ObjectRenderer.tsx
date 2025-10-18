// Object renderer - renders all canvas objects
'use client';

import { useEffect } from 'react';
import { CanvasObject } from '../types';
import { Rectangle } from './Rectangle';
import { Circle } from './Circle';
import { Text } from './Text';
import { Arrow } from './Arrow';
import { useObjectsStore } from '../lib/objectsStore';

interface ObjectRendererProps {
  objects: CanvasObject[];
  onObjectUpdate: (objectId: string, updates: Partial<CanvasObject>) => void;
  onObjectDragMove?: (objectId: string, position: { x: number; y: number }) => void;
  onObjectTransformStart?: (objectId: string) => void;
  onObjectTransform?: (objectId: string, updates: Partial<CanvasObject>) => void;
  onObjectTransformEnd?: (objectId: string) => void;
  onObjectSelect?: (objectId: string | null) => void;
  onObjectRightClick?: (objectId: string, position: { x: number; y: number }) => void;
  currentUserId?: string;
  presenceUsers?: Record<string, { displayName: string }>;
  deselectTrigger?: number; // Increment this to trigger deselection
}

export function ObjectRenderer({ 
  objects, 
  onObjectUpdate, 
  onObjectDragMove,
  onObjectTransformStart,
  onObjectTransform,
  onObjectTransformEnd,
  onObjectSelect,
  onObjectRightClick,
  currentUserId,
  presenceUsers = {},
  deselectTrigger,
}: ObjectRendererProps) {
  // Get selection state and actions from store
  const selectedObjectIds = useObjectsStore((state) => state.selectedObjectIds);
  const toggleObjectSelection = useObjectsStore((state) => state.toggleObjectSelection);
  const setSelection = useObjectsStore((state) => state.setSelection);
  const clearSelection = useObjectsStore((state) => state.clearSelection);
  
  // Deselect when trigger changes
  useEffect(() => {
    if (deselectTrigger !== undefined) {
      clearSelection();
      if (onObjectSelect) {
        onObjectSelect(null);
      }
    }
  }, [deselectTrigger, onObjectSelect, clearSelection]);
  
  const handleSelect = (id: string, ctrlKey: boolean, metaKey: boolean) => {
    const isMultiSelect = ctrlKey || metaKey;
    
    if (isMultiSelect) {
      // Toggle selection (add or remove from selection)
      toggleObjectSelection(id);
    } else {
      // Single select (clear others and select this one)
      setSelection([id]);
    }
    
    // Notify parent (for backward compatibility)
    if (onObjectSelect) {
      onObjectSelect(id);
    }
  };
  
  const handleDragMove = (objectId: string, position: { x: number; y: number }) => {
    if (onObjectDragMove) {
      onObjectDragMove(objectId, position);
    }
  };
  
  const handleDragEnd = (objectId: string, position: { x: number; y: number }) => {
    onObjectUpdate(objectId, { position });
  };

  const handleTransformStart = (objectId: string) => {
    if (onObjectTransformStart) {
      onObjectTransformStart(objectId);
    }
  };

  const handleTransform = (objectId: string, updates: Partial<CanvasObject>) => {
    if (onObjectTransform) {
      onObjectTransform(objectId, updates);
    }
  };
  
  const handleTransformEnd = (objectId: string, updates: Partial<CanvasObject>) => {
    onObjectUpdate(objectId, updates);
    if (onObjectTransformEnd) {
      onObjectTransformEnd(objectId);
    }
  };
  
  return (
    <>
      {objects.map((object) => {
        const isSelected = selectedObjectIds.includes(object.id);
        const isBeingTransformedByOther = !!(object.transformingBy && object.transformingBy !== currentUserId);
        const transformingUserName = object.transformingBy && presenceUsers[object.transformingBy]?.displayName;
        
        if (object.type === 'rectangle') {
          return (
            <Rectangle
              key={object.id}
              object={object}
              isSelected={isSelected}
              onSelect={(ctrlKey, metaKey) => handleSelect(object.id, ctrlKey, metaKey)}
              onRightClick={onObjectRightClick ? (pos) => onObjectRightClick(object.id, pos) : undefined}
              onDragMove={(pos) => handleDragMove(object.id, pos)}
              onDragEnd={(pos) => handleDragEnd(object.id, pos)}
              onTransformStart={() => handleTransformStart(object.id)}
              onTransform={(updates) => handleTransform(object.id, updates)}
              onTransformEnd={(updates) => handleTransformEnd(object.id, updates)}
              isBeingTransformedByOther={isBeingTransformedByOther}
              transformingUserName={transformingUserName}
            />
          );
        }
        
        if (object.type === 'circle') {
          return (
            <Circle
              key={object.id}
              object={object}
              isSelected={isSelected}
              onSelect={(ctrlKey, metaKey) => handleSelect(object.id, ctrlKey, metaKey)}
              onRightClick={onObjectRightClick ? (pos) => onObjectRightClick(object.id, pos) : undefined}
              onDragMove={(pos) => handleDragMove(object.id, pos)}
              onDragEnd={(pos) => handleDragEnd(object.id, pos)}
              onTransformStart={() => handleTransformStart(object.id)}
              onTransform={(updates) => handleTransform(object.id, updates)}
              onTransformEnd={(updates) => handleTransformEnd(object.id, updates)}
              isBeingTransformedByOther={isBeingTransformedByOther}
              transformingUserName={transformingUserName}
            />
          );
        }
        
        if (object.type === 'text') {
          return (
            <Text
              key={object.id}
              object={object}
              isSelected={isSelected}
              onSelect={(ctrlKey, metaKey) => handleSelect(object.id, ctrlKey, metaKey)}
              onRightClick={onObjectRightClick ? (pos) => onObjectRightClick(object.id, pos) : undefined}
              onDragMove={(pos) => handleDragMove(object.id, pos)}
              onDragEnd={(pos) => handleDragEnd(object.id, pos)}
              onTransformStart={() => handleTransformStart(object.id)}
              onTransform={(updates) => handleTransform(object.id, updates)}
              onTransformEnd={(updates) => handleTransformEnd(object.id, updates)}
              isBeingTransformedByOther={isBeingTransformedByOther}
              transformingUserName={transformingUserName}
            />
          );
        }
        
        if (object.type === 'arrow') {
          return (
            <Arrow
              key={object.id}
              object={object}
              isSelected={isSelected}
              onSelect={(ctrlKey, metaKey) => handleSelect(object.id, ctrlKey, metaKey)}
              onRightClick={onObjectRightClick ? (pos) => onObjectRightClick(object.id, pos) : undefined}
              onDragMove={(pos) => handleDragMove(object.id, pos)}
              onDragEnd={(pos) => handleDragEnd(object.id, pos)}
              onTransformStart={() => handleTransformStart(object.id)}
              onTransform={(updates) => handleTransform(object.id, updates)}
              onTransformEnd={(updates) => handleTransformEnd(object.id, updates)}
              isBeingTransformedByOther={isBeingTransformedByOther}
              transformingUserName={transformingUserName}
            />
          );
        }
        
        return null;
      })}
    </>
  );
}

