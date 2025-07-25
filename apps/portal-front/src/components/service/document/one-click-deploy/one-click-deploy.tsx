import ChoosePlatformForm from '@/components/service/document/one-click-deploy/choose-platform-form';
import NoPlatformDisplay from '@/components/service/document/one-click-deploy/no-platform-display';
import OnePlatformDisplay from '@/components/service/document/one-click-deploy/one-platform-display';
import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
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
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

export const OneClickDeployOctiPlatformFragment = graphql`
  fragment oneClickDeployOctiPlatformFragment on OCTIPlatform {
    id
    title
    url
  }
`;

export const OneClickDeployOctiPlatformsQuery = graphql`
  query oneClickDeployOctiPlatformsQuery {
    octiPlatforms {
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
    {}
  );

  const platformsOcti = queryData.octiPlatforms.map((instanceRef) =>
    useFragment<oneClickDeployOctiPlatformFragment$key>(
      OneClickDeployOctiPlatformFragment,
      instanceRef
    )
  );

  const isOneClickFeatureEnabled = useIsFeatureEnabled(
    FeatureFlag.ONECLICK_DEPLOY_DASHBOARD
  );

  const [isOpen, setIsOpen] = useState(false);

  const oneClickDeploy = (platformOctiUrl: string) => {
    window.open(
      `${platformOctiUrl}/dashboard/xtm-hub/deploy-custom-dashboard/${documentData.service_instance?.id}/${documentData.id}`,
      '_blank'
    );
  };

  const alertContent = useMemo(() => {
    if (platformsOcti.length === 0) {
      return <NoPlatformDisplay setIsOpen={setIsOpen} />;
    }
    if (platformsOcti.length === 1) {
      return (
        <OnePlatformDisplay
          documentDataName={documentData.name}
          platformsOcti={platformsOcti}
          oneClickDeploy={oneClickDeploy}
          setIsOpen={setIsOpen}
        />
      );
    }
    if (platformsOcti.length > 1) {
      return (
        <ChoosePlatformForm
          documentData={documentData}
          platformsOcti={platformsOcti}
          oneClickDeploy={oneClickDeploy}
          setIsOpen={setIsOpen}
        />
      );
    }
  }, [platformsOcti]);

  return (
    <>
      {isOneClickFeatureEnabled && (
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
      )}
    </>
  );
};

// Component export
export default OneClickDeploy;
