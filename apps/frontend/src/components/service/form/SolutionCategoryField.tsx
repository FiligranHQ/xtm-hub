import { useSolutionCategories } from '@/components/service/form/UseSolutionCategories';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import type { FiligranProduct } from '@graphql/generated';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

import { useTranslate } from '@tolgee/react';
interface ServiceFormSolutionCategoryFieldProps {
  field: ControllerRenderProps<FieldValues, string>;
  document?: documentItem_fragment$data;
  disabled?: boolean;
  product?: FiligranProduct;
}

export const ServiceFormSolutionCategoryField = ({
  field,
  document,
  disabled,
  product,
}: ServiceFormSolutionCategoryFieldProps) => {
  const { t } = useTranslate();
  const categories = useSolutionCategories(product);
  // The form input is still single-select while the API now returns a list:
  // take the first ingested category as the default, pending the product
  // decision on form cardinality.
  const selectedCategoryId =
    field.value ?? document?.solution_categories?.[0]?.id;
  const selectedCategoryName = document?.solution_categories?.[0]?.name;
  const hasSelectedCategoryInOptions = categories.some(
    (category) => category.id === selectedCategoryId
  );

  return (
    <FormItem>
      <FormLabel>{t('Service_Form_SolutionCategoriesLabel')}</FormLabel>
      <Select
        disabled={disabled}
        onValueChange={field.onChange}
        value={selectedCategoryId ?? undefined}>
        <FormControl>
          <SelectTrigger className="font-semibold">
            <SelectValue
              placeholder={t('Service_Form_SolutionCategoriesPlaceholder')}
            />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {selectedCategoryId &&
          !hasSelectedCategoryInOptions &&
          selectedCategoryName ? (
            <SelectItem
              key={selectedCategoryId}
              value={selectedCategoryId}>
              {selectedCategoryName}
            </SelectItem>
          ) : null}
          {categories.map((category) => (
            <SelectItem
              key={category.id}
              value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};
