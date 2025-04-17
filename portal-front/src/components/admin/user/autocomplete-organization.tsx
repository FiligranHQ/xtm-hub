import { getOrganizations } from '@/components/organization/organization.service';
import { Combobox } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';

export interface UserOrganizationFormProps {
  id: string;
  name: string;
  personal_space: boolean;
}
export interface OrganizationCapabilitiesProps {
  organization_id: string;
  capabilities: string[];
}
interface AutocompleteOrganizationProps {
  selectedOrganizationCapabilities: OrganizationCapabilitiesProps[];
  onValueChange: (value?: UserOrganizationFormProps) => void;
}
export const AutocompleteOrganization: FunctionComponent<
  AutocompleteOrganizationProps
> = ({ selectedOrganizationCapabilities, onValueChange }) => {
  const t = useTranslations();
  const [organizationsData, refetch] = getOrganizations();

  const isOrganizationAlreadySelected = (id: string) => {
    return selectedOrganizationCapabilities.find(
      ({ organization_id }) => organization_id === id
    );
  };
  const filteredOrganization = organizationsData.organizations.edges
    .map(({ node }) => node)
    .filter(({ id }) => !isOrganizationAlreadySelected(id));
  const onAutocompleteOrganization = (value: string) => {
    refetch({ searchTerm: value });
  };
  return (
    <Combobox
      className="w-[180px]"
      dataTab={filteredOrganization}
      order={t('UserForm.AddOrganization')}
      placeholder={t('UserForm.AddOrganization')}
      emptyCommand={t('Utils.NotFound')}
      onValueChange={onValueChange}
      keyValue={'name'}
      keyLabel={'name'}
      onInputChange={onAutocompleteOrganization}
    />
  );
};
