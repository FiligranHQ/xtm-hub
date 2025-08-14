import { oneClickDeployOctiPlatformFragment$data } from '@generated/oneClickDeployOctiPlatformFragment.graphql';
import { AlertDialogTitle } from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';

interface OnePlatformDisplayProps {
  documentDataName: string;
  platformsOcti: oneClickDeployOctiPlatformFragment$data[];
  setIsOpen: (isOpen: boolean) => void;
  oneClickDeploy: (url: string) => void;
}

const OnePlatformDisplay = ({
  documentDataName,
  platformsOcti,
  setIsOpen,
  oneClickDeploy,
}: OnePlatformDisplayProps) => {
  const t = useTranslations();

  return (
    <>
      <div className="space-y-m">
        <AlertDialogTitle>
          {t(
            'Service.ShareableResources.Deploy.DeployDashboardOctiDescription',
            {
              dashboardName: documentDataName,
            }
          )}
        </AlertDialogTitle>
        <p>
          {t(
            'Service.ShareableResources.Deploy.DeployOctiDescriptionOnePlatform',
            {
              platformName: platformsOcti[0]?.title ?? 'OpenCTI',
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

        <Button
          onClick={() => {
            setIsOpen(false);
            oneClickDeploy(platformsOcti[0]?.url ?? '');
          }}>
          {t('Utils.Continue')}
        </Button>
      </div>
    </>
  );
};

export default OnePlatformDisplay;
