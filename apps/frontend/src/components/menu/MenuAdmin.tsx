import GuardCapacityComponent from '@/components/AdminGuard';
import { UseTranslationsProps } from '@/i18n/config';
import { cn } from '@/lib/utils';
import { APP_PATH } from '@/utils/path/constant';
import { SettingsIcon } from '@filigran/icon';
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
} from '@filigran/ui';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useDebounceValue } from 'usehooks-ts';

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
          <span className="flex w-8 shrink-0 justify-center">
            <SettingsIcon
              aria-hidden={true}
              focusable={false}
              className="h-4 w-4"
            />
          </span>
          <span className="flex-1 px-s text-left txt-default">
            {t('MenuLinks.Settings')}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-xs">
            <AdminLinks className="pl-xl ml-xs h-8 txt-sub-content" />
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const ClosedMenuAdmin = () => {
  const t = useTranslations();
  const [adminOpened, setAdminOpened] = useDebounceValue(false, 100);
  const currentPath = usePathname();
  useEffect(() => setAdminOpened(false), [currentPath, setAdminOpened]);
  const handleMouseEnter = () => setAdminOpened(true);
  const handleMouseLeave = () => setAdminOpened(false);
  return (
    <Popover
      open={adminOpened}
      onOpenChange={setAdminOpened}>
      <PopoverTrigger
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
        <Button
          variant="ghost"
          className={cn(
            'h-9 rounded-none px-m',
            currentPath.startsWith(`/${APP_PATH}/admin/`) &&
              'bg-primary/10 shadow-[inset_2px_0px] shadow-primary'
          )}
          aria-label={t('MenuLinks.SettingsLabel')}>
          <span className="flex w-8 shrink-0 justify-center">
            <SettingsIcon
              aria-hidden={true}
              focusable={false}
              className="h-4 w-4"
            />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={0}
        side="right"
        align="start"
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
        <ul className="flex-col gap-xs flex sm:w-[200px] p-s">
          <AdminLinks />
        </ul>
      </PopoverContent>
    </Popover>
  );
};

const adminLinksData = (t: UseTranslationsProps) => [
  {
    href: `/${APP_PATH}/admin/parameters`,
    label: t('MenuLinks.Parameter'),
  },
  {
    href: `/${APP_PATH}/admin/user`,
    label: t('MenuLinks.Security'),
  },
  {
    href: `/${APP_PATH}/admin/use-case`,
    label: t('MenuLinks.UseCase'),
  },
  {
    href: `/${APP_PATH}/admin/organizations`,
    label: t('MenuLinks.Organization'),
  },
  {
    href: `/${APP_PATH}/admin/service`,
    label: t('MenuLinks.Service'),
  },
  {
    href: `/${APP_PATH}/admin/opencti-trials`,
    label: t('MenuLinks.OpenCTITrial'),
    restriction: [PortalCapabilityEnum.READ_TRIALS],
  },
  {
    href: `/${APP_PATH}/admin/openaev-trials`,
    label: t('MenuLinks.OpenAEVTrial'),
    restriction: [PortalCapabilityEnum.READ_TRIALS],
  },
  {
    href: `/${APP_PATH}/admin/competitors`,
    label: t('MenuLinks.Competitor'),
    restriction: [PortalCapabilityEnum.MODIFY_COMPETITORS],
  },
  {
    href: `/${APP_PATH}/admin/news-feed`,
    label: t('MenuLinks.NewsFeed'),
    restriction: [PortalCapabilityEnum.BYPASS],
  },
];

const AdminLinks = ({ className }: { className?: string }) => {
  const t = useTranslations();
  const links = useMemo(() => adminLinksData(t), [t]);
  return (
    <>
      {links.map(({ href, label, restriction = [] }) => (
        <GuardCapacityComponent
          key={href}
          portalCapabilityRestriction={[...restriction]}>
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
const MenuAdmin = ({ open }: MenuAdminProps) => {
  return (
    <>
      <Separator className="my-s" />
      <li>{open ? <OpenedMenuAdmin /> : <ClosedMenuAdmin />}</li>
    </>
  );
};

export default MenuAdmin;
