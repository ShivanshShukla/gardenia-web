import { describe, it, expect } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import {
  buildGridMatrix,
  getUnassignedSpots,
  calculateMinimumDimensions,
} from './planting-grid.util';

const createMockSpot = (id: string, name: string, row: number | null, column: number | null): PlantingSpot => ({
  id,
  name,
  type: 'RAISED_BED',
  status: 'ACTIVE',
  row,
  column,
  userId: 'user-1',
  spaceId: 'space-1',
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
});

describe('planting-grid.util', () => {
  describe('calculateMinimumDimensions', () => {
    it('returns default 5x5 dimensions when there are no spots', () => {
      const dimensions = calculateMinimumDimensions([]);
      expect(dimensions).toEqual({ rows: 5, columns: 5 });
    });

    it('returns default 5x5 dimensions when spots have null coordinates', () => {
      const spots = [createMockSpot('s1', 'Spot 1', null, null)];
      const dimensions = calculateMinimumDimensions(spots);
      expect(dimensions).toEqual({ rows: 5, columns: 5 });
    });

    it('expands dimensions when spots exceed default bounds', () => {
      const spots = [
        createMockSpot('s1', 'Spot 1', 7, 3),
        createMockSpot('s2', 'Spot 2', 2, 8),
      ];
      const dimensions = calculateMinimumDimensions(spots);
      expect(dimensions).toEqual({ rows: 7, columns: 8 });
    });

    it('respects custom minimum default bounds', () => {
      const spots = [createMockSpot('s1', 'Spot 1', 2, 2)];
      const dimensions = calculateMinimumDimensions(spots, 6, 6);
      expect(dimensions).toEqual({ rows: 6, columns: 6 });
    });
  });

  describe('buildGridMatrix', () => {
    it('builds an empty matrix of the specified size', () => {
      const matrix = buildGridMatrix([], 3, 4);
      expect(matrix).toHaveLength(3);
      expect(matrix[0]).toHaveLength(4);
      expect(matrix[0][0]).toBeNull();
      expect(matrix[2][3]).toBeNull();
    });

    it('places spots at their 1-based (row, column) coordinates', () => {
      const spot1 = createMockSpot('s1', 'Spot 1', 1, 1);
      const spot2 = createMockSpot('s2', 'Spot 2', 2, 3);
      const matrix = buildGridMatrix([spot1, spot2], 3, 3);

      expect(matrix[0][0]).toEqual(spot1);
      expect(matrix[1][2]).toEqual(spot2);
      expect(matrix[0][1]).toBeNull();
    });

    it('ignores spots with null or zero coordinates', () => {
      const unassigned = createMockSpot('s1', 'Unassigned', null, null);
      const invalid = createMockSpot('s2', 'Invalid', 0, 1);
      const matrix = buildGridMatrix([unassigned, invalid], 3, 3);

      expect(matrix.flat().every((cell) => cell === null)).toBe(true);
    });

    it('ignores spots outside the matrix boundaries', () => {
      const outOfBounds = createMockSpot('s1', 'Out', 5, 5);
      const matrix = buildGridMatrix([outOfBounds], 3, 3);

      expect(matrix.flat().every((cell) => cell === null)).toBe(true);
    });
  });

  describe('getUnassignedSpots', () => {
    it('returns empty array when all spots are assigned valid positions', () => {
      const spots = [
        createMockSpot('s1', 'Spot 1', 1, 1),
        createMockSpot('s2', 'Spot 2', 2, 2),
      ];
      expect(getUnassignedSpots(spots)).toEqual([]);
    });

    it('returns spots with null row or null column', () => {
      const s1 = createMockSpot('s1', 'No row', null, 2);
      const s2 = createMockSpot('s2', 'No col', 1, null);
      const s3 = createMockSpot('s3', 'Neither', null, null);
      const s4 = createMockSpot('s4', 'Assigned', 1, 1);

      const unassigned = getUnassignedSpots([s1, s2, s3, s4]);
      expect(unassigned).toEqual([s1, s2, s3]);
    });
  });
});
