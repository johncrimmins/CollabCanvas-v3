import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyEditor } from './PropertyEditor';
import { CanvasObject } from '@/features/objects/types';

describe('PropertyEditor', () => {
  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();

  const mockRectangle: CanvasObject = {
    id: 'rect1',
    type: 'rectangle',
    position: { x: 100, y: 100 },
    width: 150,
    height: 100,
    rotation: 0,
    fill: '#FF0000',
    createdBy: 'user1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockCircle: CanvasObject = {
    id: 'circle1',
    type: 'circle',
    position: { x: 200, y: 200 },
    width: 100,
    height: 100,
    radius: 50,
    rotation: 0,
    fill: '#0000FF',
    createdBy: 'user1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockText: CanvasObject = {
    id: 'text1',
    type: 'text',
    position: { x: 50, y: 50 },
    width: 200,
    height: 40,
    rotation: 0,
    fill: '#000000',
    text: 'Hello World',
    fontSize: 24,
    createdBy: 'user1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should not render when isOpen is false', () => {
    render(
      <PropertyEditor
        isOpen={false}
        object={mockRectangle}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.queryByText('Edit Properties')).not.toBeInTheDocument();
  });

  test('should not render when object is null', () => {
    render(
      <PropertyEditor
        isOpen={true}
        object={null}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.queryByText('Edit Properties')).not.toBeInTheDocument();
  });

  test('should render color, width, height, rotation for rectangle', () => {
    render(
      <PropertyEditor
        isOpen={true}
        object={mockRectangle}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Edit Properties')).toBeInTheDocument();
    expect(screen.getByLabelText('Color')).toBeInTheDocument();
    expect(screen.getByLabelText('Width')).toBeInTheDocument();
    expect(screen.getByLabelText('Height')).toBeInTheDocument();
    expect(screen.getByLabelText('Rotation (degrees)')).toBeInTheDocument();
  });

  test('should render radius for circle', () => {
    render(
      <PropertyEditor
        isOpen={true}
        object={mockCircle}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByLabelText('Radius')).toBeInTheDocument();
    expect(screen.queryByLabelText('Width')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Height')).not.toBeInTheDocument();
  });

  test('should render text content and font size for text objects', () => {
    render(
      <PropertyEditor
        isOpen={true}
        object={mockText}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByLabelText('Text Content')).toBeInTheDocument();
    expect(screen.getByLabelText('Font Size')).toBeInTheDocument();
    
    const textInput = screen.getByLabelText('Text Content') as HTMLTextAreaElement;
    expect(textInput.value).toBe('Hello World');
  });

  test('should initialize form with object values', () => {
    render(
      <PropertyEditor
        isOpen={true}
        object={mockRectangle}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const colorInput = screen.getByLabelText('Color') as HTMLInputElement;
    const widthInput = screen.getByLabelText('Width') as HTMLInputElement;
    const heightInput = screen.getByLabelText('Height') as HTMLInputElement;

    expect(colorInput.value).toBe('#ff0000'); // Normalized to lowercase
    expect(widthInput.value).toBe('150');
    expect(heightInput.value).toBe('100');
  });

  test('should call onClose when Cancel button is clicked', () => {
    render(
      <PropertyEditor
        isOpen={true}
        object={mockRectangle}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  test('should call onUpdate with changes when Apply is clicked', () => {
    render(
      <PropertyEditor
        isOpen={true}
        object={mockRectangle}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const widthInput = screen.getByLabelText('Width') as HTMLInputElement;
    fireEvent.change(widthInput, { target: { value: '200' } });

    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    expect(mockOnUpdate).toHaveBeenCalledWith({ width: 200 });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should not call onUpdate if no changes were made', () => {
    render(
      <PropertyEditor
        isOpen={true}
        object={mockRectangle}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    expect(mockOnUpdate).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should validate numeric inputs (width must be positive)', () => {
    render(
      <PropertyEditor
        isOpen={true}
        object={mockRectangle}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const widthInput = screen.getByLabelText('Width') as HTMLInputElement;
    
    // Input has min="5" attribute
    expect(widthInput).toHaveAttribute('min', '5');
    expect(widthInput).toHaveAttribute('max', '5000');
  });
});

