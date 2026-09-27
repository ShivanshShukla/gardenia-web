import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import dictEn from '@/core/planting-spots/presentation/i18n/en';

vi.mock('@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook', () => ({
  usePlantingSpots: vi.fn(),
}));

vi.mock('@/core/planting-spots/presentation/components/planting-spot-card/planting-spot-card', () => ({
  PlantingSpotCard: ({ spot }: { spot: PlantingSpot }) => (
    <div data-testid="spot-card">{spot.name}</div>
  ),
}));

vi.mock('@/core/planting-spots/presentation/components/create-planting-spot-modal/create-planting-spot-modal', () => ({
  CreatePlantingSpotModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="create-planting-spot-modal">
      <button onClick={onClose}>Close modal</button>
    </div>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

import { usePlantingSpots } from '@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook';
import { PlantingSpotsListScreen } from './planting-spots-list.screen';

const mockSpots: PlantingSpot[] = [
  {
    id: 'spot-1',
    name: 'Main Bed',
    type: 'RAISED_BED',
    description: null,
    userId: 'u1',
    spaceId: 's1',
    status: 'ACTIVE',
    fallowSince: null,
    resolvedPlants: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'spot-2',
    name: 'Herb Pot',
    type: 'POT',
    description: 'Basil and mint',
    userId: 'u1',
    spaceId: 's1',
    status: 'ACTIVE',
    fallowSince: null,
    resolvedPlants: [],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
];

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
    deleteConfirm: 'Are you sure?',
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

describe('PlantingSpotsListScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title from dict', () => {
    vi.mocked(usePlantingSpots).mockReturnValue({ spots: [], total: 0, totalPages: 1, currentPage: 1, isLoading: false, error: null });

    render(<PlantingSpotsListScreen dict={dict} lang="en" />);

    expect(screen.getByText('Planting spots')).toBeInTheDocument();
  });

  it('renders skeleton grid when loading', () => {
    vi.mocked(usePlantingSpots).mockReturnValue({ spots: [], total: 0, totalPages: 1, currentPage: 1, isLoading: true, error: null });

    const { container } = render(<PlantingSpotsListScreen dict={dict} lang="en" />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty state message when no spots', () => {
    vi.mocked(usePlantingSpots).mockReturnValue({ spots: [], total: 0, totalPages: 1, currentPage: 1, isLoading: false, error: null });

    render(<PlantingSpotsListScreen dict={dict} lang="en" />);

    expect(screen.getByText('No planting spots in this space yet.')).toBeInTheDocument();
  });

  it('renders one PlantingSpotCard per spot', () => {
    vi.mocked(usePlantingSpots).mockReturnValue({ spots: mockSpots, total: 2, totalPages: 1, currentPage: 1, isLoading: false, error: null });

    render(<PlantingSpotsListScreen dict={dict} lang="en" />);

    expect(screen.getAllByTestId('spot-card')).toHaveLength(2);
    expect(screen.getByText('Main Bed')).toBeInTheDocument();
    expect(screen.getByText('Herb Pot')).toBeInTheDocument();
  });

  it('does not render the create modal by default', () => {
    vi.mocked(usePlantingSpots).mockReturnValue({ spots: [], total: 0, totalPages: 1, currentPage: 1, isLoading: false, error: null });

    render(<PlantingSpotsListScreen dict={dict} lang="en" />);

    expect(screen.queryByTestId('create-planting-spot-modal')).not.toBeInTheDocument();
  });

  it('opens the create modal when "New planting spot" button is clicked', () => {
    vi.mocked(usePlantingSpots).mockReturnValue({ spots: [], total: 0, totalPages: 1, currentPage: 1, isLoading: false, error: null });

    render(<PlantingSpotsListScreen dict={dict} lang="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'New planting spot' }));

    expect(screen.getByTestId('create-planting-spot-modal')).toBeInTheDocument();
  });

  it('closes the create modal when it calls onClose', () => {
    vi.mocked(usePlantingSpots).mockReturnValue({ spots: [], total: 0, totalPages: 1, currentPage: 1, isLoading: false, error: null });

    render(<PlantingSpotsListScreen dict={dict} lang="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'New planting spot' }));
    fireEvent.click(screen.getByText('Close modal'));

    expect(screen.queryByTestId('create-planting-spot-modal')).not.toBeInTheDocument();
  });

  it('renders link to layout view', () => {
    vi.mocked(usePlantingSpots).mockReturnValue({ spots: [], total: 0, totalPages: 1, currentPage: 1, isLoading: false, error: null });

    render(<PlantingSpotsListScreen dict={dict} lang="en" />);

    const layoutLink = screen.getByRole('link', { name: 'Grid layout' });
    expect(layoutLink).toHaveAttribute('href', '/en/planting-spots/layout');
  });
});
