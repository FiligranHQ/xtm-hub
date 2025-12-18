import { ServiceContextProps } from '@/components/service/components/service-context';
import { ServiceFormValues } from '@/components/service/components/subscribable-services.types';
import {
  CustomDashboardForm,
  CustomDashboardFormValues,
} from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-form';
import {
  CustomDashboardDeleteMutation,
  CustomDashboardsCreateMutation,
  CustomDashboardsUpdateMutation,
} from '@/components/service/custom-dashboards/custom-dashboard.graphql';
import { omit } from '@/lib/omit';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { FormImagesValues, splitExistingAndNewImages } from '@/utils/documents';
import {
  ShareableResource,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { toast } from '@filigran/ui';
import { customDashboardDeleteMutation } from '@generated/customDashboardDeleteMutation.graphql';
import { customDashboardsCreateMutation } from '@generated/customDashboardsCreateMutation.graphql';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { customDashboardsUpdateMutation } from '@generated/customDashboardsUpdateMutation.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useMutation } from 'react-relay';

export function useCustomDashboardsContext(
  serviceInstance: serviceInstance_fragment$data,
  connectionId?: string
): ServiceContextProps {
  const t = useTranslations();
  const [createCustomDashboards] = useMutation<customDashboardsCreateMutation>(
    CustomDashboardsCreateMutation
  );

  const handleAddSheet = async (
    values: ServiceFormValues,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => {
    const formValues = values as CustomDashboardFormValues;
    const input = {
      ...omit(formValues, ['document', 'images', 'uploader_organization_id']),
      uploader_id: formValues?.uploader_id ?? '',
    };
    const documents = [
      ...Array.from(formValues.document),
      ...Array.from(formValues.images),
    ];

    createCustomDashboards({
      variables: {
        input: {
          ...input,
          active: input.active ?? false,
        },
        serviceInstanceId: serviceInstance.id,
        connections: connectionId ? [connectionId] : [],
        document: documents,
      },
      uploadables: fileListToUploadableMap(documents),

      onCompleted: (response) => {
        if (!response.createCustomDashboard) {
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

  const [deleteCustomDashboardMutation] =
    useMutation<customDashboardDeleteMutation>(CustomDashboardDeleteMutation);

  const handleDeleteSheet = async (
    document: ShareableResource,
    onCompleted: () => void
  ) => {
    deleteCustomDashboardMutation({
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

  const [updateCustomDashboardMutation] =
    useMutation<customDashboardsUpdateMutation>(CustomDashboardsUpdateMutation);

  const handleUpdateSheet = async (
    values: ServiceFormValues,
    resource: ShareableResource,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => {
    const customDashboard = resource as customDashboardsItem_fragment$data;
    const formValues = values as CustomDashboardFormValues;
    const input = {
      ...omit(formValues, ['document', 'images']),
      uploader_id: formValues?.uploader_id ?? '',
    };

    // Split images between existing and new ones
    const images = Array.from(formValues.images ?? []) as FormImagesValues;
    const [existingImages, newImages] = splitExistingAndNewImages(images);
    const documentsToUpload = [
      ...Array.from(values.document ?? []), // We need null to keep the first place in the uploadables array for the document
      ...newImages,
    ];
    updateCustomDashboardMutation({
      variables: {
        input,
        serviceInstanceId: serviceInstance.id,
        document: documentsToUpload,
        documentId: customDashboard.id,
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
