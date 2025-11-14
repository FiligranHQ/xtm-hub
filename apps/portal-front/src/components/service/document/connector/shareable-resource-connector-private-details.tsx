import {
  ShareableResourceConnectorDetails,
  ShareableResourceConnectorDetailsProps,
} from '@/components/service/document/connector/shareable-resource-connector-details';
import { ShareableResourceIncompatibleWarning } from '@/components/service/document/shareable-resource-incompatible-warning';
import { useBuildCompatibilityTranslationKey } from '@/hooks/useBuildCompatibilityTranslationKey';
import { useRegisteredPlatforms } from '@/hooks/useRegisteredPlatforms';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { CheckIndeterminateIcon } from 'filigran-icon';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  connectorDetails: ShareableResourceConnectorDetailsProps['connectorDetails'];
}

export const ShareableResourceConnectorPrivateDetails: React.FC<Props> = ({
  connectorDetails,
}) => {
  const t = useTranslations();
  const { platforms } = useRegisteredPlatforms(PlatformIdentifierEnum.OPENCTI);
  const { translationKey: incompatibilityTranslationKey } =
    useBuildCompatibilityTranslationKey({
      platforms,
      requiredProductVersion: connectorDetails?.product_version,
    });

  const compatibilityItem = incompatibilityTranslationKey && (
    <span className="opacity-60 flex gap-xs items-center">
      {connectorDetails?.product_version}
      <CheckIndeterminateIcon className="h-4 w-4" />
    </span>
  );

  return (
    <div className="flex flex-col justify-start gap-s flex-1">
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
