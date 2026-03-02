import { getUseCases } from '@/components/admin/use-case/use-case.utils';
import {
  FormControl,
  FormItem,
  FormLabel,
  MultiSelectFormField,
} from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

interface Props {
  field: ControllerRenderProps<FieldValues, string>;
}

export const ServiceFormUseCasesField = ({ field }: Props) => {
  const t = useTranslations();
  return (
    <FormItem>
      <FormLabel>{t('Service.Form.UseCasesLabel')}</FormLabel>
      <FormControl>
        <MultiSelectFormField
          noResultString={t('Utils.NotFound')}
          options={getUseCases()}
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
