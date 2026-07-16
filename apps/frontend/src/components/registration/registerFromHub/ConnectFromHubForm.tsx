'use client';

import { AutoForm, Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const connectFromHubFormSchema = z.object({
  productName: z.string().trim().min(1, { error: 'Product name is required' }),
  productUrl: z
    .string()
    .trim()
    .url({ error: 'Product URL must be a valid URL' }),
});

interface ConnectFromHubFormProps {
  onSubmit: (values: z.infer<typeof connectFromHubFormSchema>) => void;
  values?: Partial<z.infer<typeof connectFromHubFormSchema>>;
}

const ConnectFromHubForm = ({ onSubmit, values }: ConnectFromHubFormProps) => {
  const t = useTranslations();

  return (
    <AutoForm
      formSchema={connectFromHubFormSchema}
      values={{
        productName: values?.productName ?? '',
        productUrl: values?.productUrl ?? '',
      }}
      onSubmit={onSubmit}
      fieldConfig={{
        productName: {
          label: t('Register.Details.ProductName'),
          inputProps: {
            placeholder: t('Register.Details.ProductName'),
          },
        },
        productUrl: {
          label: t('Register.Details.ProductURL'),
          inputProps: {
            placeholder: t('Register.Details.ProductURL'),
          },
        },
      }}>
      <div className="flex justify-end">
        <Button type="submit">{t('Utils.Continue')}</Button>
      </div>
    </AutoForm>
  );
};

export default ConnectFromHubForm;
