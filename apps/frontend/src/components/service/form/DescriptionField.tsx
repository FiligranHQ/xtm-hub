import MarkdownInput from '@/components/ui/MarkdownInput';
import { FormControl, FormItem, FormLabel, FormMessage } from '@filigran/ui';
import { useTranslate } from '@tolgee/react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';
interface ServiceFormDescriptionFieldProps {
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
}: ServiceFormDescriptionFieldProps) => {
  const { t } = useTranslate();
  return (
    <FormItem>
      <FormLabel>
        {t('Service_Form_DescriptionLabel')}
        {required ? <span className="text-sm text-destructive"> *</span> : null}
      </FormLabel>
      <FormControl>
        <MarkdownInput
          disabled={disabled}
          value={field.value}
          onChange={field.onChange}
          placeholder={t('Service_Form_DescriptionPlaceholder', {
            documentType,
          })}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
