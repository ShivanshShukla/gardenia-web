import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockOnSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

function buildFormReturn(overrides: Record<string, unknown> = {}) {
  return {
    form: {
      register: vi.fn(() => ({})),
      control: {},
      watch: vi.fn(() => undefined),
      setValue: vi.fn(),
      formState: { errors: {} },
    },
    onSubmit: mockOnSubmit,
    isPending: false,
    error: null,
    ...overrides,
  };
}

const mockUseCreatePlantingSpotForm = vi.hoisted(() => vi.fn());

vi.mock(
  '@/core/planting-spots/presentation/hooks/use-create-planting-spot-form/use-create-planting-spot-form.hook',
  () => ({ useCreatePlantingSpotForm: mockUseCreatePlantingSpotForm }),
);

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    Controller: ({ name, render }: { name: string; render: (p: { field: { value: string; onChange: () => void; onBlur: () => void; ref: () => void; name: string } }) => React.ReactNode }) =>
      render({ field: { value: 'RAISED_BED', onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn(), name } }),
  };
});

vi.mock('@/shared/presentation/components/ui/select/select', () => ({
  Select: ({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: ReactNode }) => (
    <select data-testid="type-select" value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => <option value={value}>{children}</option>,
}));

import { CreatePlantingSpotModal } from './create-planting-spot-modal';

const dict = {
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
  types: {
    RAISED_BED: 'Raised bed',
    POT: 'Pot',
    CONTAINER: 'Container',
    FIELD_SECTION: 'Field section',
    OTHER: 'Other',
  },
} as never;

describe('CreatePlantingSpotModal', () => {
  beforeEach(() => {
    mockUseCreatePlantingSpotForm.mockReturnValue(buildFormReturn());
  });

  it('renders with an opaque dialog surface and the create title', () => {
    render(<CreatePlantingSpotModal dict={dict} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('New planting spot')).toBeInTheDocument();
  });

  it('renders the shared form fields', () => {
    render(<CreatePlantingSpotModal dict={dict} onClose={vi.fn()} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Soil type (optional)')).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CreatePlantingSpotModal dict={dict} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows the save label when not pending, and saving label when pending', () => {
    const { rerender } = render(<CreatePlantingSpotModal dict={dict} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();

    mockUseCreatePlantingSpotForm.mockReturnValue(buildFormReturn({ isPending: true }));
    rerender(<CreatePlantingSpotModal dict={dict} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeInTheDocument();
  });

  it('shows an error message when the mutation fails', () => {
    mockUseCreatePlantingSpotForm.mockReturnValue(buildFormReturn({ error: new Error('boom') }));
    render(<CreatePlantingSpotModal dict={dict} onClose={vi.fn()} />);
    expect(screen.getByText('Could not save the planting spot. Try again.')).toBeInTheDocument();
  });

  it('forwards initialValues to useCreatePlantingSpotForm', () => {
    const initialValues = { row: 2, column: 5 };
    render(<CreatePlantingSpotModal dict={dict} onClose={vi.fn()} initialValues={initialValues} />);
    expect(mockUseCreatePlantingSpotForm).toHaveBeenCalledWith(expect.any(Function), initialValues);
  });
});
