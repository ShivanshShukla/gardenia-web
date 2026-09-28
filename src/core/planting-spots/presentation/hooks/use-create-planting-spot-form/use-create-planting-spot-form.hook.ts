import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { plantingSpotSchema, type PlantingSpotFormValues } from '@/core/planting-spots/presentation/schemas/planting-spot.schema';
import { useCreatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-create-planting-spot/use-create-planting-spot.hook';

export function useCreatePlantingSpotForm(
  onClose: () => void,
  initialValues?: Partial<PlantingSpotFormValues>,
) {
  const { mutate: createPlantingSpot, isPending, error } = useCreatePlantingSpot();

  const form = useForm<PlantingSpotFormValues>({
    resolver: zodResolver(plantingSpotSchema),
    defaultValues: {
      name: '',
      type: 'RAISED_BED',
      description: '',
      capacity: null,
      row: null,
      column: null,
      dimensionsWidth: null,
      dimensionsHeight: null,
      dimensionsLength: null,
      soilType: '',
      ...initialValues,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createPlantingSpot(
      {
        ...values,
        description: values.description || null,
        soilType: values.soilType || null,
      },
      { onSuccess: onClose },
    );
  });

  return { form, onSubmit, isPending, error };
}
