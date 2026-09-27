import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import type { WaterPlantingSpotResult } from '@/core/planting-spots/domain/interfaces/water-planting-spot-result.interface';
import dictEn from '@/core/planting-spots/presentation/i18n/en';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock(
  '@/core/planting-spots/presentation/hooks/use-planting-spot/use-planting-spot.hook',
  () => ({ usePlantingSpot: vi.fn() }),
);

vi.mock(
  '@/core/planting-spots/presentation/hooks/use-planting-spot-status-toggle/use-planting-spot-status-toggle.hook',
  () => ({ usePlantingSpotStatusToggle: vi.fn() }),
);

vi.mock(
  '@/core/planting-spots/presentation/hooks/use-water-planting-spot/use-water-planting-spot.hook',
  () => ({ useWaterPlantingSpot: vi.fn() }),
);

const mockDeleteMutate = vi.fn();
vi.mock(
  '@/core/planting-spots/presentation/hooks/use-delete-planting-spot/use-delete-planting-spot.hook',
  () => ({ useDeletePlantingSpot: () => ({ mutate: mockDeleteMutate, isPending: false }) }),
);

const mockQrDownload = vi.fn();
vi.mock('@/shared/presentation/hooks/use-qr-download/use-qr-download.hook', () => ({
  useQrDownload: () => ({ download: mockQrDownload }),
}));

vi.mock(
  '@/core/planting-spots/presentation/components/planting-spot-type-badge/planting-spot-type-badge',
  () => ({
    PlantingSpotTypeBadge: ({ type }: { type: string }) => (
      <span data-testid="type-badge">{type}</span>
    ),
  }),
);

vi.mock(
  '@/core/planting-spots/presentation/components/planting-spot-status-badge/planting-spot-status-badge',
  () => ({
    PlantingSpotStatusBadge: ({ status }: { status: string }) => (
      <span data-testid="status-badge">{status}</span>
    ),
  }),
);

vi.mock(
  '@/core/planting-spots/presentation/components/add-plant-to-spot-modal/add-plant-to-spot-modal',
  () => ({
    AddPlantToSpotModal: ({ onClose }: { onClose: () => void }) => (
      <div data-testid="add-plant-modal">
        <button onClick={onClose}>close-add-plant-modal</button>
      </div>
    ),
  }),
);

vi.mock(
  '@/core/planting-spots/presentation/components/edit-planting-spot-modal/edit-planting-spot-modal',
  () => ({
    EditPlantingSpotModal: ({ onClose }: { onClose: () => void }) => (
      <div data-testid="edit-spot-modal">
        <button onClick={onClose}>close-edit-spot-modal</button>
      </div>
    ),
  }),
);

