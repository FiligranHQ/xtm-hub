'use client';

import { PortalContext } from '@/components/me/AppPortalContext';
import { invalidatePrivateNavigationQueries } from '@/components/menu/navigation/private/private-navigation-query-invalidation';
import { APP_PATH } from '@/utils/path/constant';
import { ArrowDropDownIcon } from '@filigran/icon';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@filigran/ui';
import { OrganizationSwitcherMutation as OrganizationSwitcherMutationType } from '@generated/OrganizationSwitcherMutation.graphql';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useContext, useId, useMemo, useState } from 'react';
import { graphql, useMutation } from 'react-relay';

export const organizationSwitcherMutation = graphql`
  mutation OrganizationSwitcherMutation($organization_id: OrganizationId!) {
    changeSelectedOrganization(organization_id: $organization_id) {
      id
      selected_organization_id
      selected_org_capabilities
    }
  }
`;

interface OrganizationOption {
  value: string;
  label: string;
}

const HeaderOrganizationSwitcher = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { me } = useContext(PortalContext);
  const t = useTranslations();
  const [openPopover, setOpenPopover] = useState(false);
  const listboxId = useId();

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
      setOpenPopover(false);
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
        invalidatePrivateNavigationQueries(queryClient);
        router.push(`/${APP_PATH}`);
      },
    });

    setOpenPopover(false);
  };

  return (
    <div className="flex flex-col gap-xs sm:flex-row sm:items-center sm:gap-m text-text-default-primary">
      <span className="content-body-base sm:whitespace-nowrap">
        {t('OrganizationSwitcher.Workspace')}
      </span>
      <Popover
        open={openPopover}
        onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            role="combobox"
            aria-label={t('OrganizationSwitcher.SelectOrganization')}
            aria-controls={listboxId}
            aria-expanded={openPopover}
            aria-haspopup="listbox"
            className="w-full justify-between border-none bg-elevation-surface-highlight sm:w-55 text-text-default-primary">
            <span className="truncate">{selectedOrganization?.label}</span>
            <ArrowDropDownIcon
              aria-hidden={true}
              focusable={false}
              className="ml-s h-4 w-4 shrink-0 text-text-default-primary"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-s"
          align="start">
          <ul
            id={listboxId}
            role="listbox"
            aria-label={t('OrganizationSwitcher.SelectOrganization')}
            className="flex flex-col gap-xs">
            {organizationOptions.map((organization) => {
              const isSelected =
                organization.value === me.selected_organization_id;

              return (
                <li key={organization.value}>
                  <Button
                    type="button"
                    variant="tertiary"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleOnValueChange(organization)}
                    className="w-full justify-start truncate normal-case text-text-default-primary">
                    {organization.label}
                  </Button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default HeaderOrganizationSwitcher;
