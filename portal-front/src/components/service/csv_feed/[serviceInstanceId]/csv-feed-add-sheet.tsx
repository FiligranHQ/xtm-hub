'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import {
  CsvFeedCreateForm,
  CsvFeedCreateFormValues,
} from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed-create-form';
import { CsvFeedCreateMutation } from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed.graphql';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import TriggerButton from '@/components/ui/trigger-button';
import useServiceCapability from '@/hooks/useServiceCapability';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { csvFeedCreateMutation } from '@generated/csvFeedCreateMutation.graphql';
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
        verified_json_text: values.verified_json_text,
        serviceInstanceId: serviceInstance.id,
        connections: [connectionId],
      },
      uploadables: fileListToUploadableMap(values.document),

      onCompleted: (response) => {
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
          trigger={<TriggerButton label={t('Service.CsvFeed.AddCsvFeed')} />}
          title={t('Service.CsvFeed.AddCsvFeed')}>
          <CsvFeedCreateForm handleSubmit={handleSubmit} />
        </SheetWithPreventingDialog>
      )}
    </>
  );
};
