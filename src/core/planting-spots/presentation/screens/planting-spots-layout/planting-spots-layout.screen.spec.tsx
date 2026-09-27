import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import { PlantingSpotsLayoutScreen } from './planting-spots-layout.screen';
import { usePlantingGrid } from '@/core/planting-spots/presentation/hooks/use-planting-grid/use-planting-grid.hook';
import dictEn from '@/core/planting-spots/presentation/i18n/en';

vi.mock('@/core/planting-spots/presentation/hooks/use-planting-grid/use-planting-grid.hook', () => ({
  usePlantingGrid: vi.fn(),
}));

vi.mock('@/core/planting-spots/presentation/components/create-planting-spot-modal/create-planting-spot-modal', () => ({
  CreatePlantingSpotModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="create-spot-modal">
      <button onClick={onClose}>Close modal</button>
    </div>
  ),
}));

const mockSpots: PlantingSpot[] = [
  {
    id: 'spot-1',
    name: 'Bed 1',
    type: 'RAISED_BED',
    status: 'ACTIVE',
    row: 1,
    column: 1,
    userId: 'u1',
    spaceId: 's1',
    resolvedPlants: [],
    createdAt: '',
    updatedAt: '',
  },
];

describe('PlantingSpotsLayoutScreen', () => {
  const mockGridReturn = {
    matrix: [[mockSpots[0], null]],
    unassignedSpots: [],
    rows: 1,
    columns: 2,
    minRows: 1,
    minCols: 1,
    isLoading: false,
    error: null,
    activeDragSpot: null,
    setActiveDragSpot: vi.fn(),
    setDimensions: vi.fn(),
    assignSpotPosition: vi.fn(),
    unassignSpot: vi.fn(),
    swapSpotPositions: vi.fn(),
    handleDragEnd: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlantingGrid).mockReturnValue(mockGridReturn);
  });

  it('renders screen header with title, subtitle and action buttons', () => {
    render(<PlantingSpotsLayoutScreen dict={dictEn} lang="en" />);

    expect(screen.getByRole('heading', { name: 'Garden layout' })).toBeInTheDocument();
    expect(screen.getByText('Visual grid arrangement of planting spots')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Grid dimensions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /List view/i })).toBeInTheDocument();
  });

  it('renders planting spot on the grid', () => {
    render(<PlantingSpotsLayoutScreen dict={dictEn} lang="en" />);

    expect(screen.getByText('Bed 1')).toBeInTheDocument();
  });

  it('opens grid dimensions dialog when dimensions button is clicked', () => {
    render(<PlantingSpotsLayoutScreen dict={dictEn} lang="en" />);

    const dimBtn = screen.getByRole('button', { name: /Grid dimensions/i });
    fireEvent.click(dimBtn);

    expect(screen.getByRole('heading', { name: 'Grid dimensions' })).toBeInTheDocument();
  });

  it('opens assign modal when empty cell is clicked', () => {
    render(<PlantingSpotsLayoutScreen dict={dictEn} lang="en" />);

    const assignBtn = screen.getByRole('button', { name: /Click to assign a planting spot/i });
    fireEvent.click(assignBtn);

    expect(screen.getByRole('heading', { name: 'Assign planting spot' })).toBeInTheDocument();
  });

  it('adjusts zoom level when zoom buttons are clicked', () => {
    render(<PlantingSpotsLayoutScreen dict={dictEn} lang="en" />);

    const zoomInBtn = screen.getByRole('button', { name: /Zoom in/i });
    fireEvent.click(zoomInBtn);

    expect(screen.getByText('110%')).toBeInTheDocument();
  });
});
