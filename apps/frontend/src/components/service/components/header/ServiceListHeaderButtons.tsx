import { useServiceContext } from '@/components/service/components/ServiceContext';
import { ServiceManageSheet } from '@/components/service/components/ServiceManageSheet';
import { ServiceListIntegrationDropdown } from '@/components/service/components/header/ServiceListIntegrationDropdown';
import useServiceCapability from '@/hooks/use-service-capability';
import { APP_PATH } from '@/utils/path/constant';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import { Button } from '@filigran/ui';
import { ServiceRestrictionEnum } from '@generated/models/ServiceRestriction.enum';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

const ServiceListHeaderButtons = ({}) => {
  const t = useTranslations();
  const {
    serviceInstance,
    translationKey,
    type,
    setIntegrationType,
    currentUserSubscriptionId,
  } = useServiceContext();
  const [openSheet, setOpenSheet] = useState(false);

  const canManageService = serviceInstance.capabilities.includes(
    ServiceRestrictionEnum.MANAGE_ACCESS
  );
  const userCanUpdate = useServiceCapability(
    ServiceRestrictionEnum.UPLOAD,
    serviceInstance
  );
  const isIntegration = type === ShareableResourceType.OPENCTI_INTEGRATION;

  return (
    <div className="flex gap-s">
      {canManageService && (
        <>
          <Button
            asChild
            variant="outline">
            <Link
              href={`/${APP_PATH}/manage/service/${serviceInstance.id}/subscription/${currentUserSubscriptionId}`}>
              {t('Service.Capabilities.ManageAccessName')}
            </Link>
          </Button>
        </>
      )}
      {userCanUpdate && (
        <>
          {isIntegration ? (
            <ServiceListIntegrationDropdown
              onIntegrationTypeSelect={(integrationType) => {
                setIntegrationType(integrationType);
                setOpenSheet(true);
              }}
            />
          ) : (
            <Button onClick={() => setOpenSheet(true)}>
              {t(`${translationKey}.AddService`)}
            </Button>
          )}
          <ServiceManageSheet
            open={openSheet}
            setOpen={setOpenSheet}
          />
        </>
      )}
    </div>
  );
};

export default ServiceListHeaderButtons;
