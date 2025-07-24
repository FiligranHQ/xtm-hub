import { SettingsContext } from '@/components/settings/env-portal-context';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';

interface NoPlatformDisplayProps {
  setIsOpen: (isOpen: boolean) => void;
}

const NoPlatformDisplay = ({ setIsOpen }: NoPlatformDisplayProps) => {
  const { settings } = useContext(SettingsContext);
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
};

export default NoPlatformDisplay;
