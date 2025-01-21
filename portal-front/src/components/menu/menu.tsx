'use client';
import { CollapseMenuButton } from '@/components/menu/collapse-menu-button';
import { MenuLogo } from '@/components/menu/menu-logo';
import { NavigationApp } from '@/components/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from 'filigran-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ElementType, FunctionComponent, useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';

interface LinkMenuProps {
  open: boolean;
  href: string;
  icon: ElementType;
  text: string;
}

export const LinkMenu: FunctionComponent<LinkMenuProps> = ({
  href,
  icon,
  text,
  open,
}) => {
  const currentPath = usePathname();
  const Icon = icon;
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({
          variant: 'ghost',
          className: 'h-9 w-full justify-start rounded-none normal-case px-m',
        }),
        currentPath === href &&
          'bg-primary/10 shadow-[inset_2px_0px] shadow-primary'
      )}>
      <span className="flex w-8 flex-shrink-0 justify-center">
        <Icon className="h-4 w-4" />
      </span>
      <span className={cn(open ? 'ml-2' : 'sr-only')}>{text}</span>
    </Link>
  );
};

const Menu = () => {
  const [open, setOpen] = useLocalStorage<boolean>('menu-open', true);
  const handleOpenMenu = useCallback(
    () => setOpen((prev0pen) => !prev0pen),
    [setOpen]
  );
  return (
    <aside
      className={cn(
        'mobile:hidden z-20 sticky flex-shrink-0 top-0 left-0 flex h-screen flex-col overflow-y-auto overflow-x-hidden bg-page-background duration-300 ease-in-out',
        open ? 'w-48' : 'w-14'
      )}>
      <MenuLogo />
      <div className="border-r flex-1 flex-col flex justify-between">
        <NavigationApp open={open} />
        <CollapseMenuButton
          open={open}
          handleOpenMenu={handleOpenMenu}
        />
      </div>
    </aside>
  );
};

export default Menu;
