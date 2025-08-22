'use client';

import { PortalContext } from '@/components/me/app-portal-context';
import {
  AutoForm,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React, { useContext } from 'react';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().optional(),
});

export type ProfileFormEditEmailSchema = z.infer<typeof formSchema>;

interface ProfileFormEditEmailProps {
  onSubmit: (values: ProfileFormEditEmailSchema) => void;
}

export const ProfileFormEditEmail: React.FC<ProfileFormEditEmailProps> = ({
  onSubmit,
}: ProfileFormEditEmailProps) => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('UserForm.Email')}</CardTitle>
      </CardHeader>
      <CardContent>
        <AutoForm
          onSubmit={(values) => onSubmit(values)}
          formSchema={formSchema}
          values={{
            email: me?.email ?? '',
          }}
          fieldConfig={{
            email: {
              label: t('UserForm.Email'),
              inputProps: {
                placeholder: t('UserForm.Email'),
              },
            },
          }}>
          <div className="flex justify-end">
            <Button aria-label={t('ProfilePage.UpdateProfile')}>
              {t('Utils.Update')}
            </Button>
            {/*<AlertDialogComponent*/}
            {/*  AlertTitle={'AlertDialog title, string'}*/}
            {/*  variantName={'destructive'}*/}
            {/*  actionButtonText={'Update'}*/}
            {/*  triggerElement={<Button type="button">Update</Button>}*/}
            {/*  onClickContinue={() => onSubmit(values)}>*/}
            {/*  Are you sure XXX ?*/}
            {/*</AlertDialogComponent>*/}
          </div>
        </AutoForm>
      </CardContent>
    </Card>
  );
};
