import { Suspense } from 'react';
import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import { PlantingSpotsLayoutScreen } from '@/core/planting-spots/presentation/screens/planting-spots-layout/planting-spots-layout.screen';
import { PlantingSpotsLayoutSkeleton } from '@/core/planting-spots/presentation/components/planting-spots-layout-skeleton/planting-spots-layout-skeleton';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <Suspense fallback={<PlantingSpotsLayoutSkeleton />}>
      <PlantingSpotsLayoutScreen dict={dict.plantingSpots} lang={locale} />
    </Suspense>
  );
}
