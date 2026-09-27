import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import type { PlantingSpotType } from '@/core/planting-spots/domain/types/planting-spot-type.type';
import dictEn from '@/core/planting-spots/presentation/i18n/en';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock(
  '@/core/planting-spots/presentation/components/planting-spot-type-badge/planting-spot-type-badge',
  () => ({
    PlantingSpotTypeBadge: ({ type }: { type: PlantingSpotType }) => (
      <span data-testid="type-badge">{type}</span>
    ),
  }),
);

import { PlantingSpotCard } from './planting-spot-card';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Main Bed',
  type: 'RAISED_BED',
  description: 'A nice raised bed',
  userId: 'u1',
  spaceId: 's1',
  status: 'ACTIVE',
  fallowSince: null,
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const dict = {
  list: {
    title: 'Planting spots',
    empty: 'No planting spots in this space yet.',
    new: 'New planting spot',
    available: 'Available',
    full: 'Full',
    overCapacity: 'Over capacity',
    plants: 'plants',
    noCapacity: 'No limit',
    viewGrid: 'Grid layout',
    viewList: 'List view',
  },
  form: {
    titleCreate: 'New planting spot',
    titleEdit: 'Edit planting spot',
    name: 'Name',
    type: 'Type',
    description: 'Description (optional)',
    capacity: 'Capacity (optional)',
    capacityHint: 'Leave empty to set no plant limit',
    row: 'Row (optional)',
    column: 'Column (optional)',
    dimensionsWidth: 'Width (optional)',
    dimensionsHeight: 'Height (optional)',
    dimensionsLength: 'Length (optional)',
    soilType: 'Soil type (optional)',
    soilTypePlaceholder: 'e.g. Loamy, Sandy…',
    save: 'Save',
    saving: 'Saving…',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this planting spot?',
    cancel: 'Cancel',
    error: 'Could not save the planting spot. Try again.',
  },
  detail: {
    tabActivePlants: 'Active plants',
    tabRotationHistory: 'Rotation history',
    tabInfo: 'Spot info',
    editSpot: 'Edit spot',
    addPlant: 'Add plant',
    markFallow: 'Mark fallow',
    markActive: 'Reactivate',
    infoStatus: 'Status',
    noActivePlants: 'No plants currently assigned to this spot.',
    rotationHistoryEmpty: 'No rotation history yet.',
    infoCapacity: 'Capacity',
    infoRow: 'Row',
    infoColumn: 'Column',
    infoDimensionsWidth: 'Width',
    infoDimensionsHeight: 'Height',
    infoDimensionsLength: 'Length',
    infoSoilType: 'Soil type',
    infoType: 'Type',
    infoDescription: 'Description',
    noLimit: 'No limit',
    notSet: 'Not set',
    plantsCount: 'plants',
    position: 'Position',
    waterSpot: 'Water entire spot',
    waterSpotConfirmTitle: 'Water all plants in this spot?',
    waterSpotConfirmDescription: 'This will log a watering for every plant currently in this spot.',
    waterSpotConfirm: 'Water',
    waterSpotCancel: 'Cancel',
    waterSpotWatered: 'watered',
    waterSpotFailed: 'failed',
    waterSpotError: 'Could not water the spot. Try again.',
    plantColumn: 'Plant',
    addedColumn: 'Added',
    viewPlant: 'View',
    qr: {
      label: 'Label · QR',
      hint: 'Print and stick on the pot or spot',
      download: 'Download image',
    },
  },
  types: {
    RAISED_BED: 'Raised bed',
    POT: 'Pot',
    CONTAINER: 'Container',
    FIELD_SECTION: 'Field section',
    OTHER: 'Other',
  },
  statuses: {
    ACTIVE: 'Active',
    FALLOW: 'Fallow',
  },
  addPlantModal: {
    title: 'Add plant',
    selectLabel: 'Plant',
    selectPlaceholder: 'Select a plant',
    noPlantsAvailable: 'No plants available to add.',
    submit: 'Add',
    submitting: 'Adding…',
    cancel: 'Cancel',
    error: 'Could not add the plant. Try again.',
  },
  layout: dictEn.layout,
};

