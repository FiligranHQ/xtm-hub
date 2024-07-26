'use client';
import { Button, buttonVariants } from 'filigran-ui/servers';
import { Separator } from 'filigran-ui/clients';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { ElementType, FunctionComponent, useCallback, useState } from 'react';
import Logout from '@/components/logout';
import MenuUser from '@/components/menu/menu-user';
import MenuAdmin from '@/components/menu/menu-admin';
import { HomeIcon, KeyboardArrowLeftIcon } from 'filigran-icon';

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
  const Icon = icon;
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({
          variant: 'ghost',
          className: ' w-full justify-start border-none',
        })
      )}>
      <Icon className="mr-2 h-4 w-4 flex-auto flex-shrink-0 flex-grow-0" />
      <span className={cn(open ? 'opacity-100' : 'opacity-0')}>{text}</span>
    </Link>
  );
};

const Menu = () => {
  const [open, setOpen] = useState(false);
  return (
    <aside
      className={cn(
        'mt-2 flex flex-col border bg-background p-2 pt-16 duration-300 ease-in-out',
        open ? 'w-72' : 'w-16'
      )}>
      <nav>
        <ul>
          <li>
            <Button
              variant="ghost"
              onClick={useCallback(() => setOpen(!open), [])}>
              <KeyboardArrowLeftIcon
                className={cn(
                  'h-4 w-4 flex-shrink-0 flex-grow-0 p-1 duration-300 ease-in-out',
                  open ? 'rotate-0' : 'rotate-180'
                )}
              />
            </Button>
          </li>
          <li>
            <LinkMenu
              open={open}
              href={'/'}
              icon={HomeIcon}
              text={'Home'}
            />
          </li>
          <MenuUser open={open} />

          <MenuAdmin open={open} />
        </ul>
      </nav>
      <div>
        <Separator className="my-2" />
        <Logout open={open} />
      </div>
    </aside>
  );
};

export default Menu;
