'use client';
import { PortalContext } from '@/components/me/AppPortalContext';
import { CountryCombobox } from '@/components/ui/country/Combobox';
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
} from '@filigran/ui';
import { useContext } from 'react';
import { z } from 'zod';

import { useTranslate } from '@tolgee/react';
const formSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  country: z
    .string()
    .transform((val) => val || null)
    .nullish(),
});

export type ProfileFormEditSchema = z.infer<typeof formSchema>;

interface ProfileFormEditProps {
  onSubmit: (values: ProfileFormEditSchema) => void;
}

export const ProfileFormEdit = ({ onSubmit }: ProfileFormEditProps) => {
  const { t } = useTranslate();
  const { me } = useContext(PortalContext);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="heading-lg">{t('ProfilePage_Title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <AutoForm
          onSubmit={(values) => onSubmit(values)}
          formSchema={formSchema}
          values={{
            first_name: me?.first_name ?? '',
            last_name: me?.last_name ?? '',
            country: me?.country ?? '',
          }}
          fieldConfig={{
            first_name: {
              label: t('UserForm_FirstName'),
              inputProps: {
                placeholder: t('UserForm_FirstName'),
              },
            },
            last_name: {
              label: t('UserForm_LastName'),
              inputProps: {
                placeholder: t('UserForm_LastName'),
              },
            },
            country: {
              fieldType: ({ field }) => (
                <FormItem>
                  <FormLabel>{t('UserForm_Country')}</FormLabel>
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
          }}>
          <div className="flex justify-end">
            <Button aria-label={t('ProfilePage_UpdateProfile')}>
              {t('Utils_Update')}
            </Button>
          </div>
        </AutoForm>
      </CardContent>
    </Card>
  );
};