describe('PlantingSpotCard', () => {
  it('renders the spot name', () => {
    render(<PlantingSpotCard spot={mockSpot} dict={dict} lang="en" />);
    expect(screen.getByText('Main Bed')).toBeInTheDocument();
  });

  it('renders PlantingSpotTypeBadge', () => {
    render(<PlantingSpotCard spot={mockSpot} dict={dict} lang="en" />);
    expect(screen.getByTestId('type-badge')).toBeInTheDocument();
  });

  it('renders description when present', () => {
    render(<PlantingSpotCard spot={mockSpot} dict={dict} lang="en" />);
    expect(screen.getByText('A nice raised bed')).toBeInTheDocument();
  });

  it('does not render description paragraph when description is null', () => {
    const spotWithoutDesc = { ...mockSpot, description: null };
    render(<PlantingSpotCard spot={spotWithoutDesc} dict={dict} lang="en" />);
    expect(screen.queryByText('A nice raised bed')).not.toBeInTheDocument();
  });

  it('renders a link to the detail page', () => {
    render(<PlantingSpotCard spot={mockSpot} dict={dict} lang="en" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/en/planting-spots/spot-1');
  });

  describe('capacity display', () => {
    it('shows available badge when plants < capacity', () => {
      const spot = { ...mockSpot, capacity: 5, resolvedPlants: [
        { id: 'p1', name: 'Tomato', userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ]};
      render(<PlantingSpotCard spot={spot} dict={dict} lang="en" />);
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('1 / 5 plants')).toBeInTheDocument();
    });

    it('shows full badge when plants === capacity', () => {
      const spot = { ...mockSpot, capacity: 2, resolvedPlants: [
        { id: 'p1', name: 'T1', userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'p2', name: 'T2', userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ]};
      render(<PlantingSpotCard spot={spot} dict={dict} lang="en" />);
      expect(screen.getByText('Full')).toBeInTheDocument();
    });

    it('shows over capacity badge when plants > capacity', () => {
      const spot = { ...mockSpot, capacity: 1, resolvedPlants: [
        { id: 'p1', name: 'T1', userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'p2', name: 'T2', userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ]};
      render(<PlantingSpotCard spot={spot} dict={dict} lang="en" />);
      expect(screen.getByText('Over capacity')).toBeInTheDocument();
    });

    it('shows plant count without capacity bar when no capacity and plants > 0', () => {
      const spot = { ...mockSpot, capacity: null, resolvedPlants: [
        { id: 'p1', name: 'T1', userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ]};
      render(<PlantingSpotCard spot={spot} dict={dict} lang="en" />);
      expect(screen.getByText('1 plants')).toBeInTheDocument();
    });

    it('shows nothing for capacity when no capacity and no plants', () => {
      const spot = { ...mockSpot, capacity: null, resolvedPlants: [] };
      const { container } = render(<PlantingSpotCard spot={spot} dict={dict} lang="en" />);
      expect(container.querySelector('.h-1\\.5')).not.toBeInTheDocument();
    });
  });

  describe('position display', () => {
    it('shows row and column when both are set', () => {
      const spot = { ...mockSpot, row: 2, column: 3 };
      render(<PlantingSpotCard spot={spot} dict={dict} lang="en" />);
      expect(screen.getByText('F2 · C3')).toBeInTheDocument();
    });

    it('shows only row when column is null', () => {
      const spot = { ...mockSpot, row: 1, column: null };
      render(<PlantingSpotCard spot={spot} dict={dict} lang="en" />);
      expect(screen.getByText('F1')).toBeInTheDocument();
    });

    it('shows only column when row is null', () => {
      const spot = { ...mockSpot, row: null, column: 5 };
      render(<PlantingSpotCard spot={spot} dict={dict} lang="en" />);
      expect(screen.getByText('C5')).toBeInTheDocument();
    });

    it('does not show position when both row and column are null', () => {
      const spot = { ...mockSpot, row: null, column: null };
      render(<PlantingSpotCard spot={spot} dict={dict} lang="en" />);
      expect(screen.queryByText(/F\d|C\d/)).not.toBeInTheDocument();
    });
  });

  describe('CapacityBar', () => {
    it('renders over-capacity bar class when current > capacity', () => {
      const spot = { ...mockSpot, capacity: 1, resolvedPlants: [
        { id: 'p1', name: 'T1', userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'p2', name: 'T2', userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ]};
      const { container } = render(<PlantingSpotCard spot={spot} dict={dict} lang="en" />);
      expect(container.querySelector('.bg-destructive')).toBeInTheDocument();
    });

    it('renders orange bar class when current === capacity', () => {
      const spot = { ...mockSpot, capacity: 2, resolvedPlants: [
        { id: 'p1', name: 'T1', userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'p2', name: 'T2', userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ]};
      const { container } = render(<PlantingSpotCard spot={spot} dict={dict} lang="en" />);
      expect(container.querySelector('.bg-orange-400')).toBeInTheDocument();
    });
  });
});
