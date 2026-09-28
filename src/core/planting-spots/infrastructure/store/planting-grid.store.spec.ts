import { describe, it, expect, beforeEach } from 'vitest';
import { usePlantingGridStore } from './planting-grid.store';

describe('usePlantingGridStore', () => {
  beforeEach(() => {
    localStorage.clear();
    usePlantingGridStore.getState().clear();
  });

  it('returns default dimensions 5x5 when no dimensions are stored for a space', () => {
    const dims = usePlantingGridStore.getState().getDimensions('space-1');
    expect(dims).toEqual({ rows: 5, columns: 5 });
  });

  it('stores and retrieves dimensions keyed by spaceId', () => {
    usePlantingGridStore.getState().setDimensions('space-1', { rows: 8, columns: 10 });
    usePlantingGridStore.getState().setDimensions('space-2', { rows: 4, columns: 6 });

    expect(usePlantingGridStore.getState().getDimensions('space-1')).toEqual({ rows: 8, columns: 10 });
    expect(usePlantingGridStore.getState().getDimensions('space-2')).toEqual({ rows: 4, columns: 6 });
  });

  it('persists dimensions in localStorage under space-specific key', () => {
    usePlantingGridStore.getState().setDimensions('space-1', { rows: 7, columns: 9 });

    const stored = localStorage.getItem('gardenia:grid-dimensions:space-1');
    expect(stored).toBe(JSON.stringify({ rows: 7, columns: 9 }));
  });

  it('reads initial dimensions from localStorage if present', () => {
    localStorage.setItem('gardenia:grid-dimensions:space-prefilled', JSON.stringify({ rows: 6, columns: 12 }));

    const dims = usePlantingGridStore.getState().getDimensions('space-prefilled');
    expect(dims).toEqual({ rows: 6, columns: 12 });
  });

  it('handles null spaceId with default key', () => {
    usePlantingGridStore.getState().setDimensions(null, { rows: 3, columns: 3 });

    expect(usePlantingGridStore.getState().getDimensions(null)).toEqual({ rows: 3, columns: 3 });
    const stored = localStorage.getItem('gardenia:grid-dimensions:default');
    expect(stored).toBe(JSON.stringify({ rows: 3, columns: 3 }));
  });
});
