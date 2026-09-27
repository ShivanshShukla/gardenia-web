import type { Meta, StoryObj } from '@storybook/react';
import { GridSpotCard } from './grid-spot-card';
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
  resolvedPlants: [
    { id: 'p1', name: 'Cherry Tomato', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
    { id: 'p2', name: 'Roma Tomato', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
  ],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const meta: Meta<typeof GridSpotCard> = {
  title: 'PlantingSpots/GridSpotCard',
  component: GridSpotCard,
  args: {
    spot: mockSpot,
    dict: dictEn,
    lang: 'en',
  },
};

export default meta;
type Story = StoryObj<typeof GridSpotCard>;

export const Default: Story = {};

export const Fallow: Story = {
  args: {
    spot: {
      ...mockSpot,
      status: 'FALLOW',
      resolvedPlants: [],
    },
  },
};

export const OverCapacity: Story = {
  args: {
    spot: {
      ...mockSpot,
      capacity: 2,
      resolvedPlants: [
        { id: 'p1', name: 'P1', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
        { id: 'p2', name: 'P2', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
        { id: 'p3', name: 'P3', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
      ],
    },
  },
};
