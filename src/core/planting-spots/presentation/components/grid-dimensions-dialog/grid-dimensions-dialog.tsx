'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/presentation/components/ui/dialog/dialog';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Input } from '@/shared/presentation/components/ui/input/input';
import { Label } from '@/shared/presentation/components/ui/label/label';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

export interface GridDimensionsDialogProps {
  rows: number;
  columns: number;
  minRows: number;
  minCols: number;
  dict: AppDict['plantingSpots'];
  onSave: (rows: number, columns: number) => void;
  onClose: () => void;
}

export function GridDimensionsDialog({
  rows: initialRows,
  columns: initialColumns,
  minRows,
  minCols,
  dict,
  onSave,
  onClose,
}: GridDimensionsDialogProps) {
  const [rows, setRows] = useState(initialRows);
  const [columns, setColumns] = useState(initialColumns);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clampedRows = Math.max(rows, minRows);
    const clampedCols = Math.max(columns, minCols);
    onSave(clampedRows, clampedCols);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-xs">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{dict.layout.gridDimensions}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grid-rows" className="text-right">
                {dict.layout.rows}
              </Label>
              <Input
                id="grid-rows"
                type="number"
                min={minRows}
                max={50}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value) || minRows)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grid-columns" className="text-right">
                {dict.layout.columns}
              </Label>
              <Input
                id="grid-columns"
                type="number"
                min={minCols}
                max={50}
                value={columns}
                onChange={(e) => setColumns(Number(e.target.value) || minCols)}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {dict.form.cancel}
            </Button>
            <Button type="submit">
              {dict.layout.saveDimensions}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
