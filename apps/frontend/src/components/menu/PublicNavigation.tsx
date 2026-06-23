'use client';

import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { cn } from '@/lib/utils';
import { OpenInNewIcon } from '@filigran/icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  buttonVariants,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@filigran/ui';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ElementType, useEffect } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import {
  buildBottomLinks,
  buildSections,
  type SectionConfig,
  type SectionLink,
} from './public-navigation.config';

const ACTIVE_CLASSES =
  'bg-primary/10 shadow-[inset_2px_0px] shadow-primary text-primary';
const HOVER_CLASSES = 'hover:shadow-[inset_2px_0px] hover:shadow-white';
const GRADIENT_STYLE =
  'linear-gradient(to right, hsl(var(--blue-default)), hsl(var(--turquoise-300)))';

const MenuItemIcon = ({ icon: Icon }: { icon: ElementType }) => (
  <span className="flex w-4 shrink-0 justify-center text-foreground">
    <Icon
      aria-hidden={true}
      focusable={false}
      className="h-4 w-4"
    />
  </span>
);

interface PublicLinkMenuProps {
  open: boolean;
  href: string;
  icon: ElementType;
  text: string;
  external?: boolean;
}

const PublicLinkMenu = ({
  href,
  icon,
  text,
  open,
  external,
}: PublicLinkMenuProps) => {
  const currentPath = usePathname();
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn(
        buttonVariants({
          variant: 'ghost',
          className:
            'h-9 w-full justify-start rounded-none normal-case pl-5 pr-s text-xs font-light',
        }),
        currentPath === href ? ACTIVE_CLASSES : HOVER_CLASSES
      )}>
      <MenuItemIcon icon={icon} />
      <span className={cn('truncate', open ? 'ml-2' : 'sr-only')}>{text}</span>
    </Link>
  );
};

interface PublicNavigationProps {
  open: boolean;
}

const PublicSubLink = ({
  href,
  label,
  external,
  highlight,
  badge,
  className,
}: SectionLink & { className?: string }) => {
  const currentPath = usePathname();
  const isActive = !!href && currentPath === href;
  const sharedClassName = cn(
    buttonVariants({
      variant: 'ghost',
      className: cn(
        'flex items-center justify-between w-full h-9 rounded-none normal-case txt-sub-content text-xs font-light',
        highlight && !isActive && 'bg-clip-text text-transparent',
        !href && 'cursor-default pointer-events-none',
        className
      ),
    }),
    isActive ? ACTIVE_CLASSES : !!href && HOVER_CLASSES
  );
  const sharedStyle =
    highlight && !isActive ? { backgroundImage: GRADIENT_STYLE } : undefined;
  const content = (
    <>
      <span className="flex items-center gap-xs">
        {external && <OpenInNewIcon className="h-3 w-3 shrink-0" />}
        {label}
      </span>
      {badge && (
        <span
          className="text-[10px] font-medium bg-clip-text text-transparent translate-y-[2px]"
          style={{ backgroundImage: GRADIENT_STYLE }}>
          {badge}
        </span>
      )}
    </>
  );

  if (!href) {
    return (
      <span
        className={sharedClassName}
        style={sharedStyle}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={sharedClassName}
      style={sharedStyle}>
      {content}
    </Link>
  );
};

const OpenedSection = ({ section }: { section: SectionConfig }) => {
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

const ClosedSection = ({ section }: { section: SectionConfig }) => {
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
              : HOVER_CLASSES
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

const LinkedSection = ({
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
        isActive ? ACTIVE_CLASSES : HOVER_CLASSES
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

const PublicNavigation = ({ open }: PublicNavigationProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const isCustomViewsEnabled = useIsFeatureEnabled(
    FeatureFlagEnum.OPENCTI_CUSTOM_VIEWS
  );
  const sections = buildSections(t, locale, isCustomViewsEnabled);
  const bottomLinks = buildBottomLinks(t, locale);

  return (
    <nav className="flex-1 min-h-0 pt-s overflow-y-auto">
      {open ? (
        <Accordion
          type="multiple"
          className="w-full">
          {sections.map((section) =>
            section.href ? (
              <LinkedSection
                key={section.key}
                section={section}
                open={true}
              />
            ) : (
              <OpenedSection
                key={section.key}
                section={section}
              />
            )
          )}
        </Accordion>
      ) : (
        <ul>
          {sections.map((section) => (
            <li key={section.key}>
              {section.href ? (
                <LinkedSection
                  section={section}
                  open={false}
                />
              ) : (
                <ClosedSection section={section} />
              )}
            </li>
          ))}
        </ul>
      )}

      <Separator className="my-s" />
      <ul className="space-y-s pb-s">
        {bottomLinks.map((link) => (
          <li key={link.key}>
            <PublicLinkMenu
              open={open}
              href={link.href}
              icon={link.icon}
              text={link.label}
              external={link.external}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default PublicNavigation;
