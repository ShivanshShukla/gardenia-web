'use client';

import { useDroppable } from '@dnd-kit/core';
import { Layers } from 'lucide-react';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import { GridSpotCard } from '@/core/planting-spots/presentation/components/grid-spot-card/grid-spot-card';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

export interface UnassignedSpotsTrayProps {
  spots: PlantingSpot[];
  dict: AppDict['plantingSpots'];
  lang: string;
}

export function UnassignedSpotsTray({ spots, dict, lang }: UnassignedSpotsTrayProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'unassigned-tray',
    data: { type: 'unassigned' },
  });

  return (
    <aside
      ref={setNodeRef}
      data-testid="unassigned-spots-tray"
      className={`flex flex-col rounded-xl border border-[var(--rule)] bg-[var(--paper)] p-4 shadow-2xs transition-all ${
        isOver ? 'ring-2 ring-[var(--forest)] bg-[var(--forest-bg)]/20' : ''
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[var(--forest)]" />
          <h2 className="font-semibold text-sm text-[var(--ink)]">
            {dict.layout.unassignedTitle}
          </h2>
        </div>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
          {spots.length}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2.5 overflow-y-auto max-h-[500px]">
        {spots.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            {dict.layout.unassignedEmpty}
          </p>
        ) : (
          spots.map((spot) => (
            <GridSpotCard
              key={spot.id}
              spot={spot}
              dict={dict}
              lang={lang}
            />
          ))
        )}
      </div>
    </aside>
  );
}
