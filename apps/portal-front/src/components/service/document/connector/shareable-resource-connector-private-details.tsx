import {
  ShareableResourceConnectorDetails,
  ShareableResourceConnectorDetailsProps,
} from '@/components/service/document/connector/shareable-resource-connector-details';
import { ShareableResourceIncompatibleWarning } from '@/components/service/document/shareable-resource-incompatible-warning';
import { useBuildCompatibilityTranslationKey } from '@/hooks/useBuildCompatibilityTranslationKey';
import { useRegisteredPlatforms } from '@/hooks/useRegisteredPlatforms';
import { CheckIndeterminateIcon } from '@filigran/icon';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  connectorDetails: ShareableResourceConnectorDetailsProps['connectorDetails'];
}

export const ShareableResourceConnectorPrivateDetails: React.FC<Props> = ({
  connectorDetails,
}) => {
  const t = useTranslations();
  const { platforms } = useRegisteredPlatforms(PlatformIdentifierEnum.OPENCTI, {
    onlyActiveTrials: true,
  });
  const { platformToBeUpdated, incompatiblePlatformsCount } =
    useBuildCompatibilityTranslationKey({
      platforms,
      requiredProductVersion: connectorDetails?.product_version,
    });

  const compatibilityItem =
    incompatiblePlatformsCount > 0 ? (
      <span className="text-gray/60 flex gap-s items-center">
        {connectorDetails?.product_version}
        <CheckIndeterminateIcon className="h-4 w-4" />
      </span>
    ) : undefined;

  return (
    <div className="flex flex-col justify-start gap-s flex-1">
      <ShareableResourceConnectorDetails
        connectorDetails={connectorDetails}
        compatibilityItem={compatibilityItem}
      />
      {incompatiblePlatformsCount > 0 && connectorDetails.manager_supported ? (
        <ShareableResourceIncompatibleWarning
          message={t(`Service.Connectors.Incompatible`, {
            count: incompatiblePlatformsCount,
            platformToBeUpdated,
          })}
        />
      ) : null}
    </div>
  );
};
