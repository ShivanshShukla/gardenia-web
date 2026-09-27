import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import dictEn from '@/core/planting-spots/presentation/i18n/en';
import { UnassignedSpotsTray } from './unassigned-spots-tray';

const mockSpot: PlantingSpot = {
  id: 'spot-unassigned-1',
  name: 'Seedling Tray',
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

describe('UnassignedSpotsTray', () => {
  it('renders unassigned title and empty message when no unassigned spots', () => {
    render(<UnassignedSpotsTray spots={[]} dict={dictEn} lang="en" />);

    expect(screen.getByText('Unassigned spots')).toBeInTheDocument();
    expect(screen.getByText('All planting spots are placed in the garden')).toBeInTheDocument();
  });

  it('renders unassigned spots list when spots exist', () => {
    render(<UnassignedSpotsTray spots={[mockSpot]} dict={dictEn} lang="en" />);

    expect(screen.getByText('Seedling Tray')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
