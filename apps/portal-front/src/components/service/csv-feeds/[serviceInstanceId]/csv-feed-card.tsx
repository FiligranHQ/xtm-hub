'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { CSVFeedUpdateSheet } from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feed-update-sheet';
import { IconActions } from '@/components/ui/icon-actions';
import ShareableResourceCard from '@/components/ui/shareable-resource/shareable-resource-card';
import useServiceCapability from '@/hooks/useServiceCapability';
import { csvFeedsItem_fragment$data } from '@generated/csvFeedsItem_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { MoreVertIcon } from 'filigran-icon';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';

interface CsvFeedCardProps {
  csvFeed: csvFeedsItem_fragment$data;
  serviceInstance: serviceInstance_fragment$data;
  detailUrl: string;
  shareLinkUrl: string;
  connectionId: string;
}

const CsvFeedCard = ({
  csvFeed,
  serviceInstance,
  detailUrl,
  shareLinkUrl,
  connectionId,
}: CsvFeedCardProps) => {
  const t = useTranslations();

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );
  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );

  const onDelete = () => {
    toast({
      title: t('Utils.Success'),
      description: t('Service.CsvFeed.Actions.Deleted', {
        name: csvFeed.name,
      }),
    });
  };

  return (
    <ShareableResourceCard
      key={csvFeed.id}
      document={csvFeed}
      detailUrl={detailUrl}
      shareLinkUrl={shareLinkUrl}
      serviceInstance={serviceInstance}
      extraContent={
        (userCanUpdate || userCanDelete) && (
          <IconActions
            className="z-[2]"
            icon={
              <>
                <MoreVertIcon className="h-4 w-4 text-primary" />
                <span className="sr-only">{t('Utils.OpenMenu')}</span>
              </>
            }>
            <CSVFeedUpdateSheet
              onDelete={onDelete}
              connectionId={connectionId}
              variant="menu"
              csvFeed={csvFeed}
              serviceInstance={serviceInstance}
            />
          </IconActions>
        )
      }
    />
  );
};

export default CsvFeedCard;
