'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'filigran-ui';
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
      <CardContent>{t('UserForm.ResetPassword.Sentence')}</CardContent>
      <CardFooter className="flex justify-end">
        <Button
          aria-label={t('UserForm.ResetPassword.Action')}
          onClick={onSubmit}>
          {t('UserForm.ResetPassword.Action')}
        </Button>
      </CardFooter>
    </Card>
  );
};
