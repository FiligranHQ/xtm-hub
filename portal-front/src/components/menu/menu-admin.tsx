import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MessagesSquare, Settings, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from 'filigran-ui/servers';
import * as React from 'react';
import { FunctionComponent } from 'react';
import useGranted from '@/hooks/useGranted';

export interface MenuAdminProps {
  open: boolean;
}

const MenuAdmin: FunctionComponent<MenuAdminProps> = () => {
  if (!useGranted('ADMIN')) {
    return null;
  }
  return (
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
  );
};

export default MenuAdmin;
