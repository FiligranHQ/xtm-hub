import { PortalContext } from '@/components/me/AppPortalContext';
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
import { useContext } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

import { useTranslate } from '@tolgee/react';
interface ServiceFormUploaderOrganizationIdFieldProps {
  field: ControllerRenderProps<FieldValues, string>;
  isCreation: boolean;
  document?: documentItem_fragment$data;
  disabled?: boolean;
}

export const ServiceFormUploaderOrganizationIdField = ({
  field,
  isCreation,
  document,
  disabled,
}: ServiceFormUploaderOrganizationIdFieldProps) => {
  const { t } = useTranslate();
  const { me } = useContext(PortalContext);
  return (
    <FormItem hidden={isCreation}>
      <FormLabel>{t('OrganizationInServiceAction_Organization')}</FormLabel>
      <Select
        disabled={disabled}
        onValueChange={field.onChange}
        defaultValue={
          (isCreation
            ? me?.selected_organization_id
            : document?.uploader_organization?.id) ?? ''
        }>
        <FormControl>
          <SelectTrigger>
            <SelectValue
              placeholder={t('OrganizationInServiceAction_SelectOrganization')}
            />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {me?.organizations.map((node) => {
            return (
              <SelectItem
                key={node?.id}
                value={node?.id}>
                {node?.name}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};
