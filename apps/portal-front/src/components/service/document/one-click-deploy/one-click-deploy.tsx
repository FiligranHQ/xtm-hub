import ChoosePlatformForm from '@/components/service/document/one-click-deploy/choose-platform-form';
import NoPlatformDisplay from '@/components/service/document/one-click-deploy/no-platform-display';
import OnePlatformDisplay from '@/components/service/document/one-click-deploy/one-platform-display';
import { useOneClickDeployTab } from '@/components/service/document/one-click-deploy/useOneClickDeployTab';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { oneClickDeployMutation } from '@generated/oneClickDeployMutation.graphql';
import { oneClickDeployOctiPlatformFragment$key } from '@generated/oneClickDeployOctiPlatformFragment.graphql';
import { oneClickDeployOctiPlatformsQuery } from '@generated/oneClickDeployOctiPlatformsQuery.graphql';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

export const OneClickDeployOctiPlatformFragment = graphql`
  fragment oneClickDeployOctiPlatformFragment on RegisteredPlatform {
    id
    title
    url
  }
`;

export const OneClickDeployOctiPlatformsQuery = graphql`
  query oneClickDeployOctiPlatformsQuery($input: RegisteredPlatformsInput!) {
    registeredPlatforms(input: $input) {
      ...oneClickDeployOctiPlatformFragment
    }
  }
`;

interface OneClickDeployProps {
  documentData: ShareableResource;
}

const OneClickDeploy = ({ documentData }: OneClickDeployProps) => {
  const t = useTranslations();
  const queryData = useLazyLoadQuery<oneClickDeployOctiPlatformsQuery>(
    OneClickDeployOctiPlatformsQuery,
    { input: { identifier: PlatformIdentifierEnum.OPENCTI } }
  );
  const platformsOcti = queryData.registeredPlatforms.map((instanceRef) =>
    useFragment<oneClickDeployOctiPlatformFragment$key>(
      OneClickDeployOctiPlatformFragment,
      instanceRef
    )
  );

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
  const [openCTIBasePath, setOpenCTIBasePath] = useState('');
  const [shouldOpenTab, setShouldOpenTab] = useState(false);
  const { openTab } = useOneClickDeployTab({ openCTIBasePath, documentData });

  const onOneClickDeploy = (basePath: string) => {
    const [platform] = platformsOcti.filter(
      (platform) => platform.url === basePath
    );
    if (platform) {
      sendOneClickDeployEvent({
        variables: {
          input: {
            target_product: PlatformIdentifierEnum.OPENCTI,
            service_instance_id: documentData.service_instance!.id,
            resource_id: documentData.id,
            resource_title: documentData.name,
            platform_id: platform!.id,
          },
        },
      });
    }

    setOpenCTIBasePath(basePath);
    setShouldOpenTab(true);
  };

  if (shouldOpenTab) {
    openTab();
    setShouldOpenTab(false);
  }

  const alertContent = useMemo(() => {
    if (platformsOcti.length === 0) {
      return <NoPlatformDisplay setIsOpen={setIsOpen} />;
    }
    if (platformsOcti.length === 1) {
      return (
        <OnePlatformDisplay
          documentDataName={documentData.name}
          platformsOcti={platformsOcti}
          oneClickDeploy={onOneClickDeploy}
          setIsOpen={setIsOpen}
        />
      );
    }
    if (platformsOcti.length > 1) {
      return (
        <ChoosePlatformForm
          documentData={documentData}
          platformsOcti={platformsOcti}
          oneClickDeploy={onOneClickDeploy}
          setIsOpen={setIsOpen}
        />
      );
    }
  }, [platformsOcti]);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogTrigger>
        <Button onClick={() => setIsOpen(true)}>
          {t('Service.ShareableResources.Deploy.DeployOcti')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-3xl w-full">
        {alertContent}
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Component export
export default OneClickDeploy;
