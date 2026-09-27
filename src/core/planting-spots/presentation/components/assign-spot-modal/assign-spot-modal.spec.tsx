import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import dictEn from '@/core/planting-spots/presentation/i18n/en';
import { AssignSpotModal } from './assign-spot-modal';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Available Pot',
  type: 'POT',
  status: 'ACTIVE',
  row: null,
  column: null,
  userId: 'u1',
  spaceId: 's1',
  resolvedPlants: [],
  createdAt: '',
  updatedAt: '',
};

describe('AssignSpotModal', () => {
  it('renders modal title and coordinates subtitle', () => {
    render(
      <AssignSpotModal
        row={2}
        column={3}
        unassignedSpots={[]}
        dict={dictEn}
        lang="en"
        onSelectSpot={vi.fn()}
        onCreateNew={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Assign planting spot')).toBeInTheDocument();
    expect(screen.getByText('Row 2 · Column 3')).toBeInTheDocument();
  });

  it('calls onSelectSpot when clicking "Place here" on an unassigned spot', () => {
    const handleSelect = vi.fn();
    render(
      <AssignSpotModal
        row={1}
        column={1}
        unassignedSpots={[mockSpot]}
        dict={dictEn}
        lang="en"
        onSelectSpot={handleSelect}
        onCreateNew={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Available Pot')).toBeInTheDocument();
    const placeBtn = screen.getByRole('button', { name: 'Place here' });
    fireEvent.click(placeBtn);

    expect(handleSelect).toHaveBeenCalledWith(mockSpot, 1, 1);
  });

  it('calls onCreateNew when clicking "Create new spot here"', () => {
    const handleCreateNew = vi.fn();
    render(
      <AssignSpotModal
        row={3}
        column={4}
        unassignedSpots={[]}
        dict={dictEn}
        lang="en"
        onSelectSpot={vi.fn()}
        onCreateNew={handleCreateNew}
        onClose={vi.fn()}
      />,
    );

    const createBtn = screen.getByRole('button', { name: 'Create new spot here' });
    fireEvent.click(createBtn);

    expect(handleCreateNew).toHaveBeenCalledWith(3, 4);
  });

  it('calls onClose when close/cancel is clicked', () => {
    const handleClose = vi.fn();
    render(
      <AssignSpotModal
        row={1}
        column={1}
        unassignedSpots={[]}
        dict={dictEn}
        lang="en"
        onSelectSpot={vi.fn()}
        onCreateNew={vi.fn()}
        onClose={handleClose}
      />,
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledOnce();
  });
});
