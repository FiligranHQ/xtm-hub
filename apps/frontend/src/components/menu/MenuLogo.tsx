import { DisplayLogo } from '@/components/ui/DisplayLogo';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export const MenuLogo = () => {
  const locale = useLocale();
  return (
    <div className="flex z-10 shrink-0 sticky top-0 h-16 border-border-light border-b bg-page-background dark:bg-background items-center px-m">
      <Link
        href={`/${locale}`}
        aria-label="XTM Hub by Filigran"
        className="flex items-center">
        <DisplayLogo className="w-40" />
      </Link>
    </div>
  );
};
