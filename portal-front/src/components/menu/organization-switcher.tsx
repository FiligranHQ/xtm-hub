import { changeSelectedOrganizationMutation } from '@/components/menu/organization-switcher.graphql';
import { Portal, portalContext } from '@/components/portal-context';
import useIsMobile from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import { CityIcon, UnfoldMoreIcon } from 'filigran-icon';
import { Popover, PopoverContent, PopoverTrigger } from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { FunctionComponent, useContext, useState } from 'react';
import { useMutation } from 'react-relay';
import { organizationSwitcherMutation } from '../../../__generated__/organizationSwitcherMutation.graphql';

interface TeamSwitcherProps {
  open: boolean;
}

export const OrganizationSwitcher: FunctionComponent<TeamSwitcherProps> = ({
  open,
}) => {
  const { me } = useContext<Portal>(portalContext);
  if (!me) {
    return null;
  }

  const isMobile = useIsMobile();

  const [commitOrganizationSwitcherMutation] =
    useMutation<organizationSwitcherMutation>(
      changeSelectedOrganizationMutation
    );

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
        window.location.reload();
      },
    });
    setOpenPopover(false);
  };

  const parsedOrganization = me.organizations.map((org) => ({
    ...org,
    name: org.name === me.email ? 'Personal space' : org.name,
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
            aria-label="Select a team"
            className={cn('w-full justify-between rounded-none')}>
            <span className={'flex w-8 flex-shrink-0 justify-center'}>
              <CityIcon className="h-4 w-4" />
            </span>
            {open && (
              <>
                <span className="ml-s text-left truncate inline-block">
                  {selectedOrganisation?.name}
                </span>
                <UnfoldMoreIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
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
                onClick={() => handleSelectOrganisation(group.id)}
                className={cn(
                  'flex items-center w-full justify-between txt-sub-content rounded-none',
                  me.selected_organization_id === group.id &&
                    'bg-primary/10 shadow-[inset_2px_0px] shadow-primary'
                )}>
                <CityIcon className="h-4 w-4" /> {group.name}
              </Button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
