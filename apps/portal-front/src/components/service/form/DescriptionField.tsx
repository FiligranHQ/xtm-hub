import MarkdownInput from '@/components/ui/MarkdownInput';
import { FormControl, FormItem, FormLabel, FormMessage } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

interface Props {
  field: ControllerRenderProps<FieldValues, string>;
  documentType: string;
  disabled?: boolean;
  required?: boolean;
}

export const ServiceFormDescriptionField = ({
  field,
  documentType,
  disabled,
  required,
}: Props) => {
  const t = useTranslations();
  return (
    <FormItem>
      <FormLabel>
        {t('Service.Form.DescriptionLabel')}
        {required ? <span className="text-sm text-destructive"> *</span> : null}
      </FormLabel>
      <FormControl>
        <MarkdownInput
          disabled={disabled}
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
