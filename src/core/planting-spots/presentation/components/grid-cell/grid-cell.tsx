'use client';

import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import { GridSpotCard } from '@/core/planting-spots/presentation/components/grid-spot-card/grid-spot-card';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

export interface GridCellProps {
  row: number;
  column: number;
  spot: PlantingSpot | null;
  dict: AppDict['plantingSpots'];
  lang: string;
  onAssignClick?: (row: number, column: number) => void;
  onUnassign?: (spot: PlantingSpot) => void;
}

export function GridCell({
  row,
  column,
  spot,
  dict,
  lang,
  onAssignClick,
  onUnassign,
}: GridCellProps) {
  const cellId = `cell-${row}-${column}`;
  const { isOver, setNodeRef } = useDroppable({
    id: cellId,
    data: { row, column, spot },
  });

  const coordLabel = dict.layout.cellCoordinate
    ? dict.layout.cellCoordinate.replace('{row}', String(row)).replace('{column}', String(column))
    : `R${row} · C${column}`;

  return (
    <div
      ref={setNodeRef}
      data-testid={`grid-cell-${row}-${column}`}
      className={`relative min-h-[140px] w-full min-w-[160px] rounded-xl transition-all duration-150 ${
        isOver
          ? 'ring-2 ring-[var(--forest)] bg-[var(--forest-bg)]/40 scale-[1.02]'
          : ''
      }`}
    >
      {spot ? (
        <GridSpotCard
          spot={spot}
          dict={dict}
          lang={lang}
          onUnassign={onUnassign}
        />
      ) : (
        <button
          type="button"
          onClick={() => onAssignClick?.(row, column)}
          aria-label={`${dict.layout.clickToAssign} (${coordLabel})`}
          className="group flex h-full min-h-[140px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--rule)] bg-[var(--paper)]/50 p-4 text-center transition-all hover:border-[var(--forest)] hover:bg-[var(--forest-bg)]/20"
        >
          <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/60 mb-2">
            {coordLabel}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-all group-hover:scale-110 group-hover:bg-[var(--forest)] group-hover:text-white">
            <Plus className="h-4 w-4" />
          </div>
          <span className="mt-2 text-xs font-medium text-muted-foreground group-hover:text-[var(--ink)]">
            {dict.layout.emptyCell}
          </span>
        </button>
      )}
    </div>
  );
}
