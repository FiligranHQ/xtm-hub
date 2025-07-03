import { useOrganizationCapabilities } from '@/hooks/useOrganizationCapabilities';
import { MultiSelectFormField } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

interface Props {
  value: string[];
  onChange: () => void;
}

export const CapabilityMultiSelect: React.FC<Props> = ({ value, onChange }) => {
  const t = useTranslations();
  const organizationCapabilities = useOrganizationCapabilities();

  const options = useMemo(() => {
    return organizationCapabilities.map((capability) => ({
      label: capability.replaceAll('_', ' '),
      value: capability,
    }));
  }, [organizationCapabilities]);

  return (
    <MultiSelectFormField
      noResultString={t('Utils.NotFound')}
      options={options}
      defaultValue={value}
      onValueChange={onChange}
      placeholder={t('UserForm.OrganizationsCapabilitiesPlaceholder')}
      variant="inverted"
    />
  );
};
