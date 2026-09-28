import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockMutate = vi.hoisted(() => vi.fn());

vi.mock(
  '@/core/planting-spots/presentation/hooks/use-create-planting-spot/use-create-planting-spot.hook',
  () => ({ useCreatePlantingSpot: vi.fn() }),
);

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    useForm: vi.fn().mockReturnValue({
      register: vi.fn().mockReturnValue({}),
      handleSubmit: (fn: (v: unknown) => void) => () => fn,
      control: {},
      setValue: vi.fn(),
      watch: vi.fn().mockReturnValue(undefined),
      formState: { errors: {} },
    }),
  };
});

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn().mockReturnValue(vi.fn()),
}));

import { useForm } from 'react-hook-form';
import { useCreatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-create-planting-spot/use-create-planting-spot.hook';
import { useCreatePlantingSpotForm } from './use-create-planting-spot-form.hook';

const formValues = {
  name: 'Test Spot',
  type: 'RAISED_BED' as const,
  description: 'A description',
  capacity: null,
  row: null,
  column: null,
  dimensionsWidth: null,
  dimensionsHeight: null,
  dimensionsLength: null,
  soilType: '',
};

describe('useCreatePlantingSpotForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreatePlantingSpot).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as never);
  });

  it('runs handleSubmit through the actual onSubmit callback, normalizing and calling mutate with onClose as onSuccess', () => {
    // `handleSubmit` here is mocked to hand back the raw callback so we can
    // invoke it directly with arbitrary form values, bypassing zod validation.
    vi.mocked(useForm).mockReturnValue({
      register: vi.fn().mockReturnValue({}),
      handleSubmit: (fn: (v: unknown) => void) => fn,
      control: {},
      setValue: vi.fn(),
      watch: vi.fn().mockReturnValue(undefined),
      formState: { errors: {} },
    } as never);

    const onClose = vi.fn();
    const { result } = renderHook(() => useCreatePlantingSpotForm(onClose));

    act(() => {
      (result.current.onSubmit as unknown as (v: typeof formValues) => void)(formValues);
    });

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Spot', type: 'RAISED_BED', description: 'A description' }),
      expect.objectContaining({ onSuccess: onClose }),
    );
  });

  it('converts an empty description to null', () => {
    vi.mocked(useForm).mockReturnValue({
      register: vi.fn().mockReturnValue({}),
      handleSubmit: (fn: (v: unknown) => void) => fn,
      control: {},
      setValue: vi.fn(),
      watch: vi.fn().mockReturnValue(undefined),
      formState: { errors: {} },
    } as never);

    const { result } = renderHook(() => useCreatePlantingSpotForm(vi.fn()));
    act(() => {
      (result.current.onSubmit as unknown as (v: typeof formValues) => void)({ ...formValues, description: '' });
    });

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ description: null }),
      expect.any(Object),
    );
  });

  it('converts an empty soilType to null', () => {
    vi.mocked(useForm).mockReturnValue({
      register: vi.fn().mockReturnValue({}),
      handleSubmit: (fn: (v: unknown) => void) => fn,
      control: {},
      setValue: vi.fn(),
      watch: vi.fn().mockReturnValue(undefined),
      formState: { errors: {} },
    } as never);

    const { result } = renderHook(() => useCreatePlantingSpotForm(vi.fn()));
    act(() => {
      (result.current.onSubmit as unknown as (v: typeof formValues) => void)({ ...formValues, soilType: '' });
    });

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ soilType: null }),
      expect.any(Object),
    );
  });

  it('exposes isPending from the mutation', () => {
    vi.mocked(useCreatePlantingSpot).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    } as never);
    const { result } = renderHook(() => useCreatePlantingSpotForm(vi.fn()));
    expect(result.current.isPending).toBe(true);
  });

  it('exposes error from the mutation', () => {
    const err = new Error('boom');
    vi.mocked(useCreatePlantingSpot).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: err,
    } as never);
    const { result } = renderHook(() => useCreatePlantingSpotForm(vi.fn()));
    expect(result.current.error).toBe(err);
  });

  it('passes initialValues into useForm defaultValues', () => {
    const initialValues = { row: 3, column: 4 };
    renderHook(() => useCreatePlantingSpotForm(vi.fn(), initialValues));

    expect(useForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: expect.objectContaining({
          row: 3,
          column: 4,
        }),
      }),
    );
  });
});
