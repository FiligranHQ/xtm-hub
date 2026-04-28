import { CheckIndeterminateIcon } from '@filigran/icon';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useBuildCompatibilityTranslationKey } from '../../../../hooks/use-build-compatibility-translation-key';
import { useRegisteredPlatforms } from '../../../../hooks/use-registered-platforms';
import { ShareableResourceIncompatibleWarning } from '../ShareableResourceIncompatibleWarning';
import {
  ShareableResourceConnectorDetails,
  ShareableResourceConnectorDetailsProps,
} from './ShareableResourceConnectorDetails';

interface Props {
  connectorDetails: ShareableResourceConnectorDetailsProps['connectorDetails'];
}

export const ShareableResourceConnectorPrivateDetails: React.FC<Props> = ({
  connectorDetails,
}) => {
  const t = useTranslations();
  const { platforms } = useRegisteredPlatforms(PlatformIdentifierEnum.OPENCTI, {
    onlyActive: true,
  });
  const { platformToBeUpdated, incompatiblePlatformsCount } =
    useBuildCompatibilityTranslationKey({
      platforms,
      requiredProductVersion: connectorDetails?.minimum_deployable_version,
    });

  const compatibilityItem =
    incompatiblePlatformsCount > 0 ? (
      <span className="text-gray/60 flex gap-s items-center">
        {connectorDetails?.minimum_deployable_version}
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
