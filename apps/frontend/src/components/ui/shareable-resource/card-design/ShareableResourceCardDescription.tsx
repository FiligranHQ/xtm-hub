'use client';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { cn } from '@/lib/utils';
import { FeatureFlag } from '@graphql/generated';

interface ShareableResourceCardDescriptionProps {
  description?: string | null;
}

export const ShareableResourceCardDescription = ({
  description,
}: ShareableResourceCardDescriptionProps) => {
  const isHomePageV2Enabled = useIsFeatureEnabled(FeatureFlag.HomePageV2);

  return (
    <p
      className={cn(
        'text-muted-foreground text-sm overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical]',
        isHomePageV2Enabled
          ? '[-webkit-line-clamp:3] sm:[-webkit-line-clamp:5]'
          : '[-webkit-line-clamp:5]'
      )}>
      {description}
    </p>
  );
};
