'use client';

import { useTranslations } from 'next-intl';

const CookieSettingsLink = () => {
  const t = useTranslations('PublicLayout');

  const handleClick = () => {
    if (
      typeof window !== 'undefined' &&
      window.tarteaucitron?.userInterface?.openPanel
    ) {
      window.tarteaucitron.userInterface.openPanel();
    }
  };

  return (
    <button
      type="button"
      className="bg-transparent border-none p-0 cursor-pointer text-inherit"
      onClick={handleClick}>
      {t('CookieSettings')}
    </button>
  );
};

export default CookieSettingsLink;
