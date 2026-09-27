import type { Meta, StoryObj } from '@storybook/react';
import { PlantingSpotsLayoutScreen } from './planting-spots-layout.screen';
import dictEn from '@/core/planting-spots/presentation/i18n/en';

const meta: Meta<typeof PlantingSpotsLayoutScreen> = {
  title: 'Screens/PlantingSpotsLayout',
  component: PlantingSpotsLayoutScreen,
  args: {
    dict: dictEn,
    lang: 'en',
  },
};

export default meta;
type Story = StoryObj<typeof PlantingSpotsLayoutScreen>;

export const Default: Story = {};
