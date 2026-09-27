import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

export interface GridDimensions {
  rows: number;
  columns: number;
}

export function calculateMinimumDimensions(
  spots: PlantingSpot[],
  defaultRows = 5,
  defaultCols = 5,
): GridDimensions {
  let maxRow = defaultRows;
  let maxCol = defaultCols;

  for (const spot of spots) {
    if (spot.row != null && spot.row > maxRow) {
      maxRow = spot.row;
    }
    if (spot.column != null && spot.column > maxCol) {
      maxCol = spot.column;
    }
  }

  return { rows: maxRow, columns: maxCol };
}

export function buildGridMatrix(
  spots: PlantingSpot[],
  rows: number,
  columns: number,
): (PlantingSpot | null)[][] {
  const matrix: (PlantingSpot | null)[][] = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => null),
  );

  for (const spot of spots) {
    if (spot.row != null && spot.column != null && spot.row >= 1 && spot.column >= 1) {
      const rowIndex = spot.row - 1;
      const colIndex = spot.column - 1;
      if (rowIndex < rows && colIndex < columns) {
        matrix[rowIndex][colIndex] = spot;
      }
    }
  }

  return matrix;
}

export function getUnassignedSpots(spots: PlantingSpot[]): PlantingSpot[] {
  return spots.filter(
    (spot) => spot.row == null || spot.column == null || spot.row < 1 || spot.column < 1,
  );
}
