import type { Meta, StoryObj } from '@storybook/react';
import { GridCell } from './grid-cell';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import dictEn from '@/core/planting-spots/presentation/i18n/en';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Bancal Tomates',
  type: 'RAISED_BED',
  status: 'ACTIVE',
  capacity: 8,
  row: 1,
  column: 1,
  userId: 'u1',
  spaceId: 's1',
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const meta: Meta<typeof GridCell> = {
  title: 'PlantingSpots/GridCell',
  component: GridCell,
  args: {
    row: 1,
    column: 1,
    dict: dictEn,
    lang: 'en',
  },
};

export default meta;
type Story = StoryObj<typeof GridCell>;

export const Empty: Story = {
  args: {
    spot: null,
  },
};

export const Occupied: Story = {
  args: {
    spot: mockSpot,
  },
};
