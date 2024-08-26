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
import * as React from 'react';
import { ElementType, FunctionComponent, useEffect, useState } from 'react';
import useGranted from '@/hooks/useGranted';
import {
  ExternalReferenceIcon,
  ForumIcon,
  GradeIcon,
  GroupIcon,
  OrganizationIcon,
  SettingsIcon,
} from 'filigran-icon';
import { usePathname } from 'next/navigation';
import { RESTRICTION } from '@/utils/constant';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
      <AccordionTrigger className="h-9 justify-normal px-4 py-2">
        <span className="flex w-8 flex-shrink-0 justify-center">
          <SettingsIcon className="h-4 w-4" />
        </span>
        <span className="flex-1 px-2 text-left txt-default">Backoffice</span>
      </AccordionTrigger>
      <AccordionContent>
        <AdminLinks className="h-8 txt-sub-content" />
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
        className="w-min border-border-light"
        side="right"
        align="start">
        <AdminLinks className="pl-0" />
      </PopoverContent>
    </Popover>
  );
};
const adminLinksData = [
  { href: '/admin/user', icon: GroupIcon, label: 'User' },
  { href: '/admin/service', icon: GradeIcon, label: 'Services' },
  { href: '/admin/community', icon: ForumIcon, label: 'Communities' },
  {
    href: '/admin/organizations',
    icon: OrganizationIcon,
    label: 'Organizations',
  },
  {
    href: '/admin/subcriptions',
    icon: ExternalReferenceIcon,
    label: 'Subscriptions',
  },
];

const AdminLinks = ({ className }: { className?: string }) => (
  <>
    {adminLinksData.map(({ href, icon, label }) => (
      <AdminButton
        key={href}
        className={className}
        href={href}
        icon={icon}
        label={label}
      />
    ))}
  </>
);

const AdminButton = ({
  href,
  icon: Icon,
  label,
  className,
}: {
  href: string;
  icon: ElementType;
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
            'h-9 w-full justify-start rounded-none border-none',
            className
          ),
        }),
        currentPath === href &&
          'bg-primary/10 shadow-[inset_2px_0px] shadow-primary'
      )}>
      <span className="ml-1 mr-2 flex w-8 flex-shrink-0 justify-center">
        <Icon className="h-4 w-4" />
      </span>
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
  const useGrantedBCK_MANAGE_COMMUNITIES = useGranted(
    RESTRICTION.CAPABILITY_BCK_MANAGE_COMMUNITIES
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
