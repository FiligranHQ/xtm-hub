'use client';

import I18nSelect from '@/components/i18n-select';
import { LogoutMutation } from '@/components/logout.graphql';
import { PortalContext } from '@/components/me/app-portal-context';
import { NavigationApp } from '@/components/navigation';
import { DisplayLogo } from '@/components/ui/display-logo';
import { IconActions, IconActionsItem } from '@/components/ui/icon-actions';
import { cn, isDevelopment } from '@/lib/utils';
import { APP_PATH } from '@/utils/path/constant';

import { NotificationButton } from '@/components/notification/notification-button';
import { DisplayTrialList } from '@/components/service/trial-instances/display-trial-header/display-trial-list';
import { MenuIcon } from '@filigran/icon';
import { Avatar } from '@filigran/ui';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@filigran/ui/clients';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-relay';
import AskArianeButton from './ariane/ask-ariane-button';

// Component interface
interface HeaderComponentProps {
  displayLogo?: boolean;
}

const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = ({
  displayLogo,
}) => {
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
      className={cn(
        'sticky top-0 z-[20] flex h-16 w-full flex-shrink-0 items-center border-b bg-page-background dark:bg-background px-4 justify-between',
        displayLogo ? '' : 'sm:justify-end'
      )}>
      <DisplayLogo
        className={cn(
          'text-primary mr-2 h-full py-l',
          displayLogo ? '' : 'sm:hidden'
        )}
      />

      <div className="mobile:hidden flex items-center gap-s">
        <AskArianeButton />
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
        {isDevelopment() && (
          <>
            <I18nSelect />
          </>
        )}
      </div>
      <div className="flex gap-xs items-center sm:hidden">
        {isDevelopment() && (
          <>
            <I18nSelect />
          </>
        )}
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
            <SheetHeader>
              <SheetTitle>Filigran</SheetTitle>
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
