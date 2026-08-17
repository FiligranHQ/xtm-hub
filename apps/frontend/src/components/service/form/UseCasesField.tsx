import { useUseCases } from '@/components/admin/use-case/use-use-cases';
import {
  FormControl,
  FormItem,
  FormLabel,
  MultiSelectFormField,
} from '@filigran/ui';
import type { FiligranProduct } from '@graphql/generated';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

import { useTranslate } from '@tolgee/react';
interface ServiceFormUseCasesFieldProps {
  field: ControllerRenderProps<FieldValues, string>;
  disabled?: boolean;
  product?: FiligranProduct;
  required?: boolean;
}

export const ServiceFormUseCasesField = ({
  field,
  disabled,
  product,
  required,
}: ServiceFormUseCasesFieldProps) => {
  const { t } = useTranslate();
  return (
    <FormItem>
      <FormLabel>
        {t('Service_Form_UseCasesLabel')}
        {required ? <span className="text-sm text-destructive"> *</span> : null}
      </FormLabel>
      <FormControl>
        <MultiSelectFormField
          disabled={disabled}
          noResultString={t('Utils_NotFound')}
          options={useUseCases({ product })}
          keyValue="id"
          keyLabel="name"
          defaultValue={field.value}
          value={field.value}
          onValueChange={field.onChange}
          popoverContentClassName="bg-elevation-background-layer-3"
          placeholder={t('Service_Form_UseCasesPlaceholder')}
          variant="inverted"
        />
      </FormControl>
    </FormItem>
  );
};
