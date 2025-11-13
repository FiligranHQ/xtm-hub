import ShareableResourceConnectorCard, {
  ShareableResourceConnectorCardProps,
} from '@/components/ui/shareable-resource/shareable-resource-connector-card';
import { useRegisteredPlatforms } from '@/hooks/useRegisteredPlatforms';
import { isCompatibleWithSemanticVersion } from '@/utils/semantic-versioning';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import React, { useMemo } from 'react';

type Props = ShareableResourceConnectorCardProps & {
  requiredProductVersion?: string;
};

export const PrivateShareableResourceConnectorCard: React.FC<Props> = ({
  requiredProductVersion,
  ...props
}) => {
  const { platforms } = useRegisteredPlatforms(PlatformIdentifierEnum.OPENCTI);

  const isConnectorCompatible = useMemo(() => {
    if (
      platforms.length !== 1 ||
      !requiredProductVersion ||
      !platforms[0]?.version
    ) {
      return true;
    }

    return isCompatibleWithSemanticVersion(
      platforms[0].version,
      requiredProductVersion
    );
  }, [platforms, requiredProductVersion]);

  return (
    <ShareableResourceConnectorCard
      isConnectorCompatible={isConnectorCompatible}
      {...props}
    />
  );
};
