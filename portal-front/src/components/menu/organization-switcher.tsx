import { Portal, portalContext } from '@/components/me/portal-context';
import useIsMobile from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import { organizationSwitcherMutation } from '@generated/organizationSwitcherMutation.graphql';
import { CityIcon, UnfoldMoreIcon } from 'filigran-icon';
import { Button, Popover, PopoverContent, PopoverTrigger } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FunctionComponent, useContext, useState } from 'react';
import { graphql, useMutation } from 'react-relay';

interface TeamSwitcherProps {
  open: boolean;
}

const changeSelectedOrganizationMutation = graphql`
  mutation organizationSwitcherMutation($organization_id: ID!) {
    changeSelectedOrganization(organization_id: $organization_id) {
      id
      selected_organization_id
    }
  }
`;

export const OrganizationSwitcher: FunctionComponent<TeamSwitcherProps> = ({
  open,
}) => {
  const router = useRouter();
  const { me } = useContext<Portal>(portalContext);
  if (!me) {
    return null;
  }

  const isMobile = useIsMobile();

  const [commitOrganizationSwitcherMutation] =
    useMutation<organizationSwitcherMutation>(
      changeSelectedOrganizationMutation
    );

  const t = useTranslations();
  const [openPopover, setOpenPopover] = useState(false);
  const handleSelectOrganisation = (organization_id: string) => {
    commitOrganizationSwitcherMutation({
      variables: {
        organization_id,
      },
      updater: (store) => {
        store.invalidateStore();
      },
      onCompleted: () => {
        router.push('/');
      },
    });
    setOpenPopover(false);
  };

  const parsedOrganization = me.organizations.map((org) => ({
    ...org,
    name:
      org.name === me.email
        ? t('OrganizationSwitcher.PersonalSpace')
        : org.name,
  }));
  const selectedOrganisation = parsedOrganization.find(
    ({ id }) => me.selected_organization_id === id
  );

  return (
    <Popover
      open={openPopover}
      onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <div className=" pb-s ">
          <Button
            variant="ghost"
            role="combobox"
            aria-label={t('OrganizationSwitcher.SelectOrganization')}
            className={cn(
              'px-m w-full justify-between rounded-none normal-case'
            )}>
            <span className={'flex w-8 flex-shrink-0 justify-center'}>
              <CityIcon
                aria-hidden={true}
                focusable={false}
                className="h-4 w-4"
              />
            </span>
            {open && (
              <>
                <span className="sr-only">
                  {t('OrganizationSwitcher.SelectedOrganization')}
                </span>
                <span className="ml-s text-left truncate inline-block">
                  {selectedOrganisation?.name}
                </span>
                <UnfoldMoreIcon
                  aria-hidden={true}
                  focusable={false}
                  className="ml-auto h-4 w-4 shrink-0 opacity-50"
                />
              </>
            )}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={0}
        side={isMobile ? 'bottom' : 'right'}
        align="start"
        asChild>
        <ul className="flex-col gap-xs flex sm:w-[200px] p-s">
          {parsedOrganization.map((group) => (
            <li key={group.id}>
              <Button
                variant="ghost"
                aria-label={t('OrganizationSwitcher.SelectedOrganization')}
                onClick={() => handleSelectOrganisation(group.id)}
                className={cn(
                  'flex items-center w-full justify-between txt-sub-content rounded-none normal-case',
                  me.selected_organization_id === group.id &&
                    'bg-primary/10 shadow-[inset_2px_0px] shadow-primary'
                )}>
                {group.name}
              </Button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
