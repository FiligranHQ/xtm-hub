import { DisplayLogo } from '@/components/ui/DisplayLogo';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MenuLogoProps {
  withDarkBackground?: boolean;
  href: string;
}

export const MenuLogo = ({
  withDarkBackground = true,
  href,
}: MenuLogoProps) => {
  return (
    <div
      className={cn(
        'flex z-10 shrink-0 sticky top-0 h-16 bg-page-background items-center px-m',
        withDarkBackground && 'dark:bg-background'
      )}>
      <Link
        href={href}
        aria-label="XTM Hub by Filigran"
        className="flex items-center">
        <DisplayLogo className="w-40" />
      </Link>
    </div>
  );
};
