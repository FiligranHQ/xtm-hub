import { ENTITY_TYPES } from '@/utils/shareable-resources/entity-type';
import {
  FormControl,
  FormItem,
  FormLabel,
  MultiSelectFormField,
} from '@filigran/ui';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

import { useTranslate } from '@tolgee/react';
interface ServiceFormEntityTypesFieldProps {
  field: ControllerRenderProps<FieldValues, string>;
  disabled?: boolean;
}

export const ServiceFormEntityTypesField = ({
  field,
  disabled,
}: ServiceFormEntityTypesFieldProps) => {
  const { t } = useTranslate();
  return (
    <FormItem>
      <FormLabel>
        {t('Service_Form_EntityTypesLabel')}
        <span className="text-sm text-destructive"> *</span>
      </FormLabel>
      <FormControl>
        <MultiSelectFormField
          disabled={disabled}
          noResultString={t('Utils_NotFound')}
          options={ENTITY_TYPES}
          keyValue="id"
          keyLabel="name"
          defaultValue={field.value}
          value={field.value}
          onValueChange={field.onChange}
          popoverContentClassName="bg-elevation-background-layer-3"
          placeholder={t('Service_Form_EntityTypesPlaceholder')}
          variant="inverted"
        />
      </FormControl>
    </FormItem>
  );
};
