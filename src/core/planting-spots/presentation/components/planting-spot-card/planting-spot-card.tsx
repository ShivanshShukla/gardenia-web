"use client";

import type { PlantingSpot } from "@/core/planting-spots/domain/interfaces/planting-spot.interface";
import { PlantingSpotTypeBadge } from "@/core/planting-spots/presentation/components/planting-spot-type-badge/planting-spot-type-badge";
import { PlantingSpotStatusBadge } from "@/core/planting-spots/presentation/components/planting-spot-status-badge/planting-spot-status-badge";
import { CapacityBar } from "@/core/planting-spots/presentation/components/capacity-bar/capacity-bar";
import { getPlantingSpotPositionLabel } from "@/core/planting-spots/presentation/utils/get-planting-spot-position-label/get-planting-spot-position-label.util";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/presentation/components/ui/card/card";
import Link from "next/link";
import type { AppDict } from "@/shared/presentation/i18n/get-dictionary";

type Props = {
  spot: PlantingSpot;
  dict: AppDict['plantingSpots'];
  lang: string;
};

function CapacityBadge({ current, capacity, dict }: { current: number; capacity: number; dict: AppDict['plantingSpots'] }) {
  if (current > capacity) {
    return (
      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
        {dict.list.overCapacity}
      </span>
    );
  }
  if (current >= capacity) {
    return (
      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
        {dict.list.full}
      </span>
    );
  }
  return (
    <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-[var(--forest)]/10 text-[var(--forest)]">
      {dict.list.available}
    </span>
  );
}

export function PlantingSpotCard({ spot, dict, lang }: Props) {
  const plantCount = spot.resolvedPlants?.length ?? 0;
  const hasCapacity = spot.capacity != null;
  const positionLabel = getPlantingSpotPositionLabel(spot);

  return (
    <Link href={`/${lang}/planting-spots/${spot.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">{spot.name}</CardTitle>
            <div className="flex items-center gap-1.5">
              {spot.status === 'FALLOW' && (
                <PlantingSpotStatusBadge status={spot.status} dict={dict.statuses} />
              )}
              <PlantingSpotTypeBadge type={spot.type} dict={dict.types} />
            </div>
          </div>

          {/* Position badge */}
          {positionLabel && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {positionLabel}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0 flex flex-col gap-2">
          {spot.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {spot.description}
            </p>
          )}

          {/* Capacity section */}
          {hasCapacity ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {plantCount} / {spot.capacity} {dict.list.plants}
                </span>
                <CapacityBadge
                  current={plantCount}
                  capacity={spot.capacity!}
                  dict={dict}
                />
              </div>
              <CapacityBar current={plantCount} capacity={spot.capacity!} size="sm" />
            </div>
          ) : plantCount > 0 ? (
            <p className="text-xs text-muted-foreground">
              {plantCount} {dict.list.plants}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
