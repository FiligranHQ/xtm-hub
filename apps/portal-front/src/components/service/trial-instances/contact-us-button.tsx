'use client';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import React from 'react';

export const ContactUsButton: React.FC = () => {
  const t = useTranslations();
  return (
    <Button
      onClick={() => console.warn('Contact Us')}
      variant="outline-primary">
      {t('Service.Trials.ContactUs')}
    </Button>
  );
};
