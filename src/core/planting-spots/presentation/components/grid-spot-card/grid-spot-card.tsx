'use client';

import { useDraggable } from '@dnd-kit/core';
import { GripVertical, X } from 'lucide-react';
import Link from 'next/link';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import { PlantingSpotTypeBadge } from '@/core/planting-spots/presentation/components/planting-spot-type-badge/planting-spot-type-badge';
import { PlantingSpotStatusBadge } from '@/core/planting-spots/presentation/components/planting-spot-status-badge/planting-spot-status-badge';
import { CapacityBar } from '@/core/planting-spots/presentation/components/capacity-bar/capacity-bar';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

export interface GridSpotCardProps {
  spot: PlantingSpot;
  dict: AppDict['plantingSpots'];
  lang: string;
  onUnassign?: (spot: PlantingSpot) => void;
  isOverlay?: boolean;
}

export function GridSpotCard({
  spot,
  dict,
  lang,
  onUnassign,
  isOverlay = false,
}: GridSpotCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: spot.id,
    data: { spot },
    disabled: isOverlay,
  });

  const plantCount = spot.resolvedPlants?.length ?? 0;
  const hasCapacity = spot.capacity != null;

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col justify-between rounded-xl border border-[var(--rule)] bg-[var(--paper)] p-3 shadow-xs transition-shadow hover:shadow-md ${
        isDragging ? 'opacity-30' : ''
      } ${isOverlay ? 'shadow-lg ring-2 ring-[var(--forest)] rotate-1 cursor-grabbing' : ''}`}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center gap-1 min-w-0">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-[var(--ink)] touch-none p-0.5 rounded-sm"
            aria-label="Drag spot"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-4 w-4 shrink-0" />
          </button>
          <Link
            href={`/${lang}/planting-spots/${spot.id}`}
            className="font-medium text-sm text-[var(--ink)] hover:underline truncate"
          >
            {spot.name}
          </Link>
        </div>

        {onUnassign && !isOverlay && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUnassign(spot);
            }}
            title={dict.layout.unassignSpot}
            aria-label={dict.layout.unassignSpot}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PlantingSpotTypeBadge type={spot.type} dict={dict.types} />
        {spot.status === 'FALLOW' && (
          <PlantingSpotStatusBadge status={spot.status} dict={dict.statuses} />
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-[var(--rule)]">
        {hasCapacity ? (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {plantCount} / {spot.capacity} {dict.list.plants}
              </span>
            </div>
            <CapacityBar current={plantCount} capacity={spot.capacity!} size="sm" />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {plantCount} {dict.list.plants}
          </p>
        )}
      </div>
    </div>
  );
}
