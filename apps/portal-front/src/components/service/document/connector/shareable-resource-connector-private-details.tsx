import {
  ShareableResourceConnectorDetails,
  ShareableResourceConnectorDetailsProps,
} from '@/components/service/document/connector/shareable-resource-connector-details';
import { ShareableResourceIncompatibleWarning } from '@/components/service/document/shareable-resource-incompatible-warning';
import { useRegisteredPlatforms } from '@/hooks/useRegisteredPlatforms';
import { isCompatibleWithSemanticVersion } from '@/utils/semantic-versioning';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { CheckIndeterminateIcon } from 'filigran-icon';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

interface Props {
  connectorDetails: ShareableResourceConnectorDetailsProps['connectorDetails'];
}

export const ShareableResourceConnectorPrivateDetails: React.FC<Props> = ({
  connectorDetails,
}) => {
  const t = useTranslations();
  const { platforms } = useRegisteredPlatforms(PlatformIdentifierEnum.OPENCTI);
  const incompatibilityTranslationKey: 'Required' | 'Optional' | null =
    useMemo(() => {
      const compatiblePlatformsCount = platforms.reduce(
        (acc, platform) =>
          isCompatibleWithSemanticVersion(
            platform.version,
            connectorDetails?.product_version
          )
            ? acc + 1
            : acc,
        0
      );

      if (compatiblePlatformsCount === platforms.length) {
        return null;
      }

      return platforms.length === 1 ? 'Required' : 'Optional';
    }, [platforms, connectorDetails]);

  const compatibilityItem = useMemo(() => {
    if (incompatibilityTranslationKey) {
      return (
        <span className="opacity-60 flex gap-xs items-center">
          {connectorDetails?.product_version}
          <CheckIndeterminateIcon className="h-4 w-4" />
        </span>
      );
    }

    return (
      <span className="text-green">{connectorDetails?.product_version}</span>
    );
  }, [incompatibilityTranslationKey]);

  return (
    <div className="flex flex-col gap-s">
      <ShareableResourceConnectorDetails
        connectorDetails={connectorDetails}
        compatibilityItem={compatibilityItem}
      />
      {incompatibilityTranslationKey && (
        <ShareableResourceIncompatibleWarning
          message={t(
            `Service.Connectors.Incompatible.${incompatibilityTranslationKey}`
          )}
        />
      )}
    </div>
  );
};
