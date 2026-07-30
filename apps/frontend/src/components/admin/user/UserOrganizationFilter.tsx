import { getOrganizations } from '@/components/organization/Organization.service';
import { Combobox } from '@filigran/ui/clients';
import { useTranslations } from 'next-intl';

interface OrganizationFilterOption {
  id: string;
  name: string;
  personal_space: boolean;
}

interface UserOrganizationFilterProps {
  value?: string;
  onChange: (organizationId: string | undefined) => void;
}

export const UserOrganizationFilter = ({
  value,
  onChange,
}: UserOrganizationFilterProps) => {
  const t = useTranslations();
  const { organizationsData, refetch } = getOrganizations();

  const ALL_ORGANIZATIONS: OrganizationFilterOption = {
    id: '',
    name: t('UserActions.AllOrganizations'),
    personal_space: false,
  };

  const organizations: OrganizationFilterOption[] = [
    ALL_ORGANIZATIONS,
    ...organizationsData.organizations.edges
      .map(({ node }) => node)
      .filter(({ personal_space }) => !personal_space),
  ];

  const selectedOrganization = organizations.find(
    ({ id }) => id !== '' && id === value
  );

  const handleOnValueChange = (
    organization: OrganizationFilterOption | undefined
  ) => {
    refetch({ searchTerm: '' });
    onChange(organization?.id || undefined);
  };

  return (
    <Combobox
      className="w-[200px]"
      dataTab={organizations}
      order={t('UserActions.Organization')}
      placeholder={t('UserActions.Organization')}
      emptyCommand={t('Utils.NotFound')}
      value={selectedOrganization}
      onValueChange={handleOnValueChange}
      keyValue={'name'}
      keyLabel={'name'}
      onInputChange={(searchTerm) => refetch({ searchTerm })}
    />
  );
};
