import { Button } from '@filigran/ui/servers';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Markdown from 'react-markdown';

interface NoPlatformDisplayProps {
  setIsOpen: (isOpen: boolean) => void;
  platformIdentifier: string;
}

const NoPlatformDisplay = ({
  setIsOpen,
  platformIdentifier,
}: NoPlatformDisplayProps) => {
  const t = useTranslations();
  return (
    <>
      <div className="space-y-m">
        <h1>
          {t('Service.ShareableResources.Deploy.DeployDescriptionNoPlatform', {
            platformIdentifier,
          })}
        </h1>
        <Markdown>
          {t(
            'Service.ShareableResources.Deploy.DeployDescriptionNoPlatformThen',
            {
              platformIdentifier,
            }
          )}
        </Markdown>
        <div className="relative border-2 border-solid rounded w-full h-96">
          <Image
            fill
            objectFit="contain"
            src={`/register-in-hub-${platformIdentifier}.png`}
            alt={t(
              'Service.ShareableResources.Deploy.DeployDescriptionNoPlatformIllustration'
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
