import type { Meta, StoryObj } from '@storybook/react';
import { AssignSpotModal } from './assign-spot-modal';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import dictEn from '@/core/planting-spots/presentation/i18n/en';

const mockSpots: PlantingSpot[] = [
  {
    id: 'spot-1',
    name: 'Maceta Menta',
    type: 'POT',
    status: 'ACTIVE',
    row: null,
    column: null,
    userId: 'u1',
    spaceId: 's1',
    resolvedPlants: [],
    createdAt: '',
    updatedAt: '',
  },
];

const meta: Meta<typeof AssignSpotModal> = {
  title: 'PlantingSpots/AssignSpotModal',
  component: AssignSpotModal,
  args: {
    row: 1,
    column: 2,
    unassignedSpots: mockSpots,
    dict: dictEn,
    lang: 'en',
    onSelectSpot: () => {},
    onCreateNew: () => {},
    onClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AssignSpotModal>;

export const Default: Story = {};

export const NoUnassignedSpots: Story = {
  args: {
    unassignedSpots: [],
  },
};
