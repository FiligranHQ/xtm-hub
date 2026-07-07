import { ENTITY_TYPES } from '@/utils/shareable-resources/entity-type';
import {
  FormControl,
  FormItem,
  FormLabel,
  MultiSelectFormField,
} from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

interface ServiceFormEntityTypesFieldProps {
  field: ControllerRenderProps<FieldValues, string>;
  disabled?: boolean;
}

export const ServiceFormEntityTypesField = ({
  field,
  disabled,
}: ServiceFormEntityTypesFieldProps) => {
  const t = useTranslations();
  return (
    <FormItem>
      <FormLabel>
        {t('Service.Form.EntityTypesLabel')}
        <span className="text-sm text-destructive"> *</span>
      </FormLabel>
      <FormControl>
        <MultiSelectFormField
          disabled={disabled}
          noResultString={t('Utils.NotFound')}
          options={ENTITY_TYPES}
          keyValue="id"
          keyLabel="name"
          defaultValue={field.value}
          value={field.value}
          onValueChange={field.onChange}
          placeholder={t('Service.Form.EntityTypesPlaceholder')}
          variant="inverted"
        />
      </FormControl>
    </FormItem>
  );
};
