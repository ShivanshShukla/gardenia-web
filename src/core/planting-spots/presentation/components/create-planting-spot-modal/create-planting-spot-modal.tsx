'use client';

import { useCreatePlantingSpotForm } from '@/core/planting-spots/presentation/hooks/use-create-planting-spot-form/use-create-planting-spot-form.hook';
import { PlantingSpotFormFields } from '@/core/planting-spots/presentation/components/planting-spot-form-fields/planting-spot-form-fields';
import { FormModal } from '@/shared/presentation/components/ui/form-modal/form-modal';
import type { PlantingSpotFormValues } from '@/core/planting-spots/presentation/schemas/planting-spot.schema';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['plantingSpots'];
  onClose: () => void;
  initialValues?: Partial<PlantingSpotFormValues>;
};

export function CreatePlantingSpotModal({ dict, onClose, initialValues }: Props) {
  const { form, onSubmit, isPending, error } = useCreatePlantingSpotForm(onClose, initialValues);
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const formDict = dict.form;

  return (
    <FormModal
      title={formDict.titleCreate}
      onClose={onClose}
      onSubmit={onSubmit}
      isPending={isPending}
      cancelLabel={formDict.cancel}
      submitLabel={formDict.save}
      submittingLabel={formDict.saving}
    >
      <PlantingSpotFormFields
        register={register}
        control={control}
        errors={errors}
        watch={watch}
        setValue={setValue}
        formDict={formDict}
        typesDict={dict.types}
      />
      {error && <span className="text-destructive text-xs">{formDict.error}</span>}
    </FormModal>
  );
}
