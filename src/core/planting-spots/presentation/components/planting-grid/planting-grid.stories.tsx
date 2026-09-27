import type { Meta, StoryObj } from '@storybook/react';
import { PlantingGrid } from './planting-grid';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import dictEn from '@/core/planting-spots/presentation/i18n/en';

const mockSpots: PlantingSpot[] = [
  {
    id: 'spot-1',
    name: 'Bancal Tomates',
    type: 'RAISED_BED',
    status: 'ACTIVE',
    capacity: 6,
    row: 1,
    column: 1,
    userId: 'u1',
    spaceId: 's1',
    resolvedPlants: [],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'spot-2',
    name: 'Maceta Albahaca',
    type: 'POT',
    status: 'ACTIVE',
    capacity: 2,
    row: 2,
    column: 3,
    userId: 'u1',
    spaceId: 's1',
    resolvedPlants: [],
    createdAt: '',
    updatedAt: '',
  },
];

const matrix: (PlantingSpot | null)[][] = [
  [mockSpots[0], null, null, null],
  [null, null, mockSpots[1], null],
  [null, null, null, null],
];

const meta: Meta<typeof PlantingGrid> = {
  title: 'PlantingSpots/PlantingGrid',
  component: PlantingGrid,
  args: {
    matrix,
    rows: 3,
    columns: 4,
    dict: dictEn,
    lang: 'en',
    zoom: 1,
  },
};

export default meta;
type Story = StoryObj<typeof PlantingGrid>;

export const Default: Story = {};

export const ZoomedOut: Story = {
  args: {
    zoom: 0.8,
  },
};
