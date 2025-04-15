'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import {
  CsvFeedAddForm,
  CsvFeedAddFormValues,
} from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed-add-form';
import { CsvFeedAddMutation } from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed.graphql';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import TriggerButton from '@/components/ui/trigger-button';
import useServiceCapability from '@/hooks/useServiceCapability';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { csvFeedAddMutation } from '@generated/csvFeedAddMutation.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useMutation } from 'react-relay';

interface CSVFeedAddSheetProps {
  connectionId: string;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

export const CSVFeedAddSheet = ({ serviceInstance }: CSVFeedAddSheetProps) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);
  const [addCsvFeed] = useMutation<csvFeedAddMutation>(CsvFeedAddMutation);

  const handleSubmit = async (values: CsvFeedAddFormValues) => {
    addCsvFeed({
      variables: {
        input: {
          name: values.name,
          short_description: values.short_description,
          description: values.description,
          active: values.active,
          labels: values.labels,
        },
        serviceInstanceId: serviceInstance.id,
        connections: [''],
      },
      uploadables: fileListToUploadableMap(values.document),

      onCompleted: (response) => {
        setOpenSheet(false);

        toast({
          title: t('Utils.Success'),
          description: t('Service.CsvFeed.Actions.Added', {
            name: response.addCsvFeed?.name,
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

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  return (
    <>
      {userCanUpdate && (
        <SheetWithPreventingDialog
          open={openSheet}
          setOpen={setOpenSheet}
          trigger={<TriggerButton label={t('Service.CsvFeed.AddCsvFeed')} />}
          title={t('Service.CsvFeed.AddCsvFeed')}>
          <CsvFeedAddForm handleSubmit={handleSubmit} />
        </SheetWithPreventingDialog>
      )}
    </>
  );
};
