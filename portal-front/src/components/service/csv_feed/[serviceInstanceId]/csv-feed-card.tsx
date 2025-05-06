'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { CSVFeedUpdateSheet } from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed-update-sheet';
import DocumentBento from '@/components/ui/document-bento';
import { IconActions } from '@/components/ui/icon-actions';
import ShareableResourceCard from '@/components/ui/shareable-resource-card';
import useServiceCapability from '@/hooks/useServiceCapability';
import { csvFeedItem_fragment$data } from '@generated/csvFeedItem_fragment.graphql';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { MoreVertIcon } from 'filigran-icon';
import { useTranslations } from 'next-intl';

interface CsvFeedCardProps {
  csvFeed: csvFeedItem_fragment$data;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
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

  return (
    <ShareableResourceCard
      key={csvFeed.id}
      document={csvFeed as unknown as documentItem_fragment$data}
      detailUrl={detailUrl}
      shareLinkUrl={shareLinkUrl}
      extraContent={
        (userCanUpdate || userCanDelete) && (
          <IconActions
            className={'z-[2]'}
            icon={
              <>
                <MoreVertIcon className="h-4 w-4 text-primary" />
                <span className="sr-only">{t('Utils.OpenMenu')}</span>
              </>
            }>
            <CSVFeedUpdateSheet
              connectionId={connectionId}
              variant={'menu'}
              csvFeed={csvFeed}
              serviceInstance={serviceInstance}
            />
          </IconActions>
        )
      }>
      <DocumentBento
        document={csvFeed}
        serviceInstanceId={serviceInstance.id}
      />
    </ShareableResourceCard>
  );
};

export default CsvFeedCard;
