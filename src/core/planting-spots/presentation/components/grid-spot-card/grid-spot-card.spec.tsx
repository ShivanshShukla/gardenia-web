import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import dictEn from '@/core/planting-spots/presentation/i18n/en';
import { GridSpotCard } from './grid-spot-card';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Bancal Norte',
  type: 'RAISED_BED',
  status: 'ACTIVE',
  capacity: 10,
  row: 1,
  column: 1,
  userId: 'u1',
  spaceId: 's1',
  resolvedPlants: [
    { id: 'p1', name: 'Tomato', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
    { id: 'p2', name: 'Pepper', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
  ],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('GridSpotCard', () => {
  it('renders spot name, type badge, and capacity count', () => {
    render(<GridSpotCard spot={mockSpot} dict={dictEn} lang="en" />);

    expect(screen.getByText('Bancal Norte')).toBeInTheDocument();
    expect(screen.getByText('Raised bed')).toBeInTheDocument();
    expect(screen.getByText('2 / 10 plants')).toBeInTheDocument();
  });

  it('renders fallow badge when status is FALLOW', () => {
    const fallowSpot = { ...mockSpot, status: 'FALLOW' as const };
    render(<GridSpotCard spot={fallowSpot} dict={dictEn} lang="en" />);

    expect(screen.getByText('Fallow')).toBeInTheDocument();
  });

  it('renders link to planting spot detail page', () => {
    render(<GridSpotCard spot={mockSpot} dict={dictEn} lang="en" />);

    const link = screen.getByRole('link', { name: /Bancal Norte/i });
    expect(link).toHaveAttribute('href', '/en/planting-spots/spot-1');
  });

  it('calls onUnassign when unassign button is clicked', () => {
    const handleUnassign = vi.fn();
    render(<GridSpotCard spot={mockSpot} dict={dictEn} lang="en" onUnassign={handleUnassign} />);

    const unassignBtn = screen.getByRole('button', { name: 'Remove from grid' });
    fireEvent.click(unassignBtn);

    expect(handleUnassign).toHaveBeenCalledWith(mockSpot);
  });
});
