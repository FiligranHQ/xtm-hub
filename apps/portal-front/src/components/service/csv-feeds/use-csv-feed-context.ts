import { ServiceContextProps } from '@/components/service/components/service-context';
import {
  CsvFeedForm,
  CsvFeedFormValues,
} from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feed-form';
import {
  CsvFeedCreateMutation,
  CsvFeedDeleteMutation,
  CsvFeedUpdateMutation,
} from '@/components/service/csv-feeds/csv-feed.graphql';
import { omit } from '@/lib/omit';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { FormImagesValues, splitExistingAndNewImages } from '@/utils/documents';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { csvFeedCreateMutation } from '@generated/csvFeedCreateMutation.graphql';
import { csvFeedDeleteMutation } from '@generated/csvFeedDeleteMutation.graphql';
import { csvFeedUpdateMutation } from '@generated/csvFeedUpdateMutation.graphql';
import { csvFeedsItem_fragment$data } from '@generated/csvFeedsItem_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useMutation } from 'react-relay';

export function useCsvFeedContext(
  serviceInstance: serviceInstance_fragment$data,
  connectionId?: string
): ServiceContextProps {
  const t = useTranslations();
  const [createCsvFeed] = useMutation<csvFeedCreateMutation>(
    CsvFeedCreateMutation
  );

  const handleAddSheet = async (
    values: CsvFeedFormValues,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => {
    const input = {
      ...omit(values, ['document', 'illustration']),
      uploader_id: values?.uploader_id ?? '',
    };
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
        connections: [connectionId ?? ''],
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

        onSuccess(input.name);
      },
      onError: (error) => {
        onError(error);
      },
    });
  };

  const [deleteCsvFeedMutation] = useMutation<csvFeedDeleteMutation>(
    CsvFeedDeleteMutation
  );

  const handleDeleteSheet = async (
    document: ShareableResource,
    onCompleted: () => void
  ) => {
    deleteCsvFeedMutation({
      variables: {
        documentId: document.id,
        serviceInstanceId: serviceInstance.id,
        connections: connectionId ? [connectionId] : [],
      },
      onCompleted() {
        onCompleted();
      },
    });
  };

  const [updateCsvFeedMutation] = useMutation<csvFeedUpdateMutation>(
    CsvFeedUpdateMutation
  );

  const handleUpdateSheet = async (
    values: CsvFeedFormValues,
    resource: ShareableResource,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => {
    const csvFeed = resource as csvFeedsItem_fragment$data;
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
        onSuccess(values.name);
      },
      onError: (error) => {
        onError(error);
      },
    });
  };

  return {
    serviceInstance,
    translationKey: 'Service.CsvFeed',
    handleAddSheet,
    handleUpdateSheet,
    handleDeleteSheet,
    ServiceForm: CsvFeedForm,
  };
}
