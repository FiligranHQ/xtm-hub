import ShareableResourceConnectorCard, {
  ShareableResourceConnectorCardProps,
} from '@/components/ui/shareable-resource/shareable-resource-connector-card';
import { useBuildCompatibilityTranslationKey } from '@/hooks/useBuildCompatibilityTranslationKey';
import { useRegisteredPlatforms } from '@/hooks/useRegisteredPlatforms';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import React from 'react';

type Props = ShareableResourceConnectorCardProps & {
  requiredProductVersion?: string;
};

export const PrivateShareableResourceConnectorCard: React.FC<Props> = ({
  requiredProductVersion,
  ...props
}) => {
  const { platforms } = useRegisteredPlatforms(PlatformIdentifierEnum.OPENCTI);
  const { translationKey: incompatibilityTranslationKey } =
    useBuildCompatibilityTranslationKey({
      platforms,
      requiredProductVersion,
    });

  return (
    <ShareableResourceConnectorCard
      incompatibilityTranslationKey={incompatibilityTranslationKey}
      {...props}
    />
  );
};
