'use client';

import PublicNavigation from '@/components/menu/PublicNavigation';
import { MenuIcon } from '@filigran/icon';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@filigran/ui/clients';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export const PublicMobileMenuButton = () => {
  const [open, setOpen] = useState(false);
  const currentPath = usePathname();
  const t = useTranslations();
  // Legitimate effect: close the menu on route change.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [currentPath]);

  return (
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
          <SheetTitle>{t('Header.BrandName')}</SheetTitle>
        </SheetHeader>
        <div
          className="h-full overflow-y-auto"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('a')) {
              setOpen(false);
            }
          }}>
          <PublicNavigation open={true} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