vi.mock('@/shared/presentation/components/ui/tabs/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div role="tablist">{children}</div>,
  TabsTrigger: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <button role="tab" data-value={value}>{children}</button>
  ),
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { usePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-planting-spot/use-planting-spot.hook';
import { usePlantingSpotStatusToggle } from '@/core/planting-spots/presentation/hooks/use-planting-spot-status-toggle/use-planting-spot-status-toggle.hook';
import { useWaterPlantingSpot } from '@/core/planting-spots/presentation/hooks/use-water-planting-spot/use-water-planting-spot.hook';
import { PlantingSpotDetailScreen } from './planting-spot-detail.screen';

const dict = {
  list: {
    title: 'Planting spots',
    empty: 'No planting spots.',
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

const baseSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Main Bed',
  type: 'RAISED_BED',
  description: null,
  capacity: null,
  row: null,
  column: null,
  dimensionsWidth: null,
  dimensionsHeight: null,
  dimensionsLength: null,
  soilType: null,
  userId: 'u1',
  spaceId: 's1',
  status: 'ACTIVE',
  fallowSince: null,
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

function mockLoading() {
  vi.mocked(usePlantingSpot).mockReturnValue({ spot: null, isLoading: true, error: null } as never);
}

function mockSpot(overrides: Partial<PlantingSpot> = {}) {
  vi.mocked(usePlantingSpot).mockReturnValue({
    spot: { ...baseSpot, ...overrides },
    isLoading: false,
    error: null,
  } as never);
}

function mockNoSpot() {
  vi.mocked(usePlantingSpot).mockReturnValue({ spot: null, isLoading: false, error: null } as never);
}

describe('PlantingSpotDetailScreen', () => {
  const toggleStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlantingSpotStatusToggle).mockImplementation(
      (_spotId, status) =>
        ({
          isFallow: status === 'FALLOW',
          isPending: false,
          toggle: toggleStatus,
        }) as never,
    );
    vi.mocked(useWaterPlantingSpot).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useWaterPlantingSpot>);
  });

  it('renders skeleton when loading', () => {
    mockLoading();
    const { container } = render(
      <PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />,
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders nothing when spot is null', () => {
    mockNoSpot();
    const { container } = render(
      <PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders spot name', () => {
    mockSpot();
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getAllByText('Main Bed').length).toBeGreaterThan(0);
  });

  it('renders the edit button', () => {
    mockSpot();
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getByTestId('btn-edit-spot')).toBeInTheDocument();
  });

  it('does not render the edit modal by default', () => {
    mockSpot();
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.queryByTestId('edit-spot-modal')).not.toBeInTheDocument();
  });

  it('opens the edit modal when the edit button is clicked', () => {
    mockSpot();
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    fireEvent.click(screen.getByTestId('btn-edit-spot'));

    expect(screen.getByTestId('edit-spot-modal')).toBeInTheDocument();
  });

  it('closes the edit modal when it calls onClose', () => {
    mockSpot();
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    fireEvent.click(screen.getByTestId('btn-edit-spot'));
    fireEvent.click(screen.getByText('close-edit-spot-modal'));

    expect(screen.queryByTestId('edit-spot-modal')).not.toBeInTheDocument();
  });

  it('renders the delete button', () => {
    mockSpot();
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getByTestId('btn-delete-spot')).toBeInTheDocument();
  });

  it('opens the delete confirmation dialog when the delete button is clicked', async () => {
    const user = userEvent.setup();
    mockSpot();
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    await user.click(screen.getByTestId('btn-delete-spot'));

    expect(screen.getByText('Are you sure you want to delete this planting spot?')).toBeInTheDocument();
  });

  it('deletes the spot and navigates to the list on confirm', async () => {
    const user = userEvent.setup();
    mockDeleteMutate.mockImplementation((_id, options) => options?.onSuccess?.());
    mockSpot();
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    await user.click(screen.getByTestId('btn-delete-spot'));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    expect(mockDeleteMutate).toHaveBeenCalledWith('spot-1', expect.objectContaining({ onSuccess: expect.any(Function) }));
    expect(mockPush).toHaveBeenCalledWith('/en/planting-spots');
  });

  it('renders status badge with current status', () => {
    mockSpot({ status: 'FALLOW' });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('FALLOW');
  });

  it('shows "Mark fallow" action for an active spot', () => {
    mockSpot({ status: 'ACTIVE' });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getByText('Mark fallow')).toBeInTheDocument();
  });

  it('shows "Reactivate" action for a fallow spot', () => {
    mockSpot({ status: 'FALLOW' });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getByText('Reactivate')).toBeInTheDocument();
  });

  it('calls toggleStatus() when marking an active spot fallow', () => {
    mockSpot({ status: 'ACTIVE' });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    screen.getByText('Mark fallow').click();

    expect(toggleStatus).toHaveBeenCalledOnce();
  });

  it('calls toggleStatus() when reactivating a fallow spot', () => {
    mockSpot({ status: 'FALLOW' });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    screen.getByText('Reactivate').click();

    expect(toggleStatus).toHaveBeenCalledOnce();
  });

  it('does not render the add-plant modal by default', () => {
    mockSpot();
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.queryByTestId('add-plant-modal')).not.toBeInTheDocument();
  });

  it('opens the add-plant modal when "Add plant" is clicked', () => {
    mockSpot();
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    fireEvent.click(screen.getByText('Add plant'));

    expect(screen.getByTestId('add-plant-modal')).toBeInTheDocument();
  });

  it('closes the add-plant modal when it calls onClose', () => {
    mockSpot();
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    fireEvent.click(screen.getByText('Add plant'));
    fireEvent.click(screen.getByText('close-add-plant-modal'));

    expect(screen.queryByTestId('add-plant-modal')).not.toBeInTheDocument();
  });

  it('renders empty plants message when no plants', () => {
    mockSpot({ resolvedPlants: [] });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getByText('No plants currently assigned to this spot.')).toBeInTheDocument();
  });

  it('does not render capacity bar when capacity is null', () => {
    mockSpot({ capacity: null });
    const { container } = render(
      <PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />,
    );
    expect(container.querySelector('.h-2.rounded-full.bg-muted')).not.toBeInTheDocument();
  });

  it('renders capacity bar when capacity is set', () => {
    mockSpot({ capacity: 10, resolvedPlants: [] });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getByText('0 / 10 plants')).toBeInTheDocument();
  });

  it('shows position label with row and column', () => {
    mockSpot({ capacity: 5, row: 2, column: 3, resolvedPlants: [] });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getAllByText('F2 · C3').length).toBeGreaterThan(0);
  });

  it('shows position label with row only', () => {
    mockSpot({ capacity: 5, row: 1, column: null, resolvedPlants: [] });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getAllByText('F1').length).toBeGreaterThan(0);
  });

  it('shows position label with column only', () => {
    mockSpot({ capacity: 5, row: null, column: 4, resolvedPlants: [] });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getAllByText('C4').length).toBeGreaterThan(0);
  });

  it('does not show a position chip when row and column are null', () => {
    mockSpot({ capacity: 5, row: null, column: null, resolvedPlants: [] });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.queryAllByText(/^[FC]\d/)).toHaveLength(0);
  });

  it('renders plant with image when imageUrl is set', () => {
    mockSpot({
      resolvedPlants: [
        {
          id: 'plant-1',
          name: 'Tomato',
          imageUrl: 'https://example.com/tomato.jpg',
          plantSpeciesId: 'species-1',
          userId: 'u1',
          spaceId: 's1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ],
    });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    const img = screen.getByRole('img', { name: 'Tomato' });
    expect(img).toHaveAttribute('src', 'https://example.com/tomato.jpg');
  });

  it('renders plant emoji when imageUrl is null', () => {
    mockSpot({
      resolvedPlants: [
        {
          id: 'plant-1',
          name: 'Basil',
          imageUrl: null,
          plantSpeciesId: null,
          userId: 'u1',
          spaceId: 's1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ],
    });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getByText('🌱')).toBeInTheDocument();
  });

  it('renders plantSpeciesId when present', () => {
    mockSpot({
      resolvedPlants: [
        {
          id: 'plant-1',
          name: 'Tomato',
          imageUrl: null,
          plantSpeciesId: 'species-tomato',
          userId: 'u1',
          spaceId: 's1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ],
    });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getByText('species-tomato')).toBeInTheDocument();
  });

  it('renders description in info tab when present', () => {
    mockSpot({ description: 'A lovely raised bed' });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getAllByText('A lovely raised bed').length).toBeGreaterThan(0);
  });

  it('shows no limit when capacity is null in info tab', () => {
    mockSpot({ capacity: null });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getByText('No limit')).toBeInTheDocument();
  });

  it('shows capacity value in info tab when set', () => {
    mockSpot({ capacity: 8 });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getAllByText('8 plants').length).toBeGreaterThan(0);
  });

  it('shows Not set position in info tab when no row/column', () => {
    mockSpot({ row: null, column: null });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getByText('Not set')).toBeInTheDocument();
  });

  it('renders dimensions when set', () => {
    mockSpot({ dimensionsWidth: 1.2, dimensionsHeight: 0.5, dimensionsLength: 2.0 });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getByText('1.2')).toBeInTheDocument();
    expect(screen.getByText('0.5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders soil type when set', () => {
    mockSpot({ soilType: 'Loamy' });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getAllByText('Loamy').length).toBeGreaterThan(0);
  });

  it('renders capacity bar in over-capacity state (current > capacity)', () => {
    mockSpot({
      capacity: 3,
      resolvedPlants: [
        { id: 'p1', name: 'P1', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'p2', name: 'P2', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'p3', name: 'P3', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'p4', name: 'P4', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ],
    });
    const { container } = render(
      <PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />,
    );
    expect(container.querySelector('.bg-destructive')).toBeInTheDocument();
  });

  it('renders capacity bar in full state (current === capacity)', () => {
    mockSpot({
      capacity: 2,
      resolvedPlants: [
        { id: 'p1', name: 'P1', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'p2', name: 'P2', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ],
    });
    const { container } = render(
      <PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />,
    );
    expect(container.querySelector('.bg-orange-400')).toBeInTheDocument();
  });

  it('renders capacity bar in normal state (current < capacity)', () => {
    mockSpot({
      capacity: 5,
      resolvedPlants: [
        { id: 'p1', name: 'P1', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ],
    });
    const { container } = render(
      <PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />,
    );
    expect(container.querySelector('.bg-\\[var\\(--forest\\)\\]')).toBeInTheDocument();
  });

  it('renders the "Water entire spot" button when the spot has plants', () => {
    mockSpot({
      resolvedPlants: [
        { id: 'p1', name: 'P1', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ],
    });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.getByTestId('btn-water-spot')).toBeInTheDocument();
  });

  it('does NOT render the "Water entire spot" button when the spot has no plants', () => {
    mockSpot({ resolvedPlants: [] });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);
    expect(screen.queryByTestId('btn-water-spot')).not.toBeInTheDocument();
  });

  it('opens the confirmation dialog when the "Water entire spot" button is clicked', async () => {
    const user = userEvent.setup();
    mockSpot({
      resolvedPlants: [
        { id: 'p1', name: 'P1', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ],
    });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    await user.click(screen.getByTestId('btn-water-spot'));

    expect(screen.getByText('Water all plants in this spot?')).toBeInTheDocument();
  });

  it('triggers waterPlantingSpot.mutate with the spot id when the dialog is confirmed', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();
    vi.mocked(useWaterPlantingSpot).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useWaterPlantingSpot>);
    mockSpot({
      resolvedPlants: [
        { id: 'p1', name: 'P1', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ],
    });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    await user.click(screen.getByTestId('btn-water-spot'));
    await user.click(screen.getByText('Water'));

    expect(mockMutate).toHaveBeenCalledWith(
      { id: 'spot-1' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('shows a success alert after a full success result', async () => {
    const user = userEvent.setup();
    const successResult: WaterPlantingSpotResult = {
      plantingSpotId: 'spot-1',
      wateredPlantIds: ['p1', 'p2'],
      failedPlants: [],
    };
    const mockMutate = vi.fn((_variables, options) => {
      options?.onSuccess?.(successResult);
    });
    vi.mocked(useWaterPlantingSpot).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useWaterPlantingSpot>);
    mockSpot({
      resolvedPlants: [
        { id: 'p1', name: 'P1', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'p2', name: 'P2', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ],
    });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    await user.click(screen.getByTestId('btn-water-spot'));
    await user.click(screen.getByText('Water'));

    expect(screen.getByText('2 watered.')).toBeInTheDocument();
  });

  it('shows a partial-failure alert detailing watered and failed counts', async () => {
    const user = userEvent.setup();
    const partialResult: WaterPlantingSpotResult = {
      plantingSpotId: 'spot-1',
      wateredPlantIds: ['p1'],
      failedPlants: [{ plantId: 'p2', reason: 'No active schedule' }],
    };
    const mockMutate = vi.fn((_variables, options) => {
      options?.onSuccess?.(partialResult);
    });
    vi.mocked(useWaterPlantingSpot).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useWaterPlantingSpot>);
    mockSpot({
      resolvedPlants: [
        { id: 'p1', name: 'P1', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'p2', name: 'P2', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ],
    });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    await user.click(screen.getByTestId('btn-water-spot'));
    await user.click(screen.getByText('Water'));

    expect(screen.getByText('1 watered, 1 failed.')).toBeInTheDocument();
  });

  it('disables the "Water entire spot" button while the mutation is pending', () => {
    vi.mocked(useWaterPlantingSpot).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      isError: false,
    } as unknown as ReturnType<typeof useWaterPlantingSpot>);
    mockSpot({
      resolvedPlants: [
        { id: 'p1', name: 'P1', imageUrl: null, plantSpeciesId: null, userId: 'u1', spaceId: 's1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ],
    });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    expect(screen.getByTestId('btn-water-spot')).toBeDisabled();
  });

  it('renders QR card when spot.qr exists', () => {
    mockSpot({
      qr: {
        id: 'qr1',
        spaceId: 's1',
        targetUrl: 'https://example.com',
        generation: 1,
        image: 'base64data',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    expect(screen.getByTestId('qr-card')).toBeInTheDocument();
    expect(screen.getByTestId('qr-image')).toHaveAttribute('src', 'data:image/png;base64,base64data');
    expect(screen.getByTestId('qr-code')).toHaveTextContent('qr1');
  });

  it('downloads the QR code image when the download button is clicked', async () => {
    mockSpot({
      qr: {
        id: 'qr1',
        spaceId: 's1',
        targetUrl: 'https://example.com',
        generation: 1,
        image: 'base64data',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    await userEvent.click(screen.getByTestId('qr-download-btn'));

    expect(mockQrDownload).toHaveBeenCalledWith(
      'Main Bed',
      expect.objectContaining({ id: 'qr1' }),
    );
  });

  it('does NOT render QR card when spot.qr is absent', () => {
    mockSpot({ qr: undefined });
    render(<PlantingSpotDetailScreen dict={dict} lang="en" spotId="spot-1" />);

    expect(screen.queryByTestId('qr-card')).not.toBeInTheDocument();
  });
});
