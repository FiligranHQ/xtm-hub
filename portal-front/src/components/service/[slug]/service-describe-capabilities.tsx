import { UnknownIcon } from 'filigran-icon';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';

export const ServiceDescribeCapabilitiesSheet: FunctionComponent = () => {
  const t = useTranslations();
  return (
    <>
      <div className="flex flex-row">
        <div className="font-bold">
          {t('Service.Capabilities.ManageAccessName')}
        </div>
        <div className="flex items-center">
          <UnknownIcon className="h-4 w-4 ml-s" />{' '}
        </div>
      </div>
      {t('Service.Capabilities.ManageAccessDescription')}
      <div className="flex flex-row">
        <div className="font-bold">
          {t('Service.Capabilities.AccessServiceName')}
        </div>
        <div className="flex items-center">
          <UnknownIcon className="h-4 w-4 ml-s" />
        </div>
      </div>
      {t('Service.Capabilities.AccessServiceDescription')}
    </>
  );
};
