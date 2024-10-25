'use client';
import { NavigationApp } from '@/components/navigation';
import { cn } from '@/lib/utils';
import { KeyboardArrowLeftIcon } from 'filigran-icon';
import { Separator } from 'filigran-ui/clients';
import { Button, buttonVariants } from 'filigran-ui/servers';
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
  const [open, setOpen] = useLocalStorage<boolean>('menu-open', false);
  const handleOpenMenu = useCallback(
    () => setOpen((prev0pen) => !prev0pen),
    []
  );
  return (
    <aside
      className={cn(
        'mobile:hidden z-9 sticky top-[4rem] flex h-[calc(100vh-4rem)] flex-col justify-between overflow-y-auto overflow-x-hidden border-r bg-page-background py-2 duration-300 ease-in-out',
        open ? 'w-48' : 'w-16'
      )}>
      <NavigationApp open={open} />
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
