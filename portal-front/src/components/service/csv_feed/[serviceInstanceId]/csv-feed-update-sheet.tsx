'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { CsvFeedForm } from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed-form';
import { CsvFeedDeleteMutation } from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed.graphql';
import { IconActionsButton } from '@/components/ui/icon-actions';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useServiceCapability from '@/hooks/useServiceCapability';
import { csvFeedDeleteMutation } from '@generated/csvFeedDeleteMutation.graphql';
import { csvFeedItem_fragment$data } from '@generated/csvFeedItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useMutation } from 'react-relay';

interface CSVFeedUpdateSheetProps {
  connectionId?: string;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
  csvFeed: csvFeedItem_fragment$data;
  onDelete?: () => void;
  variant?: 'menu' | 'button';
}

export const CSVFeedUpdateSheet = ({
  serviceInstance,
  connectionId,
  csvFeed,
  onDelete,
  variant = 'button',
}: CSVFeedUpdateSheetProps) => {
  const t = useTranslations();

  const [openSheet, setOpenSheet] = useState<boolean>(false);

  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  const [deleteCsvFeedMutation] = useMutation<csvFeedDeleteMutation>(
    CsvFeedDeleteMutation
  );

  const deleteDocument = () => {
    deleteCsvFeedMutation({
      variables: {
        documentId: csvFeed.id,
        serviceInstanceId: serviceInstance.id,
        connections: [connectionId ?? ''],
        forceDelete: false,
      },
      onCompleted() {
        onDelete?.();
      },
    });
    // TODO in the public page feature
    // revalidatePathActions([`${PUBLIC_DASHBOARD_URL}`]);
  };

  return (
    <>
      {(userCanUpdate || userCanDelete) && (
        <SheetWithPreventingDialog
          open={openSheet}
          setOpen={setOpenSheet}
          trigger={
            variant === 'button' ? (
              <Button variant="outline">{t('Utils.Update')}</Button>
            ) : (
              <IconActionsButton
                className="normal-case"
                onClick={() => {
                  setOpenSheet(true);
                }}
                aria-label={t('MenuActions.Update')}>
                {t('MenuActions.Update')}
              </IconActionsButton>
            )
          }
          title={t('Service.CsvFeed.UpdateCsvFeed', { name: csvFeed.name })}>
          <CsvFeedForm
            onDelete={deleteDocument}
            userCanDelete={userCanDelete}
            csvFeed={csvFeed}
          />
        </SheetWithPreventingDialog>
      )}
    </>
  );
};
