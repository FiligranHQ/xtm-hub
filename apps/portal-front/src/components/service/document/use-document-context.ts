import { ServiceContextProps } from '@/components/service/components/service-context';
import {
  ServiceForm,
  ServiceFormValues,
} from '@/components/service/components/subscribable-services.types';
import { CustomDashboardForm } from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-form';
import {
  DocumentCreateMutation,
  DocumentDeleteMutation,
  DocumentUpdateMutation,
} from '@/components/service/document/document.graphql';
import { CsvFeedForm } from '@/components/service/integrations/forms/csv-feed-form';
import { TaxiiFeedForm } from '@/components/service/integrations/forms/taxii-feed-form';
import { OpenaevScenarioForm } from '@/components/service/openaev-scenarios/[serviceInstanceId]/openaev-scenario-form';
import { omit } from '@/lib/omit';
import { pick } from '@/lib/pick';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { FormImagesValues, splitExistingAndNewImages } from '@/utils/documents';
import {
  ShareableResource,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { toast } from '@filigran/ui';
import { documentCreateMutation } from '@generated/documentCreateMutation.graphql';
import { documentDeleteMutation } from '@generated/documentDeleteMutation.graphql';
import { documentUpdateMutation } from '@generated/documentUpdateMutation.graphql';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useMutation } from 'react-relay';

const documentBaseKeys: Array<keyof ServiceFormValues> = [
  'name',
  'slug',
  'uploader_id',
  'uploader_organization_id',
  'short_description',
  'description',
  'labels',
  'active',
];

const documentFileKeys: Array<keyof ServiceFormValues> = ['document', 'images'];

interface UseDocumentContextProps {
  serviceInstance: serviceInstance_fragment$data;
  connectionId?: string;
  type: ShareableResourceType;
}

export function useDocumentContext({
  serviceInstance,
  connectionId,
  type,
}: UseDocumentContextProps): ServiceContextProps {
  const [integrationType, setIntegrationType] = useState<IntegrationTypeEnum>(
    IntegrationTypeEnum.CSV_FEED
  );
  const t = useTranslations();
  const [createMutation] = useMutation<documentCreateMutation>(
    DocumentCreateMutation
  );

  const handleAddSheet = async (
    values: ServiceFormValues,
    onSuccess: (serviceName: string) => void,
    onError: (error: Error) => void
  ) => {
    const input = omit(
      {
        ...pick(values, documentBaseKeys),
        uploader_id: values?.uploader_id ?? '',
      },
      ['uploader_organization_id']
    );
    const metadata = omit(values, [...documentBaseKeys, 'document', 'images']);

    const documents = [
      ...Array.from(values.document),
      ...Array.from(values.images),
    ];

    createMutation({
      variables: {
        input: {
          ...input,
          active: input.active ?? false,
        },
        metadata: Object.keys(metadata).map((key) => ({
          key,
          value: metadata[key as keyof typeof metadata],
        })),
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
    const input = {
      ...pick(values, documentBaseKeys),
      uploader_id: values?.uploader_id ?? '',
    };

    const metadata = omit(values, [...documentBaseKeys, ...documentFileKeys]);

    // Split images between existing and new ones
    const images = Array.from(values.images ?? []) as FormImagesValues;
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
        documentId: resource.id,
        metadata: Object.keys(metadata).map((key) => ({
          key,
          value: metadata[key as keyof typeof metadata],
        })),
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

  const form = useMemo(() => {
    const formMapping: Record<ShareableResourceType, () => ServiceForm> = {
      [ShareableResourceType.OPENAEV_SCENARIO]: () => OpenaevScenarioForm,
      [ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD]: () =>
        CustomDashboardForm,
      [ShareableResourceType.OPENCTI_INTEGRATION]: () => {
        return integrationType === IntegrationTypeEnum.CSV_FEED
          ? CsvFeedForm
          : TaxiiFeedForm;
      },
    };

    return formMapping[type]();
  }, [type, integrationType]);

  const translationKey = useMemo(() => {
    const translationKeyMapping: Record<ShareableResourceType, () => string> = {
      [ShareableResourceType.OPENAEV_SCENARIO]: () => 'Service.OpenAEVScenario',
      [ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD]: () =>
        'Service.OpenctiCustomDashboards',
      [ShareableResourceType.OPENCTI_INTEGRATION]: () => {
        return integrationType === IntegrationTypeEnum.CSV_FEED
          ? 'Service.CsvFeed'
          : 'Service.TaxiiFeed';
      },
    };

    return translationKeyMapping[type]();
  }, [type, integrationType]);

  return {
    serviceInstance,
    handleAddSheet,
    handleUpdateSheet,
    handleDeleteSheet,
    ServiceForm: form,
    translationKey,
    type,
    setIntegrationType,
  };
}
