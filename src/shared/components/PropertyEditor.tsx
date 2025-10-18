'use client';

import { useState, useEffect } from 'react';
import { CanvasObject } from '@/features/objects/types';

interface PropertyEditorProps {
  isOpen: boolean;
  object: CanvasObject | null;
  onClose: () => void;
  onUpdate: (updates: Partial<CanvasObject>) => void;
}

export function PropertyEditor({ isOpen, object, onClose, onUpdate }: PropertyEditorProps) {
  const [fill, setFill] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [radius, setRadius] = useState('');
  const [rotation, setRotation] = useState('');
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState('');

  // Initialize form values when object changes
  useEffect(() => {
    if (object) {
      setFill(object.fill || '');
      setWidth(object.width?.toString() || '');
      setHeight(object.height?.toString() || '');
      setRadius(object.radius?.toString() || '');
      setRotation(object.rotation?.toString() || '0');
      setText(object.text || '');
      setFontSize(object.fontSize?.toString() || '');
    }
  }, [object]);

  if (!isOpen || !object) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: Partial<CanvasObject> = {};

    if (fill !== object.fill) updates.fill = fill;
    if (width && parseFloat(width) !== object.width) updates.width = parseFloat(width);
    if (height && parseFloat(height) !== object.height) updates.height = parseFloat(height);
    if (radius && parseFloat(radius) !== object.radius) updates.radius = parseFloat(radius);
    if (rotation && parseFloat(rotation) !== object.rotation) updates.rotation = parseFloat(rotation);
    if (text !== object.text) updates.text = text;
    if (fontSize && parseFloat(fontSize) !== object.fontSize) updates.fontSize = parseFloat(fontSize);

    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Edit Properties</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="color"
              value={fill}
              onChange={(e) => setFill(e.target.value)}
              className="w-full h-10 rounded border border-gray-300 cursor-pointer"
            />
          </div>

          {/* Width (for rectangle and arrow) */}
          {(object.type === 'rectangle' || object.type === 'arrow') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                min="5"
                max="5000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Height (for rectangle and arrow) */}
          {(object.type === 'rectangle' || object.type === 'arrow') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="5"
                max="5000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Radius (for circle) */}
          {object.type === 'circle' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                min="5"
                max="2500"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Text Content (for text) */}
          {object.type === 'text' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Content
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size
                </label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  min="8"
                  max="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Rotation (for all types) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rotation (degrees)
            </label>
            <input
              type="number"
              value={rotation}
              onChange={(e) => setRotation(e.target.value)}
              min="0"
              max="360"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

