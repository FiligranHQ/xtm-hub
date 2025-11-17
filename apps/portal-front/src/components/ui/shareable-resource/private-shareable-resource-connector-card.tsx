import ShareableResourceConnectorCard, {
  ShareableResourceConnectorCardProps,
} from '@/components/ui/shareable-resource/shareable-resource-connector-card';
import { useBuildCompatibilityTranslationKey } from '@/hooks/useBuildCompatibilityTranslationKey';
import { useRegisteredPlatforms } from '@/hooks/useRegisteredPlatforms';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { CheckIndeterminateIcon } from 'filigran-icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import React from 'react';

type Props = ShareableResourceConnectorCardProps & {
  requiredProductVersion?: string;
};

export const PrivateShareableResourceConnectorCard: React.FC<Props> = ({
  requiredProductVersion,
  ...props
}) => {
  const t = useTranslations();
  const { platforms } = useRegisteredPlatforms(PlatformIdentifierEnum.OPENCTI);
  const { translationKey: incompatibilityTranslationKey } =
    useBuildCompatibilityTranslationKey({
      platforms,
      requiredProductVersion,
    });

  const productVersionItem = incompatibilityTranslationKey && (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-gray/60 flex items-center gap-s text-sm">
            {props.shareableConnector.product_version}
            <CheckIndeterminateIcon className="h-4 w-4" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {t(
            `Service.Connectors.Incompatible.${incompatibilityTranslationKey}`
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <ShareableResourceConnectorCard
      productVersionItem={productVersionItem}
      {...props}
    />
  );
};
