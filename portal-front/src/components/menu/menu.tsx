'use client';
import { Button, buttonVariants } from 'filigran-ui/servers';
import { Separator } from 'filigran-ui/clients';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { ElementType, FunctionComponent, useCallback, useState } from 'react';
import MenuUser from '@/components/menu/menu-user';
import MenuAdmin from '@/components/menu/menu-admin';
import { HomeIcon, KeyboardArrowLeftIcon } from 'filigran-icon';
import { usePathname } from 'next/navigation';

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
          className: 'h-9 w-full justify-start rounded-none',
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
  const [open, setOpen] = useState(false);
  const handleOpenMenu = useCallback(
    () => setOpen((prev0pen) => !prev0pen),
    []
  );
  return (
    <aside
      className={cn(
        'z-9 sticky top-[4rem] flex h-[calc(100vh-4rem)] flex-col justify-between overflow-y-auto overflow-x-hidden border-r bg-background bg-white py-2 duration-300 ease-in-out',
        open ? 'w-48' : 'w-16'
      )}>
      <nav>
        <ul>
          <li>
            <LinkMenu
              open={open}
              href={'/'}
              icon={HomeIcon}
              text={'Home'}
            />
          </li>
          <Separator className="my-2" />
          <MenuUser open={open} />
          <Separator className="my-2" />
          <MenuAdmin open={open} />
        </ul>
      </nav>
      <div>
        <Separator className="my-2" />
        <Button
          variant="ghost"
          className="h-9 w-full justify-start border-none"
          onClick={handleOpenMenu}>
          <span className="flex w-8 flex-shrink-0 justify-center">
            <KeyboardArrowLeftIcon
              className={cn(
                'h-4 w-4 p-1 duration-300 ease-in-out',
                open ? 'rotate-0' : 'rotate-180'
              )}
            />
          </span>

          <span className={cn(open ? 'ml-2' : 'sr-only')}>Collapse</span>
        </Button>
      </div>
    </aside>
  );
};

export default Menu;