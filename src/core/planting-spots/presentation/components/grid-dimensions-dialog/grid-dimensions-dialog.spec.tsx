import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import dictEn from '@/core/planting-spots/presentation/i18n/en';
import { GridDimensionsDialog } from './grid-dimensions-dialog';

describe('GridDimensionsDialog', () => {
  it('renders rows and columns with current values', () => {
    render(
      <GridDimensionsDialog
        rows={5}
        columns={6}
        minRows={3}
        minCols={4}
        dict={dictEn}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Grid dimensions')).toBeInTheDocument();
    expect(screen.getByLabelText('Rows')).toHaveValue(5);
    expect(screen.getByLabelText('Columns')).toHaveValue(6);
  });

  it('calls onSave with updated values when submitted', () => {
    const handleSave = vi.fn();
    render(
      <GridDimensionsDialog
        rows={5}
        columns={6}
        minRows={3}
        minCols={4}
        dict={dictEn}
        onSave={handleSave}
        onClose={vi.fn()}
      />,
    );

    const rowsInput = screen.getByLabelText('Rows');
    fireEvent.change(rowsInput, { target: { value: '8' } });

    const saveBtn = screen.getByRole('button', { name: 'Apply dimensions' });
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledWith(8, 6);
  });

  it('prevents saving values lower than minRows or minCols', () => {
    const handleSave = vi.fn();
    render(
      <GridDimensionsDialog
        rows={5}
        columns={6}
        minRows={5}
        minCols={4}
        dict={dictEn}
        onSave={handleSave}
        onClose={vi.fn()}
      />,
    );

    const rowsInput = screen.getByLabelText('Rows');
    fireEvent.change(rowsInput, { target: { value: '3' } });

    const saveBtn = screen.getByRole('button', { name: 'Apply dimensions' });
    fireEvent.click(saveBtn);

    // Should clamp to minRows (5)
    expect(handleSave).toHaveBeenCalledWith(5, 6);
  });
});
