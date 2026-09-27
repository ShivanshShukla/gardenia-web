'use client';

import { useState, useMemo, useCallback } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { toast } from 'sonner';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import { usePlantingSpots } from '@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook';
import { useUpdatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import {
  buildGridMatrix,
  getUnassignedSpots,
  calculateMinimumDimensions,
} from '@/core/planting-spots/presentation/utils/planting-grid/planting-grid.util';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const DEFAULT_DIMENSIONS = { rows: 5, columns: 5 };

const getStorageKey = (spaceId: string | null) =>
  `gardenia:grid-dimensions:${spaceId ?? 'default'}`;

export function usePlantingGrid(dict: AppDict['plantingSpots']) {
  const currentSpaceId = useSpacesStore.getState().currentSpaceId;
  const { spots: serverSpots, isLoading, error } = usePlantingSpots(1, 100);
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

  // Dimensions state (initialized from localStorage or calculated)
  const [dimensions, setDimensionsState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(getStorageKey(currentSpaceId));
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.rows && parsed.columns) return parsed;
        }
      } catch {
        // Fallback
      }
    }
    return DEFAULT_DIMENSIONS;
  });

  // Calculate minimum dimensions needed to hold existing placed spots
  const minDimensions = useMemo(
    () => calculateMinimumDimensions(localSpots, DEFAULT_DIMENSIONS.rows, DEFAULT_DIMENSIONS.columns),
    [localSpots],
  );

  // Ensure current dimensions never shrink smaller than placed spots
  const rows = Math.max(dimensions.rows, minDimensions.rows);
  const columns = Math.max(dimensions.columns, minDimensions.columns);

  const setDimensions = useCallback(
    (newRows: number, newCols: number) => {
      const clampedRows = Math.max(newRows, minDimensions.rows);
      const clampedCols = Math.max(newCols, minDimensions.columns);
      const nextDims = { rows: clampedRows, columns: clampedCols };
      setDimensionsState(nextDims);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(getStorageKey(currentSpaceId), JSON.stringify(nextDims));
        } catch {
          // Ignore write error
        }
      }
    },
    [currentSpaceId, minDimensions],
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

  // Swap positions between two spots
  const swapSpotPositions = useCallback(
    async (spotA: PlantingSpot, spotB: PlantingSpot) => {
      const targetRowA = spotB.row ?? null;
      const targetColA = spotB.column ?? null;
      const targetRowB = spotA.row ?? null;
      const targetColB = spotA.column ?? null;

      setOptimisticMoves((prev) => ({
        ...prev,
        [spotA.id]: { row: targetRowA, column: targetColA },
        [spotB.id]: { row: targetRowB, column: targetColB },
      }));

      try {
        await Promise.all([
          updateMutation.mutateAsync({ id: spotA.id, row: targetRowA, column: targetColA }),
          updateMutation.mutateAsync({ id: spotB.id, row: targetRowB, column: targetColB }),
        ]);
        toast.success(dict.layout.updateSuccess);
      } catch {
        setOptimisticMoves((prev) => {
          const next = { ...prev };
          delete next[spotA.id];
          delete next[spotB.id];
          return next;
        });
        toast.error(dict.layout.updateError);
      }
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
