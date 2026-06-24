import { DisplayLogo } from '@/components/ui/DisplayLogo';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';
import Link from 'next/link';

interface MenuLogoProps {
  withDarkBackground?: boolean;
}

export const MenuLogo = ({ withDarkBackground = true }: MenuLogoProps) => {
  const locale = useLocale();
  return (
    <div
      className={cn(
        'flex z-10 shrink-0 sticky top-0 h-16 border-border-light border-b bg-page-background items-center px-m',
        withDarkBackground && 'dark:bg-background'
      )}>
      <Link
        href={`/${locale}`}
        aria-label="XTM Hub by Filigran"
        className="flex items-center">
        <DisplayLogo className="w-40" />
      </Link>
    </div>
  );
};
