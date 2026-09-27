import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import { usePlantingGrid } from './use-planting-grid.hook';
import { usePlantingSpots } from '@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook';
import { useUpdatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook';
import dictEn from '@/core/planting-spots/presentation/i18n/en';
import { toast } from 'sonner';

vi.mock('@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook', () => ({
  usePlantingSpots: vi.fn(),
}));

vi.mock('@/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook', () => ({
  useUpdatePlantingSpot: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: {
    getState: () => ({ currentSpaceId: 'space-1' }),
  },
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
    spaceId: 'space-1',
    resolvedPlants: [],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'spot-2',
    name: 'Pot 2',
    type: 'POT',
    status: 'ACTIVE',
    row: null,
    column: null,
    userId: 'u1',
    spaceId: 'space-1',
    resolvedPlants: [],
    createdAt: '',
    updatedAt: '',
  },
];

describe('usePlantingGrid', () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlantingSpots).mockReturnValue({
      spots: mockSpots,
      total: 2,
      totalPages: 1,
      currentPage: 1,
      isLoading: false,
      error: null,
    });
    vi.mocked(useUpdatePlantingSpot).mockReturnValue({
      mutateAsync: mutateAsyncMock.mockResolvedValue({ id: 'spot-1' }),
    } as unknown as ReturnType<typeof useUpdatePlantingSpot>);
  });

  it('initializes grid matrix and unassigned spots correctly', () => {
    const { result } = renderHook(() => usePlantingGrid(dictEn));

    expect(result.current.matrix[0][0]?.id).toBe('spot-1');
    expect(result.current.unassignedSpots).toHaveLength(1);
    expect(result.current.unassignedSpots[0].id).toBe('spot-2');
  });

  it('updates grid dimensions when setDimensions is called', () => {
    const { result } = renderHook(() => usePlantingGrid(dictEn));

    act(() => {
      result.current.setDimensions(8, 8);
    });

    expect(result.current.rows).toBe(8);
    expect(result.current.columns).toBe(8);
    expect(result.current.matrix).toHaveLength(8);
    expect(result.current.matrix[0]).toHaveLength(8);
  });

  it('assigns spot to an empty cell and invokes update mutation', async () => {
    const { result } = renderHook(() => usePlantingGrid(dictEn));

    await act(async () => {
      await result.current.assignSpotPosition(mockSpots[1], 2, 3);
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      id: 'spot-2',
      row: 2,
      column: 3,
    });
    expect(result.current.matrix[1][2]?.id).toBe('spot-2');
  });

  it('unassigns spot when unassignSpot is called', async () => {
    const { result } = renderHook(() => usePlantingGrid(dictEn));

    await act(async () => {
      await result.current.unassignSpot(mockSpots[0]);
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      id: 'spot-1',
      row: null,
      column: null,
    });
    expect(result.current.matrix[0][0]).toBeNull();
    expect(result.current.unassignedSpots.some((s) => s.id === 'spot-1')).toBe(true);
  });

  it('reverts local state and shows error toast when mutation fails', async () => {
    mutateAsyncMock.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => usePlantingGrid(dictEn));

    await act(async () => {
      await result.current.assignSpotPosition(mockSpots[1], 2, 3);
    });

    expect(toast.error).toHaveBeenCalledWith('Could not update position. Try again.');
    // Spot 2 should still be unassigned
    expect(result.current.matrix[1][2]).toBeNull();
  });
});
