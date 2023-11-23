import { Button, buttonVariants } from '@/components/ui/button';
import {
  ChevronLeft,
  Home,
  ListChecks,
  MessagesSquare,
  Settings,
  Star,
  Users,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { ElementType, FunctionComponent, useState } from 'react';
import Logout from '@/components/logout';

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
      <span
        className={cn(
          'duration-300 ease-in-out',
          open ? 'opacity-100' : 'opacity-0'
        )}>
        {text}
      </span>
    </Link>
  );
};

const TwMenu = () => {
  const [open, setOpen] = useState(false);
  return (
    <aside
      className={cn(
        'mt-2 flex flex-col justify-between overflow-y-auto overflow-x-hidden border bg-background p-2 pt-16 duration-300 ease-in-out',
        open ? 'w-72' : 'w-16'
      )}>
      <nav>
        <ul>
          <li>
            <Button
              variant="ghost"
              onClick={() => setOpen(!open)}>
              <ChevronLeft
                className={cn(
                  'h-4 w-4 flex-shrink-0 flex-grow-0 duration-300 ease-in-out',
                  open ? 'rotate-0' : 'rotate-180'
                )}
              />
            </Button>
          </li>
          <li>
            <LinkMenu
              open={open}
              href={'/'}
              icon={Home}
              text={'Home'}
            />
          </li>
          <li>
            <LinkMenu
              open={open}
              href={'/service'}
              icon={Star}
              text={'Services'}
            />
          </li>
          <li>
            <LinkMenu
              open={open}
              href={'/about'}
              icon={ListChecks}
              text={'About'}
            />
          </li>
          <li>
            <Separator className="my-4" />
            <Accordion
              type="single"
              collapsible
              className="w-full">
              <AccordionItem
                className="border-none"
                value="item-1">
                <AccordionTrigger className="justify-normal py-2">
                  <Settings />
                  <span className="flex-1 px-2 text-left">Settings</span>
                </AccordionTrigger>
                <AccordionContent>
                  <Link
                    href={'/admin/user'}
                    className={cn(
                      buttonVariants({
                        variant: 'ghost',
                        className: 'w-full justify-start border-none text-base',
                      })
                    )}>
                    <Users className="mr-2 h-4 w-4" /> User
                  </Link>
                  <Link
                    href={'/admin/service'}
                    className={cn(
                      buttonVariants({
                        variant: 'ghost',
                        className: 'w-full justify-start border-none text-base',
                      })
                    )}>
                    <Star className="mr-2 h-4 w-4" /> Services
                  </Link>
                  <Link
                    href={'/admin/community'}
                    className={cn(
                      buttonVariants({
                        variant: 'ghost',
                        className: 'w-full justify-start border-none text-base',
                      })
                    )}>
                    <MessagesSquare className="mr-2 h-4 w-4" /> Communities
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        </ul>
      </nav>
      <div>
        <Separator className="my-2" />
        <Logout open={open} />
      </div>
    </aside>
  );
};

export default TwMenu;
