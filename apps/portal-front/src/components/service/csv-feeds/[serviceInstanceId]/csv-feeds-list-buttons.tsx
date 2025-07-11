import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { CSVFeedAddSheet } from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feed-add-sheet';
import { APP_PATH } from '@/utils/path/constant';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface CsvFeedButtonsProps {
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
  firstCsvFeedSubscriptionId: string;
  connectionId: string;
}
const CsvFeedButtons = ({
  serviceInstance,
  firstCsvFeedSubscriptionId,
  connectionId,
}: CsvFeedButtonsProps) => {
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
            href={`/${APP_PATH}/manage/service/${serviceInstance.id}/subscription/${firstCsvFeedSubscriptionId}`}>
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
