'use client';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export const EmptyServicesRedirect = () => {
  const t = useTranslations();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = 'https://filigran.io/solutions/xtm-hub';
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);

  return (
    <section className="center flex flex-col items-center gap-s pt-[2vh]">
      <h2> {t('HomePage.Welcome')} 🎉</h2>
      <p>{t('RedirectPage.YourFutureHub')}</p>
      <p>{t('RedirectPage.ExploringOurRoad')}</p>
    </section>
  );
};
