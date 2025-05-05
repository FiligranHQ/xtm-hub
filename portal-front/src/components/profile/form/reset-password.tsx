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
        <Button onClick={onSubmit}>{t('UserForm.Reset')}</Button>
      </CardContent>
    </Card>
  );
};
