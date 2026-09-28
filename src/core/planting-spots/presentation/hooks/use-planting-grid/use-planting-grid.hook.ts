'use client';

import { useState, useMemo, useCallback } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { toast } from 'sonner';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import { usePlantingSpots } from '@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook';
import { useUpdatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import {
  usePlantingGridStore,
  DEFAULT_GRID_DIMENSIONS,
} from '@/core/planting-spots/infrastructure/store/planting-grid.store';
import {
  buildGridMatrix,
  getUnassignedSpots,
  calculateMinimumDimensions,
} from '@/core/planting-spots/presentation/utils/planting-grid/planting-grid.util';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

// Standard ceiling page size for loading all planting spots in the layout view.
// Matches the pattern used in summary views and selectors across the application.
export const LAYOUT_PAGE_SIZE = 100;

export function usePlantingGrid(dict: AppDict['plantingSpots']) {
  const currentSpaceId = useSpacesStore((state) => state.currentSpaceId);
  const storedDimensions = usePlantingGridStore(
    (state) => state.dimensionsBySpace[currentSpaceId ?? 'default'],
  );
  const setStoreDimensions = usePlantingGridStore((state) => state.setDimensions);
  const getStoreDimensions = usePlantingGridStore((state) => state.getDimensions);

  const dimensions = storedDimensions ?? getStoreDimensions(currentSpaceId);

  const { spots: serverSpots, isLoading, error } = usePlantingSpots(1, LAYOUT_PAGE_SIZE);
  const updateMutation = useUpdatePlantingSpot();

  const [optimisticMoves, setOptimisticMoves] = useState<
    Record<string, { row: number | null; column: number | null }>
  >({});
  const [activeDragSpot, setActiveDragSpot] = useState<PlantingSpot | null>(null);

  // Derive local spots by applying any in-flight optimistic moves to server spots
  const localSpots = useMemo(() => {
    return serverSpots.map((spot) => {
      const override = optimisticMoves[spot.id];
      return override !== undefined
        ? { ...spot, row: override.row, column: override.column }
        : spot;
    });
  }, [serverSpots, optimisticMoves]);

  // Calculate minimum dimensions needed to hold existing placed spots
  const minDimensions = useMemo(
    () => calculateMinimumDimensions(localSpots, DEFAULT_GRID_DIMENSIONS.rows, DEFAULT_GRID_DIMENSIONS.columns),
    [localSpots],
  );

  // Ensure current dimensions never shrink smaller than placed spots
  const rows = Math.max(dimensions.rows, minDimensions.rows);
  const columns = Math.max(dimensions.columns, minDimensions.columns);

  const setDimensions = useCallback(
    (newRows: number, newCols: number) => {
      const clampedRows = Math.max(newRows, minDimensions.rows);
      const clampedCols = Math.max(newCols, minDimensions.columns);
      setStoreDimensions(currentSpaceId, { rows: clampedRows, columns: clampedCols });
    },
    [currentSpaceId, minDimensions, setStoreDimensions],
  );

  // 2D Matrix of spots
  const matrix = useMemo(
    () => buildGridMatrix(localSpots, rows, columns),
    [localSpots, rows, columns],
  );

  // Unassigned spots list
  const unassignedSpots = useMemo(
    () => getUnassignedSpots(localSpots),
    [localSpots],
  );

  // Assign spot to specific row and column
  const assignSpotPosition = useCallback(
    async (spot: PlantingSpot, targetRow: number, targetCol: number) => {
      setOptimisticMoves((prev) => ({
        ...prev,
        [spot.id]: { row: targetRow, column: targetCol },
      }));

      try {
        await updateMutation.mutateAsync({
          id: spot.id,
          row: targetRow,
          column: targetCol,
        });
        setOptimisticMoves((prev) => {
          const next = { ...prev };
          delete next[spot.id];
          return next;
        });
        toast.success(dict.layout.updateSuccess);
      } catch {
        setOptimisticMoves((prev) => {
          const next = { ...prev };
          delete next[spot.id];
          return next;
        });
        toast.error(dict.layout.updateError);
      }
    },
    [updateMutation, dict],
  );

  // Unassign spot from the grid
  const unassignSpot = useCallback(
    async (spot: PlantingSpot) => {
      setOptimisticMoves((prev) => ({
        ...prev,
        [spot.id]: { row: null, column: null },
      }));

      try {
        await updateMutation.mutateAsync({
          id: spot.id,
          row: null,
          column: null,
        });
        setOptimisticMoves((prev) => {
          const next = { ...prev };
          delete next[spot.id];
          return next;
        });
        toast.success(dict.layout.updateSuccess);
      } catch {
        setOptimisticMoves((prev) => {
          const next = { ...prev };
          delete next[spot.id];
          return next;
        });
        toast.error(dict.layout.updateError);
      }
    },
    [updateMutation, dict],
  );

  // Swap positions between two spots with compensating rollback on failure
  const swapSpotPositions = useCallback(
    async (spotA: PlantingSpot, spotB: PlantingSpot) => {
      const origRowA = spotA.row ?? null;
      const origColA = spotA.column ?? null;
      const origRowB = spotB.row ?? null;
      const origColB = spotB.column ?? null;

      const targetRowA = origRowB;
      const targetColA = origColB;
      const targetRowB = origRowA;
      const targetColB = origColA;

      setOptimisticMoves((prev) => ({
        ...prev,
        [spotA.id]: { row: targetRowA, column: targetColA },
        [spotB.id]: { row: targetRowB, column: targetColB },
      }));

      try {
        await updateMutation.mutateAsync({ id: spotA.id, row: targetRowA, column: targetColA });
      } catch {
        setOptimisticMoves((prev) => {
          const next = { ...prev };
          delete next[spotA.id];
          delete next[spotB.id];
          return next;
        });
        toast.error(dict.layout.updateError);
        return;
      }

      try {
        await updateMutation.mutateAsync({ id: spotB.id, row: targetRowB, column: targetColB });
      } catch {
        // Compensating rollback: revert spotA back on server
        try {
          await updateMutation.mutateAsync({ id: spotA.id, row: origRowA, column: origColA });
        } catch {
          // Query invalidation will sync cache eventually
        }
        setOptimisticMoves((prev) => {
          const next = { ...prev };
          delete next[spotA.id];
          delete next[spotB.id];
          return next;
        });
        toast.error(dict.layout.updateError);
        return;
      }

      // Both updates succeeded consistently
      setOptimisticMoves((prev) => {
        const next = { ...prev };
        delete next[spotA.id];
        delete next[spotB.id];
        return next;
      });
      toast.success(dict.layout.updateSuccess);
    },
    [updateMutation, dict],
  );

  // Handle Drag & Drop end event
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragSpot(null);

      if (!over) return;

      const activeSpot =
        (active.data.current?.spot as PlantingSpot | undefined) ??
        localSpots.find((s) => s.id === active.id);

      if (!activeSpot) return;

      // Drop on unassigned tray
      if (over.id === 'unassigned-tray') {
        if (activeSpot.row != null || activeSpot.column != null) {
          unassignSpot(activeSpot);
        }
        return;
      }

      // Drop on another spot card directly
      const overSpot = over.data.current?.spot as PlantingSpot | undefined;
      if (overSpot && overSpot.id !== activeSpot.id) {
        swapSpotPositions(activeSpot, overSpot);
        return;
      }

      // Drop on a grid cell: cell-{row}-{col}
      const overIdStr = String(over.id);
      if (overIdStr.startsWith('cell-')) {
        const parts = overIdStr.split('-');
        const targetRow = parseInt(parts[1], 10);
        const targetCol = parseInt(parts[2], 10);

        if (isNaN(targetRow) || isNaN(targetCol)) return;

        // Check if cell is currently occupied in local matrix
        const occupant = matrix[targetRow - 1]?.[targetCol - 1];
        if (occupant) {
          if (occupant.id !== activeSpot.id) {
            swapSpotPositions(activeSpot, occupant);
          }
        } else {
          assignSpotPosition(activeSpot, targetRow, targetCol);
        }
      }
    },
    [localSpots, matrix, assignSpotPosition, swapSpotPositions, unassignSpot],
  );

  return {
    matrix,
    unassignedSpots,
    rows,
    columns,
    minRows: minDimensions.rows,
    minCols: minDimensions.columns,
    isLoading,
    error,
    activeDragSpot,
    setActiveDragSpot,
    setDimensions,
    assignSpotPosition,
    unassignSpot,
    swapSpotPositions,
    handleDragEnd,
  };
}
