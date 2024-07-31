import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import * as React from 'react';
import { FunctionComponent, useCallback, useState } from 'react';
import useGranted from '@/hooks/useGranted';
import {
  ExternalReferenceIcon,
  ForumIcon,
  GradeIcon,
  GroupIcon,
  OrganizationIcon,
  SettingsIcon,
} from 'filigran-icon';
import { useRouter } from 'next/navigation';
import { RESTRICTION } from '@/utils/constant';

export interface MenuAdminProps {
  open: boolean;
}

const MenuAdmin: FunctionComponent<MenuAdminProps> = ({ open }) => {
  const [adminOpened, setAdminOpened] = useState<boolean>(false);
  const router = useRouter();

  const routeTo = (link: string) => {
    router.replace(link);
    setAdminOpened(false);
  };

  const useGrantedBYPASS = useGranted(RESTRICTION.CAPABILITY_BYPASS);
  const useGrantedFRT_MANAGE_USER = useGranted(
    RESTRICTION.CAPABILITY_FRT_MANAGE_USER
  );
  const useGrantedFRT_MANAGE_SETTINGS = useGranted(
    RESTRICTION.CAPABILITY_FRT_MANAGE_SETTINGS
  );
  const useGrantedBCK_MANAGE_SERVICES = useGranted(
    RESTRICTION.CAPABILITY_BCK_MANAGE_SERVICES
  );
  const useGrantedBCK_MANAGE_COMMUNITIES = useGranted(
    RESTRICTION.CAPABILITY_BCK_MANAGE_COMMUNITIES
  );

  const AdminLinks = () => (
    <>
      <Button
        onClick={useCallback(() => routeTo('/admin/user'), [])}
        variant={'ghost'}
        className={'w-full justify-start border-none text-base'}>
        <GroupIcon className="mr-2 h-4 w-4" /> User
      </Button>
      <Button
        onClick={useCallback(() => routeTo('/admin/service'), [])}
        variant={'ghost'}
        className={'w-full justify-start border-none text-base'}>
        <GradeIcon className="mr-2 h-4 w-4" /> Services
      </Button>
      <Button
        onClick={useCallback(() => routeTo('/admin/community'), [])}
        variant={'ghost'}
        className={'w-full justify-start border-none text-base'}>
        <ForumIcon className="mr-2 h-4 w-4" /> Communities
      </Button>
      <Button
        onClick={useCallback(() => routeTo('/admin/organizations'), [])}
        variant={'ghost'}
        className={'w-full justify-start border-none text-base'}>
        <OrganizationIcon className="mr-2 h-4 w-4" /> Organizations
      </Button>
      <Button
        onClick={useCallback(() => routeTo('/admin/subcriptions'), [])}
        variant={'ghost'}
        className={'w-full justify-start border-none text-base'}>
        <ExternalReferenceIcon className="mr-2 h-4 w-4" /> Subscriptions
      </Button>
    </>
  );

  const OpenedMenuAdmin = () => (
    <Accordion
      type="single"
      collapsible
      className="w-full">
      <AccordionItem
        className="border-none"
        value="item-1">
        <AccordionTrigger className="justify-normal px-4 py-2">
          <SettingsIcon className="h-4 w-4" />
          <span className="flex-1 px-2 text-left">Settings</span>
        </AccordionTrigger>
        <AccordionContent>
          <AdminLinks />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  const ClosedMenuAdmin = () => (
    <Popover
      open={adminOpened}
      onOpenChange={setAdminOpened}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Settings menu">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start">
        <AdminLinks />
      </PopoverContent>
    </Popover>
  );

  if (
    useGrantedBYPASS ||
    useGrantedFRT_MANAGE_USER ||
    useGrantedFRT_MANAGE_SETTINGS ||
    useGrantedBCK_MANAGE_SERVICES ||
    useGrantedBCK_MANAGE_COMMUNITIES
  ) {
    return (
      <>
        <li>
          <Separator className="my-2" />
          {open ? <OpenedMenuAdmin /> : <ClosedMenuAdmin />}
        </li>
      </>
    );
  }

  return null;
};

export default MenuAdmin;
