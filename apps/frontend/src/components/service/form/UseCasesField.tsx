import { getUseCases } from '@/components/admin/use-case/use-case.utils';
import {
  FormControl,
  FormItem,
  FormLabel,
  MultiSelectFormField,
} from '@filigran/ui';
import type { FiligranProduct } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

interface ServiceFormUseCasesFieldProps {
  field: ControllerRenderProps<FieldValues, string>;
  disabled?: boolean;
  product?: FiligranProduct;
}

export const ServiceFormUseCasesField = ({
  field,
  disabled,
  product,
}: ServiceFormUseCasesFieldProps) => {
  const t = useTranslations();
  return (
    <FormItem>
      <FormLabel>{t('Service.Form.UseCasesLabel')}</FormLabel>
      <FormControl>
        <MultiSelectFormField
          disabled={disabled}
          noResultString={t('Utils.NotFound')}
          options={getUseCases({ product })}
          keyValue="id"
          keyLabel="name"
          defaultValue={field.value}
          value={field.value}
          onValueChange={field.onChange}
          placeholder={t('Service.Form.UseCasesPlaceholder')}
          variant="inverted"
        />
      </FormControl>
    </FormItem>
  );
};
