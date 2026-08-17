'use client';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';

import { useTranslate } from '@tolgee/react';
interface ProfileFormResetPasswordProps {
  onSubmit: () => void;
}

export const ProfileFormResetPassword = ({
  onSubmit,
}: ProfileFormResetPasswordProps) => {
  const { t } = useTranslate();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="heading-lg">{t('UserForm_Password')}</CardTitle>
      </CardHeader>
      <CardContent>{t('UserForm_ResetPassword_Sentence')}</CardContent>
      <CardFooter className="flex justify-end">
        <Button
          aria-label={t('UserForm_ResetPassword_Action')}
          onClick={onSubmit}>
          {t('UserForm_ResetPassword_Action')}
        </Button>
      </CardFooter>
    </Card>
  );
};
