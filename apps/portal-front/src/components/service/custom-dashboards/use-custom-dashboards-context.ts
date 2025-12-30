import { ServiceContextProps } from '@/components/service/components/service-context';
import { ServiceFormValues } from '@/components/service/components/subscribable-services.types';
import {
  CustomDashboardForm,
  CustomDashboardFormValues,
} from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-form';
import {
  DocumentCreateMutation,
  DocumentDeleteMutation,
  DocumentUpdateMutation,
} from '@/components/service/document/document.graphql';
import { omit } from '@/lib/omit';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { FormImagesValues, splitExistingAndNewImages } from '@/utils/documents';
import {
  ShareableResource,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { documentCreateMutation } from '@generated/documentCreateMutation.graphql';
import { documentDeleteMutation } from '@generated/documentDeleteMutation.graphql';
import { documentUpdateMutation } from '@generated/documentUpdateMutation.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useMutation } from 'react-relay';

export function useCustomDashboardsContext(
  serviceInstance: serviceInstance_fragment$data,
  connectionId?: string
): ServiceContextProps {
  const t = useTranslations();
  const [createMutation] = useMutation<documentCreateMutation>(
    DocumentCreateMutation
  );

  const handleAddSheet = async (
    values: ServiceFormValues,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => {
    const formValues = values as CustomDashboardFormValues;
    const input = {
      ...omit(formValues, [
        'document',
        'images',
        'uploader_organization_id',
        'product_version',
      ]),
      uploader_id: formValues?.uploader_id ?? '',
    };
    const documents = [
      ...Array.from(formValues.document),
      ...Array.from(formValues.images),
    ];

    createMutation({
      variables: {
        input: {
          ...input,
          active: input.active ?? false,
        },
        metadata: [
          { key: 'product_version', value: formValues.product_version },
        ],
        serviceInstanceId: serviceInstance.id,
        connections: connectionId ? [connectionId] : [],
        document: documents,
      },
      uploadables: fileListToUploadableMap(documents),

      onCompleted: (response) => {
        if (!response.createDocument) {
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

  const [deleteMutation] = useMutation<documentDeleteMutation>(
    DocumentDeleteMutation
  );

  const handleDeleteSheet = async (
    document: ShareableResource,
    onCompleted: () => void
  ) => {
    deleteMutation({
      variables: {
        documentId: document.id,
        serviceInstanceId: serviceInstance.id,
        connections: connectionId ? [connectionId] : [],
        forceDelete: true,
      },
      onCompleted() {
        onCompleted();
      },
    });
  };

  const [updateMutation] = useMutation<documentUpdateMutation>(
    DocumentUpdateMutation
  );

  const handleUpdateSheet = async (
    values: ServiceFormValues,
    resource: ShareableResource,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => {
    const customDashboard = resource as customDashboardsItem_fragment$data;
    const formValues = values as CustomDashboardFormValues;
    const input = {
      ...omit(formValues, ['document', 'images', 'product_version']),
      uploader_id: formValues?.uploader_id ?? '',
    };

    // Split images between existing and new ones
    const images = Array.from(formValues.images ?? []) as FormImagesValues;
    const [existingImages, newImages] = splitExistingAndNewImages(images);
    const documentsToUpload = [
      ...Array.from(values.document ?? []), // We need null to keep the first place in the uploadables array for the document
      ...newImages,
    ];
    updateMutation({
      variables: {
        input,
        serviceInstanceId: serviceInstance.id,
        document: documentsToUpload,
        documentId: customDashboard.id,
        metadata: [
          { key: 'product_version', value: formValues.product_version },
        ],
        updateDocument: formValues.document !== undefined,
        images: existingImages,
      },
      uploadables: fileListToUploadableMap(documentsToUpload),
      onCompleted: () => {
        onSuccess(formValues.name);
      },
      onError: (error) => {
        onError(error);
      },
    });
  };

  return {
    serviceInstance,
    translationKey: 'Service.OpenctiCustomDashboards',
    handleAddSheet,
    handleUpdateSheet,
    handleDeleteSheet,
    ServiceForm: CustomDashboardForm,
    type: ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD,
  };
}
