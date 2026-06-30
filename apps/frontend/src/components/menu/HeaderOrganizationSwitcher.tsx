'use client';

import { PortalContext } from '@/components/me/AppPortalContext';
import { APP_PATH } from '@/utils/path/constant';
import { Combobox } from '@filigran/ui/clients';
import organizationSwitcherMutation, {
  OrganizationSwitcherMutation as OrganizationSwitcherMutationType,
} from '@generated/OrganizationSwitcherMutation.graphql';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useContext, useMemo } from 'react';
import { useMutation } from 'react-relay';

interface OrganizationOption {
  value: string;
  label: string;
}

const HeaderOrganizationSwitcher = () => {
  const router = useRouter();
  const { me } = useContext(PortalContext);
  const t = useTranslations();

  const [commitOrganizationSwitcherMutation] =
    useMutation<OrganizationSwitcherMutationType>(organizationSwitcherMutation);

  if (!me) {
    return null;
  }

  const parsedOrganizations = useMemo(() => {
    return me.organizations.map((org) => ({
      ...org,
      name: org.personal_space
        ? t('OrganizationSwitcher.PersonalSpace')
        : org.name,
    }));
  }, [me.organizations, t]);

  const organizationOptions = useMemo(() => {
    return parsedOrganizations.map((organization) => ({
      value: organization.id,
      label: organization.name,
    }));
  }, [parsedOrganizations]);

  const selectedOrganization = useMemo(() => {
    return organizationOptions.find(
      ({ value }) => value === me.selected_organization_id
    );
  }, [organizationOptions, me.selected_organization_id]);

  const handleOnValueChange = (selectedValue?: OrganizationOption) => {
    if (!selectedValue || selectedValue.value === me.selected_organization_id) {
      return;
    }

    commitOrganizationSwitcherMutation({
      variables: {
        organization_id: selectedValue.value,
      },
      updater: (store) => {
        store.invalidateStore();
      },
      onCompleted: () => {
        router.push(`/${APP_PATH}`);
      },
    });
  };

  return (
    <div className="flex flex-col gap-xs sm:flex-row sm:items-center sm:gap-m">
      <span className="txt-sub-content sm:whitespace-nowrap">
        {t('OrganizationSwitcher.Workspace')}
      </span>
      <Combobox
        className="w-full sm:w-55"
        dataTab={organizationOptions}
        order={t('OrganizationSwitcher.SelectOrganization')}
        placeholder={t('OrganizationSwitcher.SelectOrganization')}
        emptyCommand={t('Utils.NotFound')}
        value={selectedOrganization}
        onValueChange={handleOnValueChange}
      />
    </div>
  );
};

export default HeaderOrganizationSwitcher;
