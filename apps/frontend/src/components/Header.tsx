'use client';

import { LogoutMutation } from '@/components/logout.graphql';
import { PortalContext } from '@/components/me/AppPortalContext';
import { NavigationApp } from '@/components/Navigation';
import { NotificationButton } from '@/components/notification/NotificationButton';
import { DisplayTrialList } from '@/components/service/trial-instances/display-trial-header/DisplayTrialList';
import { DisplayLogo } from '@/components/ui/DisplayLogo';
import { IconActions, IconActionsItem } from '@/components/ui/IconActions';

import { cn } from '@/lib/utils';
import { APP_PATH } from '@/utils/path/constant';

import { CloseIcon, MenuIcon } from '@filigran/icon';
import { Avatar } from '@filigran/ui';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@filigran/ui/clients';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import Logo from '@public/logo.svg';
import { usePathname, useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-relay';

// Component interface
interface HeaderComponentProps {
  displayLogo?: boolean;
}

const HeaderComponent = ({ displayLogo }: HeaderComponentProps) => {
  const { me, hasOrganizationCapability } = useContext(PortalContext);
  const [open, setOpen] = useState(false);
  const currentPath = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const [commitLogoutMutation] = useMutation(LogoutMutation);
  // Legitimate effect: close the menu on route change.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [currentPath]);

  const canManageUser =
    hasOrganizationCapability &&
    (hasOrganizationCapability(
      OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION
    ) ||
      hasOrganizationCapability(OrganizationCapabilityEnum.MANAGE_ACCESS));

  return (
    <header
      id="app-header"
      className={cn(
        'sticky top-0 z-[20] flex h-16 w-full shrink-0 items-center border-b bg-page-background dark:bg-background px-4 justify-between',
        displayLogo ? '' : 'sm:justify-end'
      )}>
      <DisplayLogo
        className={cn(
          'text-primary mr-2 h-full py-l',
          displayLogo ? '' : 'sm:hidden'
        )}
      />

      <div className="mobile:hidden flex items-center gap-s">
        <DisplayTrialList />
        {canManageUser && <NotificationButton />}
        <IconActions
          className="rounded-full"
          icon={
            <>
              <div className="my-auto size-10 [&_img]:object-cover">
                <Avatar src={me?.picture || undefined} />
              </div>
              <span className="sr-only">{t('MenuUser.ToggleUser')}</span>
            </>
          }>
          <IconActionsItem asChild>
            <Link href={`/${APP_PATH}/profile`}>{t('MenuUser.Profile')}</Link>
          </IconActionsItem>
          <IconActionsItem
            onClick={() => {
              commitLogoutMutation({
                variables: {},
                updater: (store) => {
                  store.invalidateStore();
                },
                onCompleted() {
                  router.push('/');
                  router.refresh();
                },
              });
            }}>
            {t('LoginPage.Logout')}
          </IconActionsItem>
        </IconActions>
      </div>
      <div className="flex gap-xs items-center sm:hidden">
        <Sheet
          open={open}
          onOpenChange={setOpen}>
          <SheetTrigger>
            <MenuIcon
              aria-hidden={true}
              focusable={false}
              className="h-6 w-6"
            />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader className="flex flex-row justify-between pl-l">
              <div className="flex items-center gap-s">
                <Logo
                  className="h-8 w-8"
                  aria-hidden={true}
                />
                <SheetTitle>{t('Header.BrandName')}</SheetTitle>
              </div>
              <SheetClose>
                <CloseIcon
                  aria-hidden={true}
                  focusable={false}
                  className="h-4 w-4 mr-xl"
                />
                <span className="sr-only">{t('Header.CloseMenu')}</span>
              </SheetClose>
            </SheetHeader>
            <div className="flex flex-1 flex-col h-full justify-between">
              <NavigationApp open={true} />
              <div className="pb-xl flex flex-col text-center">
                <Link href={`/${APP_PATH}/profile`}>
                  <div className="w-full p-2 hover:bg-hover rounded">
                    {t('MenuUser.Profile')}
                  </div>
                </Link>
                <div
                  className="p-2 hover:bg-hover rounded cursor-pointer"
                  onClick={() => {
                    commitLogoutMutation({
                      variables: {},
                      updater: (store) => {
                        store.invalidateStore();
                      },
                      onCompleted() {
                        router.push('/');
                        router.refresh();
                      },
                    });
                  }}>
                  {t('LoginPage.Logout')}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

// Component export
export default HeaderComponent;
