import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface NoPlatformDisplayProps {
  setIsOpen: (isOpen: boolean) => void;
}

const NoPlatformDisplay = ({ setIsOpen }: NoPlatformDisplayProps) => {
  const t = useTranslations();
  return (
    <>
      <div className="space-y-m">
        <h1>
          {t(
            'Service.ShareableResources.Deploy.DeployOctiDescriptionNoPlatform'
          )}
        </h1>
        <p>
          {t(
            'Service.ShareableResources.Deploy.DeployOctiDescriptionNoPlatformThen'
          )}
        </p>
        <div className="relative border-2 border-solid rounded w-full h-96">
          <Image
            fill
            objectFit="contain"
            src={`/register-in-hub.png`}
            alt={t(
              'Service.ShareableResources.Deploy.DeployOctiDescriptionNoPlatformIllustration'
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-s">
        <Button onClick={() => setIsOpen(false)}>{t('Utils.Close')}</Button>
      </div>
    </>
  );
};

export default NoPlatformDisplay;
