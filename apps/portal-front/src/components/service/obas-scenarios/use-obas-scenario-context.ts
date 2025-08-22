import { ServiceContextProps } from '@/components/service/components/service-context';
import { ServiceFormValues } from '@/components/service/components/subscribable-services.types';
import {
  ObasScenarioForm,
  ObasScenarioFormValues,
} from '@/components/service/obas-scenarios/[serviceInstanceId]/obas-scenario-form';
import {
  ObasScenarioCreateMutation,
  ObasScenarioDeleteMutation,
  ObasScenarioUpdateMutation,
} from '@/components/service/obas-scenarios/obas-scenario.graphql';
import { omit } from '@/lib/omit';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { FormImagesValues, splitExistingAndNewImages } from '@/utils/documents';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { obasScenarioCreateMutation } from '@generated/obasScenarioCreateMutation.graphql';
import { obasScenarioDeleteMutation } from '@generated/obasScenarioDeleteMutation.graphql';
import { obasScenarioUpdateMutation } from '@generated/obasScenarioUpdateMutation.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useMutation } from 'react-relay';

export function useObasScenarioContext(
  serviceInstance: serviceInstance_fragment$data,
  connectionId?: string
): ServiceContextProps {
  const t = useTranslations();

  const [createObasScenario] = useMutation<obasScenarioCreateMutation>(
    ObasScenarioCreateMutation
  );

  const handleAddSheet = async (
    values: ServiceFormValues,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => {
    const formValues = values as ObasScenarioFormValues;
    const input = {
      ...omit(formValues, ['document', 'illustration']),
      uploader_id: formValues?.uploader_id ?? '',
    };
    const documents = [
      ...Array.from(formValues.document),
      ...Array.from(formValues.illustration),
    ];

    createObasScenario({
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
        if (!response.createObasScenario) {
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

  const [deleteObasScenarioMutation] = useMutation<obasScenarioDeleteMutation>(
    ObasScenarioDeleteMutation
  );

  const handleDeleteSheet = async (
    document: ShareableResource,
    onCompleted: () => void
  ) => {
    deleteObasScenarioMutation({
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

  const [updateObasScenarioMutation] = useMutation<obasScenarioUpdateMutation>(
    ObasScenarioUpdateMutation
  );

  const handleUpdateSheet = async (
    values: ServiceFormValues,
    resource: ShareableResource,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => {
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
    updateObasScenarioMutation({
      variables: {
        input,
        serviceInstanceId: serviceInstance.id,
        document: documentsToUpload,
        documentId: resource.id,
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
    translationKey: 'Service.ObasScenario',
    handleAddSheet,
    handleUpdateSheet,
    handleDeleteSheet,
    ServiceForm: ObasScenarioForm,
  };
}
