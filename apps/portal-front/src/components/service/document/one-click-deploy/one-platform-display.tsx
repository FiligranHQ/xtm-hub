import { oneClickDeployOctiInstanceFragment$data } from '@generated/oneClickDeployOctiInstanceFragment.graphql';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';

interface OnePlatformDisplayProps {
  documentDataName: string;
  instancesOcti: oneClickDeployOctiInstanceFragment$data[];
  setIsOpen: (isOpen: boolean) => void;
  oneClickDeploy: (url: string) => void;
}

const OnePlatformDisplay = ({
  documentDataName,
  instancesOcti,
  setIsOpen,
  oneClickDeploy,
}: OnePlatformDisplayProps) => {
  const t = useTranslations();

  return (
    <>
      <div className="space-y-m">
        <h1>
          {t(
            'Service.ShareableResources.Deploy.DeployDashboardOctiDescription',
            {
              dashboardName: documentDataName,
            }
          )}
        </h1>
        <p>
          {t(
            'Service.ShareableResources.Deploy.DeployOctiDescriptionOnePlatform',
            {
              platformName: instancesOcti[0]?.title ?? 'OpenCTIXX',
            }
          )}
        </p>
      </div>
      <div className="flex justify-end gap-s">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            setIsOpen(false);
          }}>
          {t('Utils.Cancel')}
        </Button>

        <Button onClick={() => oneClickDeploy(instancesOcti[0]?.url ?? '')}>
          {t('Utils.Continue')}
        </Button>
      </div>
    </>
  );
};

export default OnePlatformDisplay;
