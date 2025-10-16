// Object renderer - renders all canvas objects
'use client';

import { useState, useEffect } from 'react';
import { CanvasObject } from '../types';
import { Rectangle } from './Rectangle';
import { Circle } from './Circle';

interface ObjectRendererProps {
  objects: CanvasObject[];
  onObjectUpdate: (objectId: string, updates: Partial<CanvasObject>) => void;
  onObjectDragMove?: (objectId: string, position: { x: number; y: number }) => void;
  onObjectTransformStart?: (objectId: string) => void;
  onObjectTransform?: (objectId: string, updates: Partial<CanvasObject>) => void;
  onObjectTransformEnd?: (objectId: string) => void;
  onObjectSelect?: (objectId: string | null) => void;
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
  currentUserId,
  presenceUsers = {},
  deselectTrigger,
}: ObjectRendererProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Deselect when trigger changes
  useEffect(() => {
    if (deselectTrigger !== undefined) {
      setSelectedId(null);
      if (onObjectSelect) {
        onObjectSelect(null);
      }
    }
  }, [deselectTrigger, onObjectSelect]);
  
  const handleSelect = (id: string) => {
    setSelectedId(id);
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
        const isSelected = object.id === selectedId;
        const isBeingTransformedByOther = !!(object.transformingBy && object.transformingBy !== currentUserId);
        const transformingUserName = object.transformingBy && presenceUsers[object.transformingBy]?.displayName;
        
        if (object.type === 'rectangle') {
          return (
            <Rectangle
              key={object.id}
              object={object}
              isSelected={isSelected}
              onSelect={() => handleSelect(object.id)}
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
              onSelect={() => handleSelect(object.id)}
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

