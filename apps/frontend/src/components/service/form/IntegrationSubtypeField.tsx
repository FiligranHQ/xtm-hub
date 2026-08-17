import {
  getIntegrationSubTypeMetadata,
  SubTypesPerIntegrationType,
} from '@/components/service/integrations/Integration.utils';
import { formatTitleCase } from '@/utils/format/case';
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
import { IntegrationType } from '@graphql/generated';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

import { useTranslate } from '@tolgee/react';
interface ServiceFormIntegrationSubtypeFieldProps {
  field: ControllerRenderProps<FieldValues, string>;
  integrationType: IntegrationType;
  document?: documentItem_fragment$data;
  disabled?: boolean;
}

export const ServiceFormIntegrationSubtypeField = ({
  field,
  integrationType,
  document,
  disabled,
}: ServiceFormIntegrationSubtypeFieldProps) => {
  const { t } = useTranslate();
  return (
    <FormItem>
      <FormLabel>{t('Service_Form_SelectIntegrationSubType')}</FormLabel>
      <Select
        disabled={disabled}
        onValueChange={field.onChange}
        defaultValue={document?.integration_subtype}>
        <FormControl>
          <SelectTrigger>
            <SelectValue
              placeholder={t('Service_Form_SelectIntegrationSubType')}
            />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {SubTypesPerIntegrationType.get(integrationType)?.map(
            (integrationSubType) => {
              return (
                <SelectItem
                  key={integrationSubType}
                  value={integrationSubType}>
                  {getIntegrationSubTypeMetadata(integrationSubType)?.label ??
                    formatTitleCase(integrationSubType)}
                </SelectItem>
              );
            }
          )}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};
