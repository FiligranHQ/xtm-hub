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
import { ElementType, FunctionComponent, useCallback, useState } from 'react';
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

const AdminButton = ({
  onClick,
  icon: Icon,
  label,
  className,
}: {
  onClick: () => void;
  icon: ElementType;
  label: string;
  className?: string;
}) => (
  <Button
    onClick={onClick}
    variant="ghost"
    className={`h-9 w-full justify-start border-none ${className}`}>
    <span className="ml-1 mr-2 flex w-8 justify-center">
      <Icon className="h-4 w-4" />{' '}
    </span>
    {label}
  </Button>
);

const MenuAdmin: FunctionComponent<MenuAdminProps> = ({ open }) => {
  const [adminOpened, setAdminOpened] = useState<boolean>(false);
  const router = useRouter();

  const routeTo = useCallback((link: string) => {
    router.replace(link);
    setAdminOpened(false);
  }, []);

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

  const AdminLinks = ({ className }: { className?: string }) => (
    <>
      <AdminButton
        className={className}
        onClick={() => routeTo('/admin/user')}
        icon={GroupIcon}
        label="User"
      />
      <AdminButton
        className={className}
        onClick={() => routeTo('/admin/service')}
        icon={GradeIcon}
        label="Services"
      />
      <AdminButton
        className={className}
        onClick={() => routeTo('/admin/community')}
        icon={ForumIcon}
        label="Communities"
      />
      <AdminButton
        className={className}
        onClick={() => routeTo('/admin/organizations')}
        icon={OrganizationIcon}
        label="Organizations"
      />
      <AdminButton
        className={className}
        onClick={() => routeTo('/admin/subcriptions')}
        icon={ExternalReferenceIcon}
        label="Subscriptions"
      />
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
        <AccordionTrigger className="h-9 justify-normal px-4 py-2">
          <span className="flex w-8 flex-shrink-0 justify-center">
            <SettingsIcon className="h-4 w-4" />
          </span>
          <span className="flex-1 px-2 text-left txt-default">Settings</span>
        </AccordionTrigger>
        <AccordionContent>
          <AdminLinks className="h-8 txt-sub-content" />
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
          className="h-9"
          aria-label="Settings menu">
          <span className="flex w-8 flex-shrink-0 justify-center">
            <SettingsIcon className="h-4 w-4" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-min"
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
        <li>{open ? <OpenedMenuAdmin /> : <ClosedMenuAdmin />}</li>
      </>
    );
  }

  return null;
};

export default MenuAdmin;
