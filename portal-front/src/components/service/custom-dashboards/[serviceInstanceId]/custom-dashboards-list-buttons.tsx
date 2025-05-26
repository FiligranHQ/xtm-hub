import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { CustomDashboardSheet } from './custom-dashboard-sheet';
interface CustomDashboardsListButtonsProps {
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
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
    GenericCapabilityName.ManageAccess
  );
  return (
    <>
      {canManageService && (
        <Button
          asChild
          variant="outline">
          <Link
            href={`/manage/service/${serviceInstance.id}/subscription/${subscriptionId}`}>
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
