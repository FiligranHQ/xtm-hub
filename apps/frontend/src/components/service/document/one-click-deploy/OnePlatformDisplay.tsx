import { useDeployResourceTitle } from '@/components/service/document/one-click-deploy/use-deploy-resource-title';
import { useTranslate } from '@/hooks/use-translate';
import { Button, DialogTitle } from '@filigran/design-system';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { useRegisteredPlatformsFragment$data } from '@generated/useRegisteredPlatformsFragment.graphql';

interface OnePlatformDisplayProps {
  documentData: documentItem_fragment$data;
  platforms: useRegisteredPlatformsFragment$data[];
  setIsOpen: (isOpen: boolean) => void;
  oneClickDeploy: (url: string) => void;
}

const OnePlatformDisplay = ({
  documentData,
  platforms,
  setIsOpen,
  oneClickDeploy,
}: OnePlatformDisplayProps) => {
  const t = useTranslate();
  const title = useDeployResourceTitle(documentData);

  return (
    <>
      <div className="space-y-3">
        <DialogTitle>{title}</DialogTitle>
        <p>
          {t('Service.ShareableResources.Deploy.DeployDescriptionOnePlatform', {
            platformName: platforms[0]?.title ?? 'OpenCTI',
          })}
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          priority="secondary"
          type="button"
          onClick={() => {
            setIsOpen(false);
          }}>
          {t('Utils.Cancel')}
        </Button>

        <Button
          onClick={() => {
            setIsOpen(false);
            oneClickDeploy(platforms[0]?.url ?? '');
          }}>
          {t('Utils.Continue')}
        </Button>
      </div>
    </>
  );
};

export default OnePlatformDisplay;
