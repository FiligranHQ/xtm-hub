import {
  NAVIGATION_ACTIVE_CLASSES,
  NAVIGATION_HOVER_CLASSES,
} from '@/components/menu/navigation-styles';
import { MenuItemIcon, PublicSubLink } from '@/components/menu/NavigationLinks';
import type { SectionConfig } from '@/components/menu/use-public-navigation';
import { cn } from '@/lib/utils';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  buttonVariants,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@filigran/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useDebounceValue } from 'usehooks-ts';

export const LinkedSection = ({
  section,
  open,
}: {
  section: SectionConfig;
  open: boolean;
}) => {
  const Icon = section.icon;
  const currentPath = usePathname();
  const isActive = section.href
    ? currentPath === section.href
    : currentPath.startsWith(section.pathPrefix);
  return (
    <Link
      href={section.href ?? section.pathPrefix}
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'h-9 w-full justify-start rounded-none normal-case pl-5 font-normal',
        isActive ? NAVIGATION_ACTIVE_CLASSES : NAVIGATION_HOVER_CLASSES
      )}
      aria-label={section.label}>
      <MenuItemIcon icon={Icon} />
      {open && (
        <span className="flex-1 px-s text-left text-foreground text-sm font-light truncate">
          {section.label}
        </span>
      )}
    </Link>
  );
};

export const ClosedSection = ({ section }: { section: SectionConfig }) => {
  const [popoverOpen, setPopoverOpen] = useDebounceValue(false, 100);
  const currentPath = usePathname();
  const Icon = section.icon;

  useEffect(() => setPopoverOpen(false), [currentPath, setPopoverOpen]);

  const handleMouseEnter = () => setPopoverOpen(true);
  const handleMouseLeave = () => setPopoverOpen(false);

  return (
    <Popover
      open={popoverOpen}
      onOpenChange={setPopoverOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
        <Button
          variant="ghost"
          className={cn(
            'h-9 w-full justify-start rounded-none pl-5 cursor-pointer',
            currentPath.startsWith(section.pathPrefix)
              ? 'bg-primary/10 shadow-[inset_2px_0px] shadow-primary'
              : NAVIGATION_HOVER_CLASSES
          )}
          aria-label={section.label}>
          <MenuItemIcon icon={Icon} />
        </Button>
      </PopoverTrigger>
      {section.links.length > 0 && (
        <PopoverContent
          sideOffset={0}
          side="right"
          align="start"
          asChild
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          <ul className="flex flex-col gap-xs w-50 p-s">
            {section.links.map((link) => (
              <li key={link.label}>
                <PublicSubLink {...link} />
              </li>
            ))}
          </ul>
        </PopoverContent>
      )}
    </Popover>
  );
};

export const OpenedSection = ({ section }: { section: SectionConfig }) => {
  const Icon = section.icon;
  return (
    <AccordionItem
      className="border-none"
      value={section.key}>
      <AccordionTrigger className="h-9 pl-5 py-xs cursor-pointer hover:bg-hover hover:no-underline font-normal hover:shadow-[inset_2px_0px] hover:shadow-white">
        <MenuItemIcon icon={Icon} />
        <span className="flex-1 px-s text-left text-foreground text-sm font-light truncate">
          {section.label}
        </span>
      </AccordionTrigger>
      {section.links.length > 0 && (
        <AccordionContent>
          <ul className="space-y-xs">
            {section.links.map((link) => (
              <li key={link.label}>
                <PublicSubLink
                  className="pl-xl ml-xs"
                  {...link}
                />
              </li>
            ))}
          </ul>
        </AccordionContent>
      )}
    </AccordionItem>
  );
};
