import MostDeployedResources from '@/components/homepage/MostDeployedResources';
import { defaultLocale, publicLocales } from '@/i18n/config';
import { getLocale } from 'next-intl/server';

export const PrivateHomepage = async () => {
  const userLocale = await getLocale();
  const locale = (publicLocales as readonly string[]).includes(userLocale)
    ? (userLocale as (typeof publicLocales)[number])
    : defaultLocale;

  return (
    <div className="p-xl">
      <MostDeployedResources locale={locale} />
    </div>
  );
};
