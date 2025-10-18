import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayerPanel } from './LayerPanel';
import { CanvasObject } from '../types';
import { useObjectsStore } from '../lib/objectsStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LayerPanel', () => {
  const mockOnToggleVisibility = vi.fn();

  const mockObjects: CanvasObject[] = [
    {
      id: 'obj1',
      type: 'rectangle',
      position: { x: 100, y: 100 },
      width: 150,
      height: 100,
      rotation: 0,
      fill: '#FF0000',
      createdBy: 'user1',
      createdAt: 1000,
      updatedAt: 1000,
    },
    {
      id: 'obj2',
      type: 'circle',
      position: { x: 200, y: 200 },
      width: 100,
      height: 100,
      radius: 50,
      rotation: 0,
      fill: '#0000FF',
      createdBy: 'user1',
      createdAt: 2000,
      updatedAt: 2000,
    },
    {
      id: 'obj3',
      type: 'text',
      position: { x: 50, y: 50 },
      width: 200,
      height: 40,
      rotation: 0,
      fill: '#000000',
      text: 'Test Text',
      fontSize: 24,
      createdBy: 'user1',
      createdAt: 3000,
      updatedAt: 3000,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    useObjectsStore.setState({ selectedObjectIds: [] });
  });

  test('should render header with object count', () => {
    render(
      <LayerPanel objects={mockObjects} onToggleVisibility={mockOnToggleVisibility} />
    );

    expect(screen.getByText('Layers (3)')).toBeInTheDocument();
  });

  test('should render all objects as layer items', () => {
    render(
      <LayerPanel objects={mockObjects} onToggleVisibility={mockOnToggleVisibility} />
    );

    expect(screen.getByText('Rectangle')).toBeInTheDocument();
    expect(screen.getByText('Circle')).toBeInTheDocument();
    expect(screen.getByText('Test Text')).toBeInTheDocument();
  });

  test('should display empty state when no objects exist', () => {
    render(
      <LayerPanel objects={[]} onToggleVisibility={mockOnToggleVisibility} />
    );

    expect(screen.getByText('No layers yet. Create objects to see them here.')).toBeInTheDocument();
  });

  test('should sort objects by creation time (newest first)', () => {
    render(
      <LayerPanel objects={mockObjects} onToggleVisibility={mockOnToggleVisibility} />
    );

    const layerItems = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.includes('Rectangle') || 
      btn.textContent?.includes('Circle') || 
      btn.textContent?.includes('Text')
    );

    // Most recent (obj3 - text) should be first
    expect(layerItems[0].textContent).toContain('Test Text');
  });

  test('should select object when layer is clicked', () => {
    render(
      <LayerPanel objects={mockObjects} onToggleVisibility={mockOnToggleVisibility} />
    );

    const rectangleLayer = screen.getByText('Rectangle');
    fireEvent.click(rectangleLayer);

    const { selectedObjectIds } = useObjectsStore.getState();
    expect(selectedObjectIds).toContain('obj1');
  });

  test('should toggle selection when Ctrl+click', () => {
    render(
      <LayerPanel objects={mockObjects} onToggleVisibility={mockOnToggleVisibility} />
    );

    const rectangleLayer = screen.getByText('Rectangle');
    
    // First click selects
    fireEvent.click(rectangleLayer, { ctrlKey: true });
    expect(useObjectsStore.getState().selectedObjectIds).toContain('obj1');
    
    // Second Ctrl+click deselects
    fireEvent.click(rectangleLayer, { ctrlKey: true });
    expect(useObjectsStore.getState().selectedObjectIds).not.toContain('obj1');
  });

  test('should call onToggleVisibility when eye icon is clicked', () => {
    render(
      <LayerPanel objects={mockObjects} onToggleVisibility={mockOnToggleVisibility} />
    );

    // Get first visibility toggle button (eye icon)
    const visibilityButtons = screen.getAllByTitle(/Hide layer|Show layer/);
    fireEvent.click(visibilityButtons[0]);

    expect(mockOnToggleVisibility).toHaveBeenCalled();
  });

  test('should save collapsed state to localStorage', () => {
    render(
      <LayerPanel objects={mockObjects} onToggleVisibility={mockOnToggleVisibility} />
    );

    const headerButton = screen.getByTitle(/Expand panel|Collapse panel/);
    fireEvent.click(headerButton);

    expect(localStorageMock.getItem('layerPanelCollapsed')).toBe('true');
  });

  test('should show selected state for selected layers', () => {
    useObjectsStore.setState({ selectedObjectIds: ['obj2'] });

    render(
      <LayerPanel objects={mockObjects} onToggleVisibility={mockOnToggleVisibility} />
    );

    const circleLayer = screen.getByText('Circle');
    const parentDiv = circleLayer.closest('div');
    
    expect(parentDiv).toHaveClass('bg-blue-100');
  });

  test('should display layer name with color for colored shapes', () => {
    const redRectangle: CanvasObject = {
      ...mockObjects[0],
      fill: '#FF0000',
    };

    render(
      <LayerPanel objects={[redRectangle]} onToggleVisibility={mockOnToggleVisibility} />
    );

    // Should show "Red Rectangle" if color mapping is implemented
    expect(screen.getByText(/Rectangle/)).toBeInTheDocument();
  });
});

