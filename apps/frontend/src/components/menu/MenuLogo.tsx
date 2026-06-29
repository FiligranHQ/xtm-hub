import { DisplayLogo } from '@/components/ui/DisplayLogo';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { cn } from '@/lib/utils';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import Link from 'next/link';

interface MenuLogoProps {
  withDarkBackground?: boolean;
  href: string;
}

export const MenuLogo = ({
  withDarkBackground = true,
  href,
}: MenuLogoProps) => {
  const isHomePageV2Enabled = useIsFeatureEnabled(FeatureFlagEnum.HOME_PAGE_V2);

  return (
    <div
      className={cn(
        'flex z-10 shrink-0 sticky top-0 h-16 bg-page-background items-center px-m',
        withDarkBackground && !isHomePageV2Enabled
          ? 'dark-bg-background'
          : 'dark:bg-page-background'
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
