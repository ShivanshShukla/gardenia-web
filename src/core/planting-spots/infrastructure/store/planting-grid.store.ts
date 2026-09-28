import { create } from 'zustand';

export interface GridDimensions {
  rows: number;
  columns: number;
}

export interface PlantingGridStoreState {
  dimensionsBySpace: Record<string, GridDimensions>;
  setDimensions: (spaceId: string | null, dimensions: GridDimensions) => void;
  getDimensions: (spaceId: string | null) => GridDimensions;
  clear: () => void;
}

export const DEFAULT_GRID_DIMENSIONS: GridDimensions = { rows: 5, columns: 5 };

const getStorageKey = (spaceId: string | null) =>
  `gardenia:grid-dimensions:${spaceId ?? 'default'}`;

function readStoredDimensions(spaceId: string | null): GridDimensions {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(getStorageKey(spaceId));
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed?.rows === 'number' && typeof parsed?.columns === 'number') {
          return { rows: parsed.rows, columns: parsed.columns };
        }
      }
    } catch {
      // Fallback
    }
  }
  return DEFAULT_GRID_DIMENSIONS;
}

export const usePlantingGridStore = create<PlantingGridStoreState>()((set, get) => ({
  dimensionsBySpace: {},

  getDimensions: (spaceId) => {
    const key = spaceId ?? 'default';
    const current = get().dimensionsBySpace[key];
    if (current) return current;
    const stored = readStoredDimensions(spaceId);
    return stored;
  },

  setDimensions: (spaceId, dimensions) => {
    const key = spaceId ?? 'default';
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(getStorageKey(spaceId), JSON.stringify(dimensions));
      } catch {
        // Ignore storage write error
      }
    }
    set((state) => ({
      dimensionsBySpace: {
        ...state.dimensionsBySpace,
        [key]: dimensions,
      },
    }));
  },

  clear: () => set({ dimensionsBySpace: {} }),
}));
