import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextMenu, ContextMenuItem } from './ContextMenu';

describe('ContextMenu', () => {
  const mockOnClose = vi.fn();
  const mockOnClick = vi.fn();

  const mockItems: ContextMenuItem[] = [
    { label: 'Edit', onClick: mockOnClick },
    { label: 'Duplicate', onClick: mockOnClick },
    { divider: true, label: '', onClick: () => {} },
    { label: 'Delete', onClick: mockOnClick, danger: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render menu items when isOpen is true', () => {
    render(
      <ContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        items={mockItems}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Duplicate')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('should not render when isOpen is false', () => {
    render(
      <ContextMenu
        isOpen={false}
        position={{ x: 100, y: 100 }}
        items={mockItems}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  test('should call onClick handler and close menu when item is clicked', () => {
    render(
      <ContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        items={mockItems}
        onClose={mockOnClose}
      />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should not call onClick for disabled items', () => {
    const disabledItems: ContextMenuItem[] = [
      { label: 'Disabled Action', onClick: mockOnClick, disabled: true },
    ];

    render(
      <ContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        items={disabledItems}
        onClose={mockOnClose}
      />
    );

    const button = screen.getByText('Disabled Action');
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('should apply danger styling to danger items', () => {
    render(
      <ContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        items={mockItems}
        onClose={mockOnClose}
      />
    );

    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toHaveClass('text-red-600');
  });

  test('should close menu on Escape key press', () => {
    render(
      <ContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        items={mockItems}
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should render divider elements', () => {
    const { container } = render(
      <ContextMenu
        isOpen={true}
        position={{ x: 100, y: 100 }}
        items={mockItems}
        onClose={mockOnClose}
      />
    );

    // Divider should be rendered as a div with height class
    const dividers = container.querySelectorAll('.h-px');
    expect(dividers.length).toBeGreaterThan(0);
  });

  test('should position menu at specified coordinates', () => {
    const { container } = render(
      <ContextMenu
        isOpen={true}
        position={{ x: 250, y: 350 }}
        items={mockItems}
        onClose={mockOnClose}
      />
    );

    const menu = container.querySelector('.fixed');
    expect(menu).toHaveStyle({ left: '250px', top: '350px' });
  });
});

