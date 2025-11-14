import { PlatformTranslationMapping } from '@/components/registration/platform-identifier-mapping';
import ChoosePlatformForm from '@/components/service/document/one-click-deploy/choose-platform-form';
import NoPlatformDisplay from '@/components/service/document/one-click-deploy/no-platform-display';
import OnePlatformDisplay from '@/components/service/document/one-click-deploy/one-platform-display';
import { useOneClickDeployTab } from '@/components/service/document/one-click-deploy/useOneClickDeployTab';
import { useRegisteredPlatforms } from '@/hooks/useRegisteredPlatforms';
import { isCompatibleWithSemanticVersion } from '@/utils/semantic-versioning';
import {
  ShareableResource,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { oneClickDeployMutation } from '@generated/oneClickDeployMutation.graphql';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  SimpleTooltip,
} from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useMutation } from 'react-relay';

interface OneClickDeployProps {
  documentData: ShareableResource;
  requiredProductVersion?: string;
}

const OneClickDeploy = ({
  documentData,
  requiredProductVersion,
}: OneClickDeployProps) => {
  const t = useTranslations();
  const platformIdentifier =
    documentData.type === ShareableResourceType.OPENAEV_SCENARIO
      ? PlatformIdentifierEnum.OPENAEV
      : PlatformIdentifierEnum.OPENCTI;
  const { platforms } = useRegisteredPlatforms(platformIdentifier);

  const SendOneClickDeployTelemetryMutation = graphql`
    mutation oneClickDeployMutation($input: OneClickDeployInput!) {
      sendTelemetryEvent {
        oneClickDeploy(input: $input) {
          result
          message
        }
      }
    }
  `;

  const [sendOneClickDeployEvent] = useMutation<oneClickDeployMutation>(
    SendOneClickDeployTelemetryMutation
  );

  const [isOpen, setIsOpen] = useState(false);
  const [platformBasePath, setPlatformBasePath] = useState('');
  const [shouldOpenTab, setShouldOpenTab] = useState(false);
  const { openTab } = useOneClickDeployTab({ platformBasePath, documentData });

  const onOneClickDeploy = useCallback(
    (basePath: string) => {
      const [platform] = platforms.filter(
        (platform) => platform.url === basePath
      );
      if (platform) {
        sendOneClickDeployEvent({
          variables: {
            input: {
              platform_identifier: platformIdentifier,
              service_instance_id: documentData.service_instance!.id,
              resource_id: documentData.id,
              resource_title: documentData.name,
              platform_service_instance_id: platform!.id,
            },
          },
        });
      }
      setPlatformBasePath(basePath);
      setShouldOpenTab(true);
    },
    [
      platforms,
      sendOneClickDeployEvent,
      platformIdentifier,
      documentData.service_instance,
      documentData.id,
      documentData.name,
      setPlatformBasePath,
      setShouldOpenTab,
    ]
  );

  if (shouldOpenTab) {
    openTab();
    setShouldOpenTab(false);
  }

  const alertContent = useMemo(() => {
    if (platforms.length === 0) {
      return (
        <NoPlatformDisplay
          setIsOpen={setIsOpen}
          platformIdentifier={
            PlatformTranslationMapping[platformIdentifier] ?? 'OpenCTI'
          }
        />
      );
    }
    if (platforms.length === 1) {
      return (
        <OnePlatformDisplay
          documentData={documentData}
          platforms={platforms}
          oneClickDeploy={onOneClickDeploy}
          setIsOpen={setIsOpen}
        />
      );
    }
    if (platforms.length > 1) {
      return (
        <ChoosePlatformForm
          documentData={documentData}
          platforms={platforms}
          oneClickDeploy={onOneClickDeploy}
          setIsOpen={setIsOpen}
          translatedPlatformIdentifier={
            PlatformTranslationMapping[platformIdentifier] ?? 'OpenCTI'
          }
          requiredProductVersion={requiredProductVersion}
        />
      );
    }
  }, [
    platforms,
    documentData,
    onOneClickDeploy,
    platformIdentifier,
    requiredProductVersion,
  ]);

  const isDeploymentDisabled = useMemo(() => {
    if (platforms.length !== 1) {
      return false;
    }

    return !isCompatibleWithSemanticVersion(
      platforms[0]!.version,
      requiredProductVersion
    );
  }, [platforms, requiredProductVersion]);

  const button = (
    <Button
      disabled={isDeploymentDisabled}
      onClick={() => setIsOpen(true)}>
      {t('Service.ShareableResources.Deploy.DeployPlatform', {
        platformName:
          PlatformTranslationMapping[platformIdentifier] ?? 'OpenCTI',
      })}
    </Button>
  );

  const container = isDeploymentDisabled ? (
    <SimpleTooltip title={t('Service.Connectors.Incompatible.Required')}>
      {button}
    </SimpleTooltip>
  ) : (
    button
  );

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogTrigger>{container}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-3xl w-full">
        {alertContent}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OneClickDeploy;
