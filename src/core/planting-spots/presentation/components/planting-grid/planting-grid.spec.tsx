import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import dictEn from '@/core/planting-spots/presentation/i18n/en';
import dictEs from '@/core/planting-spots/presentation/i18n/es';
import { PlantingGrid } from './planting-grid';

describe('PlantingGrid', () => {
  it('renders all grid cells matching matrix dimensions', () => {
    const matrix: (PlantingSpot | null)[][] = [
      [null, null],
      [null, null],
    ];

    render(
      <PlantingGrid
        matrix={matrix}
        rows={2}
        columns={2}
        dict={dictEn}
        lang="en"
      />,
    );

    expect(screen.getByTestId('grid-cell-1-1')).toBeInTheDocument();
    expect(screen.getByTestId('grid-cell-1-2')).toBeInTheDocument();
    expect(screen.getByTestId('grid-cell-2-1')).toBeInTheDocument();
    expect(screen.getByTestId('grid-cell-2-2')).toBeInTheDocument();
  });

  it('renders row and column header labels', () => {
    const matrix = [[null, null]];
    render(
      <PlantingGrid
        matrix={matrix}
        rows={1}
        columns={2}
        dict={dictEn}
        lang="en"
      />,
    );

    expect(screen.getByText('Col 1')).toBeInTheDocument();
    expect(screen.getByText('Col 2')).toBeInTheDocument();
    expect(screen.getByText('Row 1')).toBeInTheDocument();
  });

  it('renders localized row and column headers in Spanish', () => {
    const matrix = [[null]];
    render(
      <PlantingGrid
        matrix={matrix}
        rows={1}
        columns={1}
        dict={dictEs}
        lang="es"
      />,
    );

    expect(screen.getByText('Col. 1')).toBeInTheDocument();
    expect(screen.getByText('Fila 1')).toBeInTheDocument();
  });
});
