import GuardCapacityComponent from '@/components/admin-guard';
import useGranted from '@/hooks/useGranted';
import { UseTranslationsProps } from '@/i18n/config';
import { cn } from '@/lib/utils';
import { RESTRICTION } from '@/utils/constant';
import { SettingsIcon } from 'filigran-icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  buttonVariants,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FunctionComponent, useEffect, useState } from 'react';

export interface MenuAdminProps {
  open: boolean;
}
const OpenedMenuAdmin = () => {
  const t = useTranslations();
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full">
      <AccordionItem
        className="border-none"
        value="item-1">
        <AccordionTrigger className="h-9 px-m py-s hover:bg-hover hover:no-underline">
          <span className="flex w-8 flex-shrink-0 justify-center">
            <SettingsIcon className="h-4 w-4" />
          </span>
          <span className="flex-1 px-s text-left txt-default">
            {t('MenuLinks.Settings')}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-xs">
            <AdminLinks className="pl-12 ml-xs h-8 txt-sub-content" />
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const ClosedMenuAdmin = () => {
  const t = useTranslations();
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
            'h-9 rounded-none px-m',
            currentPath.startsWith('/admin/') &&
              'bg-primary/10 shadow-[inset_2px_0px] shadow-primary'
          )}
          aria-label={t('MenuLinks.SettingsLabel')}>
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

const adminLinksData = (t: UseTranslationsProps) => [
  {
    href: '/admin/user',
    label: t('MenuLinks.Users'),
    restriction: [RESTRICTION.CAPABILITY_FRT_MANAGE_USER],
  },
  {
    href: '/admin/organizations',
    label: t('MenuLinks.Organizations'),
  },
  {
    href: '/admin/service',
    label: t('MenuLinks.Services'),
  },
];

const AdminLinks = ({ className }: { className?: string }) => {
  const t = useTranslations();
  return (
    <>
      {adminLinksData(t).map(({ href, label, restriction = [] }) => (
        <GuardCapacityComponent
          key={href}
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
};

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
  if (useGrantedBYPASS) {
    return (
      <>
        <Separator className="my-s" />
        <li>{open ? <OpenedMenuAdmin /> : <ClosedMenuAdmin />}</li>
      </>
    );
  }

  return null;
};

export default MenuAdmin;
