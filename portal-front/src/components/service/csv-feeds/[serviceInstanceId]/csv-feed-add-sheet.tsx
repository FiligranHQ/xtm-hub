'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import {
  CsvFeedCreateFormValues,
  CsvFeedForm,
} from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feed-form';
import { Button } from 'filigran-ui';

import { CsvFeedsCreateMutation } from '@/components/service/csv-feeds/csv-feed.graphql';
import { DocumentAddMutation } from '@/components/service/document/document.graphql';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useServiceCapability from '@/hooks/useServiceCapability';
import { omit } from '@/lib/omit';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { csvFeedsCreateMutation } from '@generated/csvFeedsCreateMutation.graphql';
import { documentAddMutation } from '@generated/documentAddMutation.graphql';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useMutation } from 'react-relay';

interface CSVFeedAddSheetProps {
  connectionId: string;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

export const CSVFeedAddSheet = ({
  serviceInstance,
  connectionId,
}: CSVFeedAddSheetProps) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);
  const [createCsvFeed] = useMutation<csvFeedsCreateMutation>(
    CsvFeedsCreateMutation
  );

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );
  const [addDocument] = useMutation<documentAddMutation>(DocumentAddMutation);

  const addIllustrationDocument = (
    image: FileList,
    csvFeedName: string,
    csvFeedId: string
  ) => {
    return addDocument({
      variables: {
        name: csvFeedName,
        document: { 0: image },
        parentDocumentId: csvFeedId,
        serviceInstanceId: serviceInstance.id,
        connections: [],
        type: 'csv-feed',
      },
      uploadables: fileListToUploadableMap(image),
      updater: (store, response) => {
        if (response?.addDocument?.id) {
          const newNode = store.get(response!.addDocument!.id);
          if (!newNode) {
            return;
          }
          const items = store
            .get<documentItem_fragment$data>(csvFeedId)
            ?.getLinkedRecords<'children_documents'>('children_documents');
          store
            .get(csvFeedId)
            ?.setLinkedRecords(
              [...(items ?? []), newNode],
              'children_documents'
            );
        }
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${(error as Error).message}`),
        });
      },
    });
  };
  const handleSubmit = async (values: CsvFeedCreateFormValues) => {
    const input = omit(values, ['document', 'illustration']);
    const documents = [
      ...Array.from(values.document),
      ...Array.from(values.illustration),
    ];

    createCsvFeed({
      variables: {
        input: {
          ...input,
          active: input.active ?? false,
        },
        serviceInstanceId: serviceInstance.id,
        connections: [connectionId],
        document: documents,
      },
      uploadables: fileListToUploadableMap(documents),

      onCompleted: (response) => {
        if (!response.createCsvFeed) {
          toast({
            variant: 'destructive',
            title: t('Utils.Error'),
            description: t('Error.AnErrorOccured'),
          });
          return;
        }

        setOpenSheet(false);

        toast({
          title: t('Utils.Success'),
          description: t('Service.CsvFeed.Actions.Added', {
            name: response.createCsvFeed?.name,
          }),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${(error as Error).message}`),
        });
      },
    });
  };

  return (
    <>
      {userCanUpdate && (
        <SheetWithPreventingDialog
          open={openSheet}
          setOpen={setOpenSheet}
          trigger={<Button>{t('Service.CsvFeed.AddCsvFeed')}</Button>}
          title={t('Service.CsvFeed.AddCsvFeed')}>
          <CsvFeedForm handleSubmit={handleSubmit} />
        </SheetWithPreventingDialog>
      )}
    </>
  );
};
