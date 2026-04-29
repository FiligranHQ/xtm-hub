import { PlatformMetadataMapping } from '@/components/registration/platform-identifier-mapping';
import { getPlatformIdentifier } from '@/utils/platform';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  SimpleTooltip,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { OneClickDeployMutation as OneClickDeployMutationType } from '@generated/OneClickDeployMutation.graphql';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useBuildCompatibilityTranslationKey } from '@/hooks/use-build-compatibility-translation-key';
import { useRegisteredPlatforms } from '@/hooks/use-registered-platforms';
import ChoosePlatformForm from '@/components/service/document/one-click-deploy/ChoosePlatformForm';
import NoPlatformDisplay from '@/components/service/document/one-click-deploy/NoPlatformDisplay';
import OnePlatformDisplay from '@/components/service/document/one-click-deploy/OnePlatformDisplay';
import { useOneClickDeployTab } from '@/components/service/document/one-click-deploy/UseOneClickDeployTab';

interface OneClickDeployProps {
  documentData: documentItem_fragment$data;
  requiredProductVersion?: string | null;
}

const OneClickDeploy = ({
  documentData,
  requiredProductVersion,
}: OneClickDeployProps) => {
  const t = useTranslations();
  const platformIdentifier = getPlatformIdentifier(documentData.type);
  const { platforms } = useRegisteredPlatforms(platformIdentifier, {
    onlyActive: true,
  });

  const SendOneClickDeployTelemetryMutation = graphql`
    mutation OneClickDeployMutation($input: OneClickDeployInput!) {
      sendTelemetryEvent {
        oneClickDeploy(input: $input) {
          result
          message
        }
      }
    }
  `;

  const [sendOneClickDeployEvent] = useMutation<OneClickDeployMutationType>(
    SendOneClickDeployTelemetryMutation
  );

  const [isOpen, setIsOpen] = useState(false);
  const [platformBasePath, setPlatformBasePath] = useState('');
  const [shouldOpenTab, setShouldOpenTab] = useState(false);
  const { openTab } = useOneClickDeployTab({ platformBasePath, documentData });
  const { platformToBeUpdated, incompatiblePlatformsCount } =
    useBuildCompatibilityTranslationKey({
      platforms,
      requiredProductVersion,
    });

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
              resource_title: documentData.name ?? '',
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
            PlatformMetadataMapping[platformIdentifier].name ?? 'OpenCTI'
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
            PlatformMetadataMapping[platformIdentifier].name ?? 'OpenCTI'
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
    return platforms.length === 1 && incompatiblePlatformsCount === 1;
  }, [platforms, incompatiblePlatformsCount]);

  const button = (
    <Button
      disabled={isDeploymentDisabled}
      onClick={() => setIsOpen(true)}>
      {t('Service.ShareableResources.Deploy.DeployPlatform', {
        platformName:
          PlatformMetadataMapping[platformIdentifier].name ?? 'OpenCTI',
      })}
    </Button>
  );

  const container = isDeploymentDisabled ? (
    <SimpleTooltip
      title={t('Service.Connectors.Incompatible', {
        platformToBeUpdated,
        count: incompatiblePlatformsCount,
      })}>
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
