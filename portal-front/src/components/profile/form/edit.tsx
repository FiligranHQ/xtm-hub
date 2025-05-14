'use client';

import { PortalContext } from '@/components/me/app-portal-context';
import { CountryCombobox } from '@/components/ui/country/combobox';
import {
  AutoForm,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React, { useContext } from 'react';
import { z } from 'zod';

const formSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  country: z
    .string()
    .transform((val) => val || null)
    .nullish(),
  picture: z
    .string()
    .transform((val) => val || null)
    .nullish(),
});

export type ProfileFormEditSchema = z.infer<typeof formSchema>;

interface ProfileFormEditProps {
  onSubmit: (values: ProfileFormEditSchema) => void;
}

export const ProfileFormEdit: React.FC<ProfileFormEditProps> = ({
  onSubmit,
}: ProfileFormEditProps) => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('ProfilePage.Title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <AutoForm
          onSubmit={(values) => onSubmit(values)}
          formSchema={formSchema}
          values={{
            first_name: me?.first_name ?? '',
            last_name: me?.last_name ?? '',
            country: me?.country ?? '',
            picture: me?.picture ?? '',
          }}
          fieldConfig={{
            first_name: {
              label: t('UserForm.FirstName'),
              inputProps: {
                placeholder: t('UserForm.FirstName'),
              },
            },
            last_name: {
              label: t('UserForm.LastName'),
              inputProps: {
                placeholder: t('UserForm.LastName'),
              },
            },
            country: {
              fieldType: ({ field }) => (
                <FormItem>
                  <FormLabel>{t('UserForm.Country')}</FormLabel>
                  <FormControl>
                    <CountryCombobox
                      value={field.value && { name: field.value }}
                      onValueChange={(value) => field.onChange(value?.name)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              ),
            },
            picture: {
              label: t('UserForm.Picture'),
              inputProps: {
                placeholder: t('UserForm.Picture'),
              },
            },
          }}>
          <div className="flex justify-end">
            <Button aria-label={t('ProfilePage.UpdateProfile')}>
              {t('Utils.Update')}
            </Button>
          </div>
        </AutoForm>
      </CardContent>
    </Card>
  );
};
