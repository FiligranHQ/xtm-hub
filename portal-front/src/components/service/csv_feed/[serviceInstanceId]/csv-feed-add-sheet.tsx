'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import {
  CsvFeedCreateFormValues,
  CsvFeedForm,
} from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed-form';
import { Button } from 'filigran-ui';

import { CsvFeedCreateMutation } from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed.graphql';
import { DocumentAddMutation } from '@/components/service/document/document.graphql';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useServiceCapability from '@/hooks/useServiceCapability';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { csvFeedCreateMutation } from '@generated/csvFeedCreateMutation.graphql';
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
  const [createCsvFeed] = useMutation<csvFeedCreateMutation>(
    CsvFeedCreateMutation
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
    createCsvFeed({
      variables: {
        input: {
          name: values.name,
          short_description: values.short_description,
          description: values.description,
          active: values.active ?? false,
          labels: values.labels,
        },
        serviceInstanceId: serviceInstance.id,
        connections: [connectionId],
      },
      uploadables: fileListToUploadableMap(values.document),

      onCompleted: (response) => {
        setOpenSheet(false);

        addIllustrationDocument(
          values.illustration,
          response.createCsvFeed?.name ?? '',
          response.createCsvFeed?.id ?? ''
        );

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
