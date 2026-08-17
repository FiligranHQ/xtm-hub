import {
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { ControllerRenderProps } from 'react-hook-form';

import { useTranslate } from '@tolgee/react';
interface TranslatableEnumSelectFieldProps {
  field: ControllerRenderProps;
  label: string;
  placeholder: string;
  values: string[];
  translationNamespace: string;
  className?: string;
}

export const TranslatableEnumSelectField = ({
  field,
  label,
  placeholder,
  values,
  translationNamespace,
  className = 'text-sm text-destructive',
}: TranslatableEnumSelectFieldProps) => {
  const { t } = useTranslate();
  return (
    <FormItem>
      <FormLabel>
        {label} <span className={className}>*</span>
      </FormLabel>
      <Select
        value={field.value}
        onValueChange={field.onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {values.map((value) => (
            <SelectItem
              key={value}
              value={value}>
              {t(`${translationNamespace}_${value}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage className={className} />
    </FormItem>
  );
};
