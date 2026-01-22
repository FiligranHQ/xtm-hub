import { useBuildCompatibilityTranslationKey } from '@/hooks/useBuildCompatibilityTranslationKey';
import { useRegisteredPlatforms } from '@/hooks/useRegisteredPlatforms';
import { cn } from '@/lib/utils';
import { CheckIndeterminateIcon } from '@filigran/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui/clients';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';

interface DisplayVersionCardProps {
  requiredProductVersion?: string | null;
  product_version?: string | null;
  className?: string;
}
export const ShareableResourceCardVersion: FunctionComponent<
  DisplayVersionCardProps
> = ({ requiredProductVersion, product_version, className }) => {
  const t = useTranslations();
  const { platforms } = useRegisteredPlatforms(PlatformIdentifierEnum.OPENCTI);
  const { platformToBeUpdated, incompatiblePlatformsCount } =
    useBuildCompatibilityTranslationKey({
      platforms,
      requiredProductVersion,
    });

  if (incompatiblePlatformsCount > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn('text-gray/60 flex items-center gap-s', className)}>
              {product_version}
              <CheckIndeterminateIcon className="h-4 w-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {t(`Service.Connectors.Incompatible`, {
              platformToBeUpdated,
              count: incompatiblePlatformsCount,
            })}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return <span className={className}>{product_version}</span>;
};
