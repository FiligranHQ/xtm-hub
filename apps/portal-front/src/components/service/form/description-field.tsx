import MarkdownInput from '@/components/ui/MarkdownInput';
import { FormControl, FormItem, FormLabel, FormMessage } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

interface Props {
  field: ControllerRenderProps<FieldValues, string>;
  documentType: string;
}

export const ServiceFormDescriptionField = ({ field, documentType }: Props) => {
  const t = useTranslations();
  return (
    <FormItem>
      <FormLabel>{t('Service.Form.DescriptionLabel')}</FormLabel>
      <FormControl>
        <MarkdownInput
          value={field.value}
          onChange={field.onChange}
          placeholder={t('Service.Form.DescriptionPlaceholder', {
            documentType,
          })}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
