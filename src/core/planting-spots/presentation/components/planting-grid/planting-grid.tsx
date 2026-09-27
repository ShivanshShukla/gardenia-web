'use client';

import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import { GridCell } from '@/core/planting-spots/presentation/components/grid-cell/grid-cell';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

export interface PlantingGridProps {
  matrix: (PlantingSpot | null)[][];
  rows: number;
  columns: number;
  dict: AppDict['plantingSpots'];
  lang: string;
  zoom?: number;
  onAssignClick?: (row: number, column: number) => void;
  onUnassign?: (spot: PlantingSpot) => void;
}

export function PlantingGrid({
  matrix,
  rows,
  columns,
  dict,
  lang,
  zoom = 1,
  onAssignClick,
  onUnassign,
}: PlantingGridProps) {
  const colHeaders = Array.from({ length: columns }, (_, i) => i + 1);
  const rowHeaders = Array.from({ length: rows }, (_, i) => i + 1);

  return (
    <div className="relative w-full overflow-auto rounded-xl border border-[var(--rule)] bg-[var(--paper-subtle)] p-4 shadow-2xs">
      <div
        className="transition-transform duration-150 inline-block min-w-full"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          width: zoom !== 1 ? `${(1 / zoom) * 100}%` : '100%',
        }}
      >
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `auto repeat(${columns}, minmax(180px, 1fr))`,
          }}
        >
          {/* Top-left corner spacer */}
          <div className="h-7 w-12" aria-hidden="true" />

          {/* Column headers */}
          {colHeaders.map((col) => (
            <div
              key={`header-col-${col}`}
              className="flex h-7 items-center justify-center rounded-md bg-muted/40 text-[11px] font-semibold text-muted-foreground"
            >
              Col {col}
            </div>
          ))}

          {/* Rows */}
          {rowHeaders.map((row) => (
            <div key={`row-group-${row}`} className="contents">
              {/* Row header */}
              <div className="flex w-12 items-center justify-center rounded-md bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                Row {row}
              </div>

              {/* Grid cells in row */}
              {colHeaders.map((col) => {
                const spot = matrix[row - 1]?.[col - 1] ?? null;
                return (
                  <GridCell
                    key={`cell-${row}-${col}`}
                    row={row}
                    column={col}
                    spot={spot}
                    dict={dict}
                    lang={lang}
                    onAssignClick={onAssignClick}
                    onUnassign={onUnassign}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
