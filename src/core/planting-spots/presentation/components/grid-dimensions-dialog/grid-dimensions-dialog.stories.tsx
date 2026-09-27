import type { Meta, StoryObj } from '@storybook/react';
import { GridDimensionsDialog } from './grid-dimensions-dialog';
import dictEn from '@/core/planting-spots/presentation/i18n/en';

const meta: Meta<typeof GridDimensionsDialog> = {
  title: 'PlantingSpots/GridDimensionsDialog',
  component: GridDimensionsDialog,
  args: {
    rows: 5,
    columns: 5,
    minRows: 3,
    minCols: 3,
    dict: dictEn,
    onSave: () => {},
    onClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof GridDimensionsDialog>;

export const Default: Story = {};
