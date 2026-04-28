import { FormControl, FormItem, FormLabel, FormMessage } from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { useTranslations } from 'next-intl';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';
import FileInputWithPrevent from '../../ui/FileInputWithPrevent';

interface Props {
  field: ControllerRenderProps<FieldValues, string>;
  setIsDirty: (isDirty: boolean) => void;
  document?: documentItem_fragment$data;
}

export const ServiceFormJsonFileField = ({
  field,
  setIsDirty,
  document,
}: Props) => {
  const t = useTranslations();
  return (
    <FormItem>
      <FormLabel>
        {t('Service.Form.ExistingJSONFile', {
          file_name: field.value?.[0].name ?? document?.file_name,
        })}
      </FormLabel>
      <FormControl>
        <div onClick={() => setIsDirty(true)}>
          <FileInputWithPrevent
            field={field}
            texts={{
              selectFile: t('Service.Form.UpdateJSONFile'),
              dialogTitle: t('Service.Form.UpdateJSONFile'),
              dialogDescription: t('Service.Form.DescriptionUpdateJSONFile'),
            }}
            allowedTypes="application/json"
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
