import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { CSVFeedAddSheet } from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed-add-sheet';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface CsvFeedButtonsProps {
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
  firstDashboardSubscriptionId: string;
  connectionId: string;
}
const CsvFeedButtons = ({
  serviceInstance,
  firstDashboardSubscriptionId,
  connectionId,
}: CsvFeedButtonsProps) => {
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
            href={`/manage/service/${serviceInstance.id}/subscription/${firstDashboardSubscriptionId}`}>
            {t('Service.Capabilities.ManageAccessName')}
          </Link>
        </Button>
      )}
      <CSVFeedAddSheet
        serviceInstance={serviceInstance}
        connectionId={connectionId}
      />
    </>
  );
};

export default CsvFeedButtons;
