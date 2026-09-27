'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  List,
  LayoutGrid,
  Settings2,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { usePlantingGrid } from '@/core/planting-spots/presentation/hooks/use-planting-grid/use-planting-grid.hook';
import { PlantingGrid } from '@/core/planting-spots/presentation/components/planting-grid/planting-grid';
import { UnassignedSpotsTray } from '@/core/planting-spots/presentation/components/unassigned-spots-tray/unassigned-spots-tray';
import { AssignSpotModal } from '@/core/planting-spots/presentation/components/assign-spot-modal/assign-spot-modal';
import { GridDimensionsDialog } from '@/core/planting-spots/presentation/components/grid-dimensions-dialog/grid-dimensions-dialog';
import { CreatePlantingSpotModal } from '@/core/planting-spots/presentation/components/create-planting-spot-modal/create-planting-spot-modal';
import { PlantingSpotsLayoutSkeleton } from '@/core/planting-spots/presentation/components/planting-spots-layout-skeleton/planting-spots-layout-skeleton';
import { GridSpotCard } from '@/core/planting-spots/presentation/components/grid-spot-card/grid-spot-card';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

export interface PlantingSpotsLayoutScreenProps {
  dict: AppDict['plantingSpots'];
  lang: string;
}

export function PlantingSpotsLayoutScreen({ dict, lang }: PlantingSpotsLayoutScreenProps) {
  const {
    matrix,
    unassignedSpots,
    rows,
    columns,
    minRows,
    minCols,
    isLoading,
    setDimensions,
    assignSpotPosition,
    unassignSpot,
    handleDragEnd,
  } = usePlantingGrid(dict);

  const [activeDragSpot, setActiveDragSpot] = useState<PlantingSpot | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isDimensionsOpen, setIsDimensionsOpen] = useState(false);
  const [assigningCoords, setAssigningCoords] = useState<{ row: number; column: number } | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // DnD sensors: pointer sensor requires 5px movement to distinguish click from drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const spot =
      (event.active.data.current?.spot as PlantingSpot | undefined) ??
      matrix.flat().find((s) => s?.id === event.active.id) ??
      unassignedSpots.find((s) => s.id === event.active.id) ??
      null;
    setActiveDragSpot(spot);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.1).toFixed(1)), 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.1).toFixed(1)), 0.6));
  const handleZoomReset = () => setZoom(1);

  if (isLoading) {
    return <PlantingSpotsLayoutSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ScreenHeader
        title={dict.layout.title}
        subtitle={dict.layout.subtitle}
        breadcrumbs={[
          { label: dict.list.title, href: `/${lang}/planting-spots` },
          { label: dict.layout.title },
        ]}
        actions={
          <div className="flex items-center flex-wrap gap-2">
            {/* View Switcher: List vs Grid */}
            <div className="flex items-center rounded-lg border border-[var(--rule)] bg-[var(--paper)] p-0.5">
              <Link
                href={`/${lang}/planting-spots`}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-[var(--ink)]"
                aria-label={dict.layout.viewList}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{dict.layout.viewList}</span>
              </Link>
              <div
                className="flex items-center gap-1.5 rounded-md bg-[var(--forest-bg)] text-[var(--forest)] px-2.5 py-1 text-xs font-semibold"
                aria-current="page"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{dict.layout.viewGrid}</span>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center rounded-lg border border-[var(--rule)] bg-[var(--paper)] p-0.5 text-xs text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleZoomOut}
                aria-label={dict.layout.zoomOut}
                disabled={zoom <= 0.6}
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <button
                type="button"
                onClick={handleZoomReset}
                title={dict.layout.zoomReset}
                aria-label={dict.layout.zoomReset}
                className="px-1.5 text-[11px] font-mono hover:text-[var(--ink)]"
              >
                {Math.round(zoom * 100)}%
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleZoomIn}
                aria-label={dict.layout.zoomIn}
                disabled={zoom >= 1.5}
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              {zoom !== 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={handleZoomReset}
                  aria-label={dict.layout.zoomReset}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Grid Dimensions Setting */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setIsDimensionsOpen(true)}
              aria-label={dict.layout.gridDimensions}
            >
              <Settings2 className="h-4 w-4" />
              <span className="hidden md:inline">{dict.layout.gridDimensions}</span>
            </Button>

            {/* Create Spot Button */}
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {dict.list.new}
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4">
        {/* Help banner */}
        <p className="text-xs text-muted-foreground">
          {dict.layout.dragHelp}
        </p>

        {/* DnD Context */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={(e) => {
            setActiveDragSpot(null);
            handleDragEnd(e);
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Main Interactive Grid */}
            <div className="lg:col-span-3">
              <PlantingGrid
                matrix={matrix}
                rows={rows}
                columns={columns}
                dict={dict}
                lang={lang}
                zoom={zoom}
                onAssignClick={(row, column) => setAssigningCoords({ row, column })}
                onUnassign={unassignSpot}
              />
            </div>

            {/* Unassigned Spots Tray */}
            <div className="lg:col-span-1">
              <UnassignedSpotsTray
                spots={unassignedSpots}
                dict={dict}
                lang={lang}
              />
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeDragSpot ? (
              <GridSpotCard
                spot={activeDragSpot}
                dict={dict}
                lang={lang}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Grid Dimensions Dialog */}
      {isDimensionsOpen && (
        <GridDimensionsDialog
          rows={rows}
          columns={columns}
          minRows={minRows}
          minCols={minCols}
          dict={dict}
          onSave={(newRows, newCols) => setDimensions(newRows, newCols)}
          onClose={() => setIsDimensionsOpen(false)}
        />
      )}

      {/* Assign Spot Modal */}
      {assigningCoords && (
        <AssignSpotModal
          row={assigningCoords.row}
          column={assigningCoords.column}
          unassignedSpots={unassignedSpots}
          dict={dict}
          lang={lang}
          onSelectSpot={(spot, r, c) => {
            assignSpotPosition(spot, r, c);
            setAssigningCoords(null);
          }}
          onCreateNew={() => {
            setIsCreateOpen(true);
            setAssigningCoords(null);
          }}
          onClose={() => setAssigningCoords(null)}
        />
      )}

      {/* Create Planting Spot Modal */}
      {isCreateOpen && (
        <CreatePlantingSpotModal
          dict={dict}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </div>
  );
}
