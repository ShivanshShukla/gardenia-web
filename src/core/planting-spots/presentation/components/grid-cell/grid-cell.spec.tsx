import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import dictEn from '@/core/planting-spots/presentation/i18n/en';
import { GridCell } from './grid-cell';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Bancal 1',
  type: 'RAISED_BED',
  status: 'ACTIVE',
  capacity: 4,
  row: 2,
  column: 3,
  userId: 'u1',
  spaceId: 's1',
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('GridCell', () => {
  it('renders GridSpotCard when spot is present', () => {
    render(
      <GridCell
        row={2}
        column={3}
        spot={mockSpot}
        dict={dictEn}
        lang="en"
      />,
    );

    expect(screen.getByText('Bancal 1')).toBeInTheDocument();
  });

  it('renders empty cell state with coordinate and assign action when no spot', () => {
    const handleAssignClick = vi.fn();
    render(
      <GridCell
        row={2}
        column={3}
        spot={null}
        dict={dictEn}
        lang="en"
        onAssignClick={handleAssignClick}
      />,
    );

    expect(screen.getByText('R2 · C3')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /Click to assign a planting spot/i });
    fireEvent.click(button);

    expect(handleAssignClick).toHaveBeenCalledWith(2, 3);
  });
});
