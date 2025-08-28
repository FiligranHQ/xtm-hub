import { ServiceContextProps } from '@/components/service/components/service-context';
import { ServiceFormValues } from '@/components/service/components/subscribable-services.types';
import {
  OpenaevScenarioForm,
  OpenAEVScenarioFormValues,
} from '@/components/service/openaev-scenarios/[serviceInstanceId]/openaev-scenario-form';
import {
  OpenaevScenarioCreateMutation,
  OpenaevScenarioDeleteMutation,
  OpenaevScenarioUpdateMutation,
} from '@/components/service/openaev-scenarios/openaev-scenario.graphql';
import { omit } from '@/lib/omit';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { FormImagesValues, splitExistingAndNewImages } from '@/utils/documents';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { openaevScenarioCreateMutation } from '@generated/openaevScenarioCreateMutation.graphql';
import { openaevScenarioDeleteMutation } from '@generated/openaevScenarioDeleteMutation.graphql';
import { openaevScenarioUpdateMutation } from '@generated/openaevScenarioUpdateMutation.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useMutation } from 'react-relay';

export function useOpenaevScenarioContext(
  serviceInstance: serviceInstance_fragment$data,
  connectionId?: string
): ServiceContextProps {
  const t = useTranslations();

  const [createOpenAEVScenario] = useMutation<openaevScenarioCreateMutation>(
    OpenaevScenarioCreateMutation
  );

  const handleAddSheet = async (
    values: ServiceFormValues,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => {
    const formValues = values as OpenAEVScenarioFormValues;
    const input = {
      ...omit(formValues, ['document', 'illustration']),
      uploader_id: formValues?.uploader_id ?? '',
    };
    const documents = [
      ...Array.from(formValues.document),
      ...Array.from(formValues.illustration),
    ];

    createOpenAEVScenario({
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
        if (!response.createOpenAEVScenario) {
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

  const [deleteOpenAEVScenarioMutation] =
    useMutation<openaevScenarioDeleteMutation>(OpenaevScenarioDeleteMutation);

  const handleDeleteSheet = async (
    document: ShareableResource,
    onCompleted: () => void
  ) => {
    deleteOpenAEVScenarioMutation({
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

  const [updateOpenAEVScenarioMutation] =
    useMutation<openaevScenarioUpdateMutation>(OpenaevScenarioUpdateMutation);

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
    updateOpenAEVScenarioMutation({
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
    ServiceForm: OpenaevScenarioForm,
  };
}
