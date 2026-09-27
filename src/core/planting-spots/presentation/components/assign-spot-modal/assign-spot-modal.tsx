'use client';

import { Plus } from 'lucide-react';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import { PlantingSpotTypeBadge } from '@/core/planting-spots/presentation/components/planting-spot-type-badge/planting-spot-type-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/presentation/components/ui/dialog/dialog';
import { Button } from '@/shared/presentation/components/ui/button/button';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

export interface AssignSpotModalProps {
  row: number;
  column: number;
  unassignedSpots: PlantingSpot[];
  dict: AppDict['plantingSpots'];
  lang: string;
  onSelectSpot: (spot: PlantingSpot, row: number, column: number) => void;
  onCreateNew: (row: number, column: number) => void;
  onClose: () => void;
}

export function AssignSpotModal({
  row,
  column,
  unassignedSpots,
  dict,
  onSelectSpot,
  onCreateNew,
  onClose,
}: AssignSpotModalProps) {
  const subtitle = dict.layout.assignModalSubtitle
    ? dict.layout.assignModalSubtitle.replace('{row}', String(row)).replace('{column}', String(column))
    : `Row ${row} · Column ${column}`;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.layout.assignModalTitle}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 mb-4 border-dashed border-[var(--forest)] text-[var(--forest)] hover:bg-[var(--forest-bg)]"
            onClick={() => {
              onClose();
              onCreateNew(row, column);
            }}
          >
            <Plus className="h-4 w-4" />
            {dict.layout.createNewSpotHere}
          </Button>

          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {dict.layout.unassignedTitle}
          </div>

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {unassignedSpots.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                {dict.layout.unassignedEmpty}
              </p>
            ) : (
              unassignedSpots.map((spot) => (
                <div
                  key={spot.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--rule)] bg-[var(--paper)] p-3 transition-colors hover:bg-[var(--paper-subtle)]"
                >
                  <div className="flex flex-col gap-1 min-w-0 pr-2">
                    <span className="font-medium text-sm text-[var(--ink)] truncate">
                      {spot.name}
                    </span>
                    <div>
                      <PlantingSpotTypeBadge type={spot.type} dict={dict.types} />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      onSelectSpot(spot, row, column);
                      onClose();
                    }}
                  >
                    {dict.layout.assignSpotButton}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {dict.form.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
