import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { useServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import { APP_PATH } from '@/utils/path/constant';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface ServiceButtonsProps {
  firstServiceSubscriptionId: string;
}
const ServiceButtons = ({
  firstServiceSubscriptionId,
}: ServiceButtonsProps) => {
  const t = useTranslations();
  const { serviceInstance } = useServiceContext();

  const canManageService = serviceInstance.capabilities.includes(
    GenericCapabilityName.MANAGE_ACCESS
  );
  return (
    <>
      {canManageService && (
        <Button
          asChild
          variant="outline">
          <Link
            href={`/${APP_PATH}/manage/service/${serviceInstance.id}/subscription/${firstServiceSubscriptionId}`}>
            {t('Service.Capabilities.ManageAccessName')}
          </Link>
        </Button>
      )}
      <ServiceManageSheet />
    </>
  );
};

export default ServiceButtons;
