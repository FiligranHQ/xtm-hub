import ShareableResourceConnectorCard, {
  ShareableResourceConnectorCardProps,
  ShareableResourceConnectorCardRegisteredPlatformFragment,
  ShareableResourceConnectorCardRegisteredPlatformsQuery,
} from '@/components/ui/shareable-resource/shareable-resource-connector-card';
import { isCompatibleWithSemanticVersion } from '@/utils/semantic-versioning';
import { shareableResourceConnectorCardRegisteredPlatformFragment$key } from '@generated/shareableResourceConnectorCardRegisteredPlatformFragment.graphql';
import { shareableResourceConnectorCardRegisteredPlatformsQuery } from '@generated/shareableResourceConnectorCardRegisteredPlatformsQuery.graphql';
import React, { useMemo } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';

type Props = ShareableResourceConnectorCardProps & {
  requiredProductVersion?: string;
};

export const PrivateShareableResourceConnectorCard: React.FC<Props> = ({
  requiredProductVersion,
  ...props
}) => {
  const queryData =
    useLazyLoadQuery<shareableResourceConnectorCardRegisteredPlatformsQuery>(
      ShareableResourceConnectorCardRegisteredPlatformsQuery,
      {
        input: {
          identifier: 'opencti',
        },
      }
    );
  const platforms = queryData.registeredPlatforms.map((instanceRef) =>
    useFragment<shareableResourceConnectorCardRegisteredPlatformFragment$key>(
      ShareableResourceConnectorCardRegisteredPlatformFragment,
      instanceRef
    )
  );

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
