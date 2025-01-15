import { useTranslations } from 'next-intl';

export const EmptyServices = () => {
  const t = useTranslations();

  return (
    <section className="center flex flex-col items-center gap-s pt-[2vh]">
      <p>{t('Service.NoOwnedService')}</p>
    </section>
  );
};
