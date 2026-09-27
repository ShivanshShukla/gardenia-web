import type { Meta, StoryObj } from '@storybook/react';
import { UnassignedSpotsTray } from './unassigned-spots-tray';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import dictEn from '@/core/planting-spots/presentation/i18n/en';

const mockSpot: PlantingSpot = {
  id: 'spot-u1',
  name: 'Maceta Pimientos',
  type: 'POT',
  status: 'ACTIVE',
  capacity: 3,
  row: null,
  column: null,
  userId: 'u1',
  spaceId: 's1',
  resolvedPlants: [],
  createdAt: '',
  updatedAt: '',
};

const meta: Meta<typeof UnassignedSpotsTray> = {
  title: 'PlantingSpots/UnassignedSpotsTray',
  component: UnassignedSpotsTray,
  args: {
    dict: dictEn,
    lang: 'en',
  },
};

export default meta;
type Story = StoryObj<typeof UnassignedSpotsTray>;

export const Empty: Story = {
  args: {
    spots: [],
  },
};

export const WithSpots: Story = {
  args: {
    spots: [mockSpot],
  },
};
