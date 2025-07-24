import ChooseInstanceForm from '@/components/service/document/one-click-deploy/choose-instance-form';
import NoPlatformDisplay from '@/components/service/document/one-click-deploy/no-platform-display';
import OnePlatformDisplay from '@/components/service/document/one-click-deploy/one-platform-display';
import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { oneClickDeployOctiInstancesQuery } from '@generated/oneClickDeployOctiInstancesQuery.graphql';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

export const OneClickDeployOctiInstanceFragment = graphql`
  fragment oneClickDeployOctiInstanceFragment on OctiInstance {
    id
    title
    url
  }
`;

export const OneClickDeployOctiInstancesQuery = graphql`
  query oneClickDeployOctiInstancesQuery {
    octiInstances {
      ...oneClickDeployOctiInstanceFragment
    }
  }
`;

interface OneClickDeployProps {
  documentData: ShareableResource;
}

const OneClickDeploy = ({ documentData }: OneClickDeployProps) => {
  const t = useTranslations();

  const queryData = useLazyLoadQuery<oneClickDeployOctiInstancesQuery>(
    OneClickDeployOctiInstancesQuery,
    {}
  );

  const instancesOcti = queryData.octiInstances.map((instanceRef) =>
    useFragment(OneClickDeployOctiInstanceFragment, instanceRef)
  );

  const isOneClickFeatureEnabled = useIsFeatureEnabled(
    FeatureFlag.ONECLICK_DEPLOY_DASHBOARD
  );

  const [isOpen, setIsOpen] = useState(false);

  const oneClickDeploy = (instanceOctiUrl: string) => {
    window.open(
      `${instanceOctiUrl}/dashboard/xtm-hub/deploy-custom-dashboard/${documentData.service_instance?.id}/${documentData.id}`,
      '_blank'
    );
  };

  const alertContent = useMemo(() => {
    if (instancesOcti.length === 0) {
      return <NoPlatformDisplay setIsOpen={setIsOpen} />;
    }
    if (instancesOcti.length === 1) {
      return (
        <OnePlatformDisplay
          documentDataName={documentData.name}
          instancesOcti={instancesOcti}
          oneClickDeploy={oneClickDeploy}
          setIsOpen={setIsOpen}
        />
      );
    }
    if (instancesOcti.length > 1) {
      return (
        <ChooseInstanceForm
          documentData={documentData}
          instancesOcti={instancesOcti}
          oneClickDeploy={oneClickDeploy}
          setIsOpen={setIsOpen}
        />
      );
    }
  }, [instancesOcti]);

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
