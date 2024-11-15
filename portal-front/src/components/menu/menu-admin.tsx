import GuardCapacityComponent from '@/components/admin-guard';
import useGranted from '@/hooks/useGranted';
import { cn } from '@/lib/utils';
import { RESTRICTION } from '@/utils/constant';
import { SettingsIcon } from 'filigran-icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'filigran-ui/clients';
import { Button, buttonVariants } from 'filigran-ui/servers';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FunctionComponent, useEffect, useState } from 'react';

export interface MenuAdminProps {
  open: boolean;
}
const OpenedMenuAdmin = () => (
  <Accordion
    type="single"
    collapsible
    className="w-full">
    <AccordionItem
      className="border-none"
      value="item-1">
      <AccordionTrigger className="h-9 px-4 py-2 hover:bg-hover hover:no-underline">
        <span className="flex w-8 flex-shrink-0 justify-center">
          <SettingsIcon className="h-4 w-4" />
        </span>
        <span className="flex-1 px-2 text-left txt-default">Settings</span>
      </AccordionTrigger>
      <AccordionContent>
        <ul className="space-y-xs">
          <AdminLinks className="pl-12 ml-1 h-8 txt-sub-content" />
        </ul>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

const ClosedMenuAdmin = () => {
  const [adminOpened, setAdminOpened] = useState<boolean>(false);
  const currentPath = usePathname();
  useEffect(() => {
    setAdminOpened(false);
  }, [currentPath]);
  return (
    <Popover
      open={adminOpened}
      onOpenChange={setAdminOpened}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'h-9 rounded-none',
            currentPath.startsWith('/admin/') &&
              'bg-primary/10 shadow-[inset_2px_0px] shadow-primary'
          )}
          aria-label="Settings menu">
          <span className="flex w-8 flex-shrink-0 justify-center">
            <SettingsIcon className="h-4 w-4" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={0}
        side="right"
        align="start"
        asChild>
        <ul className="flex-col gap-xs flex sm:w-[200px] p-s">
          <AdminLinks />
        </ul>
      </PopoverContent>
    </Popover>
  );
};
const adminLinksData = [
  {
    href: '/admin/user',
    label: 'Users',
    restriction: [RESTRICTION.CAPABILITY_FRT_MANAGE_USER],
  },
  {
    href: '/admin/organizations',
    label: 'Organizations',
  },
];

const AdminLinks = ({ className }: { className?: string }) => (
  <>
    {adminLinksData.map(({ href, label, restriction = [] }) => (
      <GuardCapacityComponent
        key={href}
        displayError={false}
        capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS, ...restriction]}>
        <li>
          <AdminButton
            className={className}
            href={href}
            label={label}
          />
        </li>
      </GuardCapacityComponent>
    ))}
  </>
);

const AdminButton = ({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) => {
  const currentPath = usePathname();
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({
          variant: 'ghost',
          className: cn(
            'flex items-center w-full justify-between txt-sub-content rounded-none normal-case',
            className
          ),
        }),
        currentPath === href &&
          'bg-primary/10 shadow-[inset_2px_0px] shadow-primary'
      )}>
      {label}
    </Link>
  );
};
const MenuAdmin: FunctionComponent<MenuAdminProps> = ({ open }) => {
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

  if (
    useGrantedBYPASS ||
    useGrantedFRT_MANAGE_USER ||
    useGrantedFRT_MANAGE_SETTINGS ||
    useGrantedBCK_MANAGE_SERVICES
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
