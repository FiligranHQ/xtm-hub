import {
  GenericCapabilityName,
  ServiceCapabilityName,
} from '@/components/service/[slug]/capabilities/capability.helper';
import { useServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import useServiceCapability from '@/hooks/useServiceCapability';
import { APP_PATH } from '@/utils/path/constant';
import { Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

interface ServiceButtonsProps {
  firstServiceSubscriptionId: string;
}

const ServiceListHeaderButtons = ({
  firstServiceSubscriptionId,
}: ServiceButtonsProps) => {
  const t = useTranslations();
  const { serviceInstance, translationKey } = useServiceContext();
  const [openSheet, setOpenSheet] = useState(false);

  const canManageService = serviceInstance.capabilities.includes(
    GenericCapabilityName.MANAGE_ACCESS
  );
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  return (
    <div className="flex gap-s">
      {canManageService && (
        <>
          <Button
            asChild
            variant="outline">
            <Link
              href={`/${APP_PATH}/manage/service/${serviceInstance.id}/subscription/${firstServiceSubscriptionId}`}>
              {t('Service.Capabilities.ManageAccessName')}
            </Link>
          </Button>
        </>
      )}
      {userCanUpdate && (
        <>
          <Button onClick={() => setOpenSheet(true)}>
            {t(`${translationKey}.AddService`)}
          </Button>
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
