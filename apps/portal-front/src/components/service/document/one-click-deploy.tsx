import * as React from 'react';

import { OctiInstancesQuery } from '@/components/service/document/one-click-deploy/octi-instances.graphql';
import { Button } from 'filigran-ui/servers';
import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { octiInstancesQuery } from '@generated/octiInstancesQuery.graphql';
import { useTranslations } from 'next-intl';
import { useLazyLoadQuery } from 'react-relay';

// Component interface
interface OneClickDeployProps {
  documentData: ShareableResource;
}

// Component
const OneClickDeploy: React.FunctionComponent<OneClickDeployProps> = ({
  documentData,
}) => {
  const t = useTranslations();

  const instanceOcti = useLazyLoadQuery<octiInstancesQuery>(
    OctiInstancesQuery,
    {}
  );
  const isOneClickFeatureEnabled = useIsFeatureEnabled(
    FeatureFlag.ONECLICK_DEPLOY_DASHBOARD
  );

  const oneClickDeploy = () => {
    window.open(
      `${instanceOcti.octiInstances[0].url}/dashboard/xtm-hub/deploy-custom-dashboard/${documentData.service_instance?.id}/${documentData.id}`,
      '_blank'
    );
  };

  return (
    <>
      {isOneClickFeatureEnabled && (
        <Button onClick={() => oneClickDeploy()}>
          {t('Service.ShareableResources.DeployOcti')}
        </Button>
      )}
    </>
  );
};

// Component export
export default OneClickDeploy;
