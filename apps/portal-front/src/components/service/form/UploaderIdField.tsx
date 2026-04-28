import { FormControl, FormItem, FormLabel } from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { PortalContext } from '../../me/AppPortalContext';
import SelectUsersFormField from '../../ui/SelectUsers';

interface Props {
  field: ControllerRenderProps<FieldValues, string>;
  document?: documentItem_fragment$data;
  disabled?: boolean;
}

export const ServiceFormUploaderIdField = ({
  field,
  document,
  disabled,
}: Props) => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);
  return (
    <FormItem>
      <FormLabel>{t('Service.Form.Author')}</FormLabel>
      <FormControl>
        <SelectUsersFormField
          defaultValue={document?.uploader?.email ?? me!.email}
          value={field.value}
          onValueChange={field.onChange}
          disabled={disabled}
        />
      </FormControl>
    </FormItem>
  );
};
