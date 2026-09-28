import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import { usePlantingGrid } from './use-planting-grid.hook';
import { usePlantingSpots } from '@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook';
import { useUpdatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook';
import { usePlantingGridStore } from '@/core/planting-spots/infrastructure/store/planting-grid.store';
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

let currentMockSpaceId: string | null = 'space-1';

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => {
  const storeHook = vi.fn((selector) =>
    selector ? selector({ currentSpaceId: currentMockSpaceId }) : { currentSpaceId: currentMockSpaceId }
  );
  (storeHook as unknown as { getState: () => { currentSpaceId: string | null } }).getState = () => ({
    currentSpaceId: currentMockSpaceId,
  });
  return { useSpacesStore: storeHook };
});

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
    row: 2,
    column: 2,
    userId: 'u1',
    spaceId: 'space-1',
    resolvedPlants: [],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'spot-3',
    name: 'Field 3',
    type: 'FIELD_SECTION',
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
    currentMockSpaceId = 'space-1';
    usePlantingGridStore.getState().clear();
    localStorage.clear();

    vi.mocked(usePlantingSpots).mockReturnValue({
      spots: mockSpots,
      total: 3,
      totalPages: 1,
      currentPage: 1,
      isLoading: false,
      error: null,
    });
    vi.mocked(useUpdatePlantingSpot).mockReturnValue({
      mutateAsync: mutateAsyncMock.mockResolvedValue({ id: 'spot-1' }),
    } as unknown as ReturnType<typeof useUpdatePlantingSpot>);
  });

  it('requests 100 spots so the grid layout covers all spots in the space', () => {
    renderHook(() => usePlantingGrid(dictEn));
    expect(usePlantingSpots).toHaveBeenCalledWith(1, 100);
  });

  it('initializes grid matrix and unassigned spots correctly', () => {
    const { result } = renderHook(() => usePlantingGrid(dictEn));

    expect(result.current.matrix[0][0]?.id).toBe('spot-1');
    expect(result.current.matrix[1][1]?.id).toBe('spot-2');
    expect(result.current.unassignedSpots).toHaveLength(1);
    expect(result.current.unassignedSpots[0].id).toBe('spot-3');
  });

  it('updates grid dimensions in store when setDimensions is called', () => {
    const { result } = renderHook(() => usePlantingGrid(dictEn));

    act(() => {
      result.current.setDimensions(8, 8);
    });

    expect(result.current.rows).toBe(8);
    expect(result.current.columns).toBe(8);
    expect(usePlantingGridStore.getState().getDimensions('space-1')).toEqual({ rows: 8, columns: 8 });
  });

  it('assigns spot to an empty cell and clears optimistic override on success', async () => {
    const { result } = renderHook(() => usePlantingGrid(dictEn));

    await act(async () => {
      await result.current.assignSpotPosition(mockSpots[2], 3, 3);
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      id: 'spot-3',
      row: 3,
      column: 3,
    });
    expect(toast.success).toHaveBeenCalledWith('Position updated');
  });

  it('unassigns spot and clears optimistic override on success', async () => {
    const { result } = renderHook(() => usePlantingGrid(dictEn));

    await act(async () => {
      await result.current.unassignSpot(mockSpots[0]);
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      id: 'spot-1',
      row: null,
      column: null,
    });
    expect(toast.success).toHaveBeenCalledWith('Position updated');
  });

  it('reverts local state and shows error toast when assignSpotPosition fails', async () => {
    mutateAsyncMock.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => usePlantingGrid(dictEn));

    await act(async () => {
      await result.current.assignSpotPosition(mockSpots[2], 2, 3);
    });

    expect(toast.error).toHaveBeenCalledWith('Could not update position. Try again.');
    expect(result.current.matrix[1][2]).toBeNull();
    expect(result.current.unassignedSpots.some((s) => s.id === 'spot-3')).toBe(true);
  });

  describe('swapSpotPositions safety', () => {
    it('executes sequential updates and reports success when both succeed', async () => {
      const { result } = renderHook(() => usePlantingGrid(dictEn));

      await act(async () => {
        await result.current.swapSpotPositions(mockSpots[0], mockSpots[1]);
      });

      // Spot 1 should be updated to spot 2's pos (2, 2)
      // Spot 2 should be updated to spot 1's pos (1, 1)
      expect(mutateAsyncMock).toHaveBeenNthCalledWith(1, {
        id: 'spot-1',
        row: 2,
        column: 2,
      });
      expect(mutateAsyncMock).toHaveBeenNthCalledWith(2, {
        id: 'spot-2',
        row: 1,
        column: 1,
      });
      expect(toast.success).toHaveBeenCalledWith('Position updated');
    });

    it('rolls back optimistic state and aborts without touching spotB when spotA mutation fails', async () => {
      mutateAsyncMock.mockRejectedValueOnce(new Error('First write failed'));
      const { result } = renderHook(() => usePlantingGrid(dictEn));

      await act(async () => {
        await result.current.swapSpotPositions(mockSpots[0], mockSpots[1]);
      });

      expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('Could not update position. Try again.');
      // Original positions intact
      expect(result.current.matrix[0][0]?.id).toBe('spot-1');
      expect(result.current.matrix[1][1]?.id).toBe('spot-2');
    });

    it('compensates by rolling back spotA on the server when spotB mutation fails', async () => {
      // First write (spot 1) succeeds
      mutateAsyncMock.mockResolvedValueOnce({ id: 'spot-1' });
      // Second write (spot 2) fails
      mutateAsyncMock.mockRejectedValueOnce(new Error('Second write failed'));
      // Compensating write (spot 1 reverted) succeeds
      mutateAsyncMock.mockResolvedValueOnce({ id: 'spot-1' });

      const { result } = renderHook(() => usePlantingGrid(dictEn));

      await act(async () => {
        await result.current.swapSpotPositions(mockSpots[0], mockSpots[1]);
      });

      expect(mutateAsyncMock).toHaveBeenCalledTimes(3);
      // Call 1: spot-1 moved to (2, 2)
      expect(mutateAsyncMock).toHaveBeenNthCalledWith(1, { id: 'spot-1', row: 2, column: 2 });
      // Call 2: spot-2 moved to (1, 1) -> fails
      expect(mutateAsyncMock).toHaveBeenNthCalledWith(2, { id: 'spot-2', row: 1, column: 1 });
      // Call 3: compensating rollback for spot-1 back to (1, 1)
      expect(mutateAsyncMock).toHaveBeenNthCalledWith(3, { id: 'spot-1', row: 1, column: 1 });

      expect(toast.error).toHaveBeenCalledWith('Could not update position. Try again.');
    });
  });
});
