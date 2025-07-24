import * as React from 'react';

import ChooseInstanceForm from '@/components/service/document/one-click-deploy/choose-instance-form';
import { OctiInstancesQuery } from '@/components/service/document/one-click-deploy/octi-instances.graphql';
import { SettingsContext } from '@/components/settings/env-portal-context';
import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { octiInstancesQuery } from '@generated/octiInstancesQuery.graphql';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useContext, useMemo, useState } from 'react';
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

  const instancesOcti = useLazyLoadQuery<octiInstancesQuery>(
    OctiInstancesQuery,
    {}
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
  const { settings } = useContext(SettingsContext);

  const alertContent = useMemo(() => {
    if (instancesOcti.octiInstances.length === 0) {
      return (
        <>
          <div className="space-y-m">
            <h1>
              {t('Service.ShareableResources.DeployOctiDescriptionNoPlatform')}
            </h1>
            <p>
              {t(
                'Service.ShareableResources.DeployOctiDescriptionNoPlatformThen'
              )}
            </p>
            <img
              src={`${settings?.base_url_front}/RegisterInHub.png`}
              alt="OpenCTI Register in Hub illustration"
              style={{
                border: '2px solid',
                borderRadius: '4px',
                width: '100%',
                verticalAlign: 'middle',
              }}
            />
          </div>
          <div className="flex justify-end gap-s">
            <Button onClick={() => setIsOpen(false)}>{t('Utils.Close')}</Button>
          </div>
        </>
      );
    } else if (instancesOcti.octiInstances.length === 1) {
      return (
        <>
          <div className="space-y-m">
            <h1>
              {t('Service.ShareableResources.DeployDashboardOctiDescription', {
                dashboardName: documentData.name,
              })}
            </h1>
            <p>
              {t(
                'Service.ShareableResources.DeployOctiDescriptionOnePlatform',
                {
                  platformName:
                    instancesOcti.octiInstances[0]?.title ?? 'OpenCTI',
                }
              )}
            </p>
          </div>
          <div className="flex justify-end gap-s">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }}>
              {t('Utils.Cancel')}
            </Button>

            <Button
              onClick={() =>
                oneClickDeploy(instancesOcti.octiInstances[0]?.url ?? '')
              }>
              {t('Utils.Continue')}
            </Button>
          </div>
        </>
      );
    } else if (instancesOcti.octiInstances.length > 1) {
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
              {t('Service.ShareableResources.DeployOcti')}
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
