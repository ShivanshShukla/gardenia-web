import type { Meta, StoryObj } from '@storybook/react';
import { PlantingSpotsLayoutSkeleton } from './planting-spots-layout-skeleton';

const meta: Meta<typeof PlantingSpotsLayoutSkeleton> = {
  title: 'PlantingSpots/PlantingSpotsLayoutSkeleton',
  component: PlantingSpotsLayoutSkeleton,
};

export default meta;
type Story = StoryObj<typeof PlantingSpotsLayoutSkeleton>;

export const Default: Story = {};
