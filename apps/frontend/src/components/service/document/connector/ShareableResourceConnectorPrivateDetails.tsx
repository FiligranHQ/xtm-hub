import { ShareableResourceIncompatibleWarning } from '@/components/service/document/ShareableResourceIncompatibleWarning';
import {
  ShareableResourceConnectorDetails,
  ShareableResourceConnectorDetailsProps,
} from '@/components/service/document/connector/ShareableResourceConnectorDetails';
import { useBuildCompatibilityTranslationKey } from '@/hooks/use-build-compatibility-translation-key';
import { useRegisteredPlatforms } from '@/hooks/use-registered-platforms';
import { useTranslate } from '@/hooks/use-translate';
import { FiligranWebsiteUtm } from '@/utils/filigran-website-utm';
import { CheckIndeterminateIcon } from '@filigran/icon';
import { PlatformIdentifier } from '@graphql/generated';

interface ShareableResourceConnectorPrivateDetailsProps {
  connectorDetails: ShareableResourceConnectorDetailsProps['connectorDetails'];
  filigranWebsiteUtm?: FiligranWebsiteUtm;
}

export const ShareableResourceConnectorPrivateDetails = ({
  connectorDetails,
  filigranWebsiteUtm,
}: ShareableResourceConnectorPrivateDetailsProps) => {
  const t = useTranslate();
  const { platforms } = useRegisteredPlatforms(PlatformIdentifier.Opencti, {
    onlyActive: true,
  });
  const { platformToBeUpdated, incompatiblePlatformsCount } =
    useBuildCompatibilityTranslationKey({
      platforms,
      requiredProductVersion: connectorDetails?.minimum_deployable_version,
    });

  const compatibilityItem =
    incompatiblePlatformsCount > 0 ? (
      <span className="text-[var(--text-default-secondary)]/60 flex gap-2 items-center">
        {connectorDetails?.minimum_deployable_version}
        <CheckIndeterminateIcon className="h-4 w-4" />
      </span>
    ) : undefined;

  return (
    <div className="flex flex-col justify-start gap-2 flex-1">
      <ShareableResourceConnectorDetails
        connectorDetails={connectorDetails}
        compatibilityItem={compatibilityItem}
        filigranWebsiteUtm={filigranWebsiteUtm}
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
