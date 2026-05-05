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
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

interface ServiceFormIntegrationSubtypeFieldProps {
  field: ControllerRenderProps<FieldValues, string>;
  integrationType: IntegrationTypeEnum;
  document?: documentItem_fragment$data;
  disabled?: boolean;
}

export const ServiceFormIntegrationSubtypeField = ({
  field,
  integrationType,
  document,
  disabled,
}: ServiceFormIntegrationSubtypeFieldProps) => {
  const t = useTranslations();
  return (
    <FormItem>
      <FormLabel>{t('Service.Form.SelectIntegrationSubType')}</FormLabel>
      <Select
        disabled={disabled}
        onValueChange={field.onChange}
        defaultValue={document?.integration_subtype}>
        <FormControl>
          <SelectTrigger>
            <SelectValue
              placeholder={t('Service.Form.SelectIntegrationSubType')}
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
