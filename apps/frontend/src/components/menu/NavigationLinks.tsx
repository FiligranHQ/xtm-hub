import {
  NAVIGATION_ACTIVE_CLASSES,
  NAVIGATION_GRADIENT_STYLE,
  NAVIGATION_HOVER_CLASSES,
} from '@/components/menu/navigation-styles';
import {
  SectionLink,
  SectionSubLink,
} from '@/components/menu/use-navigation-type';
import { cn } from '@/lib/utils';
import { OpenInNewIcon } from '@filigran/icon';
import {
  buttonVariants,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ElementType, ReactNode } from 'react';

export const PublicSubLink = ({
  href,
  label,
  external,
  highlight,
  badge,
  tooltip,
  className,
  isSubLevel = false,
}: (SectionLink | SectionSubLink) & {
  className?: string;
  isSubLevel?: boolean;
}) => {
  const currentPath = usePathname();
  const isActive = !!href && currentPath === href;
  const sharedClassName = cn(
    buttonVariants({
      variant: 'ghost',
      className: cn(
        'flex items-center justify-between w-full h-9 rounded-none normal-case txt-sub-content text-xs font-light',
        isSubLevel ? 'pl-12' : 'pl-6',
        highlight && !isActive && 'bg-clip-text text-transparent',
        !href && 'cursor-default pointer-events-none',
        className
      ),
    }),
    isActive ? NAVIGATION_ACTIVE_CLASSES : !!href && NAVIGATION_HOVER_CLASSES
  );
  const sharedStyle =
    highlight && !isActive
      ? { backgroundImage: NAVIGATION_GRADIENT_STYLE }
      : undefined;

  const content = (
    <>
      <span className="flex items-center gap-xs">
        {external && <OpenInNewIcon className="h-3 w-3 shrink-0" />}
        {label}
      </span>
      {badge && (
        <span
          className="text-[10px] font-medium bg-clip-text text-transparent translate-y-[2px]"
          style={{ backgroundImage: NAVIGATION_GRADIENT_STYLE }}>
          {badge}
        </span>
      )}
    </>
  );

  const wrapWithTooltip = (node: ReactNode) => {
    if (!tooltip) {
      return node;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{node}</TooltipTrigger>
          <TooltipContent>
            <span>{tooltip}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (!href) {
    return wrapWithTooltip(
      <span
        className={sharedClassName}
        style={sharedStyle}>
        {content}
      </span>
    );
  }

  return wrapWithTooltip(
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

export const MenuItemIcon = ({ icon: Icon }: { icon: ElementType }) => (
  <span className="flex w-4 shrink-0 justify-center text-foreground">
    <Icon
      aria-hidden={true}
      focusable={false}
      className="h-4 w-4"
    />
  </span>
);

interface NavigationLinkMenuProps {
  open: boolean;
  href: string;
  icon: ElementType;
  text: string;
  external?: boolean;
}

export const NavigationLinkMenu = ({
  href,
  icon,
  text,
  open,
  external,
}: NavigationLinkMenuProps) => {
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
        currentPath === href
          ? NAVIGATION_ACTIVE_CLASSES
          : NAVIGATION_HOVER_CLASSES
      )}>
      <MenuItemIcon icon={icon} />
      <span className={cn('truncate', open ? 'ml-2' : 'sr-only')}>{text}</span>
    </Link>
  );
};
