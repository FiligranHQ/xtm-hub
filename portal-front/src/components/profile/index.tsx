import { useTranslations } from 'next-intl';
import React from 'react';

export const Profile: React.FC = () => {
  const t = useTranslations();

  return (
    <>
      <h1 className="sr-only">{t('ProfilePage.Title')}</h1>
    </>
  );
};
