'use client';

import { Card, CardContent, CardHeader, CardTitle } from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  onSubmit: () => void;
}

export const ProfileFormResetPassword: React.FC<Props> = ({ onSubmit }) => {
  const t = useTranslations();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('UserForm.Password')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-s items-start">
          {t('UserForm.ResetPassword.Sentence')}
          <Button
            aria-label={t('UserForm.ResetPassword.Action')}
            onClick={onSubmit}>
            {t('UserForm.ResetPassword.Action')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
