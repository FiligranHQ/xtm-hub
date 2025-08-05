'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import {
  CsvFeedForm,
  CsvFeedFormValues,
} from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feed-form';
import {
  CsvFeedDeleteMutation,
  CsvFeedUpdateMutation,
} from '@/components/service/csv-feeds/csv-feed.graphql';
import { IconActionsButton } from '@/components/ui/icon-actions';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useServiceCapability from '@/hooks/useServiceCapability';
import { omit } from '@/lib/omit';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import revalidatePathActions from '@/utils/actions/revalidatePath.actions';
import { FormImagesValues, splitExistingAndNewImages } from '@/utils/documents';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { csvFeedDeleteMutation } from '@generated/csvFeedDeleteMutation.graphql';
import { csvFeedsItem_fragment$data } from '@generated/csvFeedsItem_fragment.graphql';
import { csvFeedUpdateMutation } from '@generated/csvFeedUpdateMutation.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { Button, toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useMutation } from 'react-relay';

interface CSVFeedUpdateSheetProps {
  connectionId?: string;
  serviceInstance: serviceInstance_fragment$data;
  csvFeed: csvFeedsItem_fragment$data;
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

  const deleteDocument = async () => {
    deleteCsvFeedMutation({
      variables: {
        documentId: csvFeed.id,
        serviceInstanceId: serviceInstance.id,
        connections: [connectionId ?? ''],
      },
      onCompleted() {
        onDelete?.();
      },
    });
    await revalidatePathActions([
      `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
    ]);
  };

  const [updateCsvFeedMutation] = useMutation<csvFeedUpdateMutation>(
    CsvFeedUpdateMutation
  );

  const handleSubmit = (values: CsvFeedFormValues) => {
    const input = {
      ...omit(values, ['document', 'illustration']),
      uploader_id: values?.uploader_id ?? '',
    };

    // Split images between existing and new ones
    const images = Array.from(values.illustration ?? []) as FormImagesValues;
    const [existingImages, newImages] = splitExistingAndNewImages(images);
    const documentsToUpload = [
      ...Array.from(values.document ?? []), // We need null to keep the first place in the uploadables array for the document
      ...newImages,
    ];
    updateCsvFeedMutation({
      variables: {
        input,
        serviceInstanceId: serviceInstance.id,
        document: documentsToUpload,
        documentId: csvFeed.id,
        updateDocument: values.document !== undefined,
        images: existingImages,
      },
      uploadables: fileListToUploadableMap(documentsToUpload),
      onCompleted: () => {
        // If the service has changed, we need to revalidate the path
        // If the slug has changed, it's necessary to revalidate the previous path, as the new one may not yet be cached.
        revalidatePathActions([
          `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${csvFeed.slug}`,
          `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
        ]);
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('VaultActions.DocumentUpdated', {
            file_name: values.name,
          }),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
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
            handleSubmit={handleSubmit}
          />
        </SheetWithPreventingDialog>
      )}
    </>
  );
};
