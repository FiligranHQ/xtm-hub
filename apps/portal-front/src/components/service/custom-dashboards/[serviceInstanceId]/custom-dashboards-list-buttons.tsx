import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { APP_PATH } from '@/utils/path/constant';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { CustomDashboardSheet } from './custom-dashboard-sheet';
interface CustomDashboardsListButtonsProps {
  serviceInstance: serviceInstance_fragment$data;
  subscriptionId: string;
  connectionId: string;
}
const CustomDashboardsListButtons = ({
  serviceInstance,
  subscriptionId,
  connectionId,
}: CustomDashboardsListButtonsProps) => {
  const t = useTranslations();

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
            href={`/${APP_PATH}/manage/service/${serviceInstance.id}/subscription/${subscriptionId}`}>
            {t('Service.Capabilities.ManageAccessName')}
          </Link>
        </Button>
      )}
      <CustomDashboardSheet
        serviceInstance={serviceInstance}
        connectionId={connectionId}
      />
    </>
  );
};

export default CustomDashboardsListButtons;
