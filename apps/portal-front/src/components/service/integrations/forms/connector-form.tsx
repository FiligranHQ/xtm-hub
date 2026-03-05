import { PortalContext } from '@/components/me/app-portal-context';
import { ServiceFormMultipleImagesFieldImages } from '@/components/service/form/multiple-images-field';
import { ServiceFormSheetFooter } from '@/components/service/form/sheet-footer';
import { useServiceFormFields } from '@/components/service/form/use-service-form-fields';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { fileListCheck } from '@/utils/documents';
import { AutoForm, FormItem } from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useContext, useMemo, useState } from 'react';
import { z } from 'zod';

const connectorSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  uploader_id: z.string().optional(),
  short_description: z.string().min(1, 'Required').max(250),
  description: z.string().min(1, 'Required'),
  product_version: z.string().regex(/^\d+\.\d+\.\d+$/, {
    error: 'Product version must be X.Y.Z',
  }),
  uploader_organization_id: z.string().min(1, 'Required'),
  integration_type: z.string().min(1, 'Required'),
  container_image: z.string().min(1, 'Required'),
  source_code: z.string().min(1, 'Required'),
  subscription_link: z.string().min(1, 'Required'),
  integration_subtype: z.string().min(1, 'Required'),
  use_cases: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  verified: z.boolean().optional(),
  manager_supported: z.boolean().optional(),
  playbook_supported: z.boolean().optional(),
  datasheet_url: z.url().or(z.literal('')).nullish(),
  demo_url: z.url().or(z.literal('')).nullish(),
  document: z.custom<FileList>(fileListCheck).optional(), // declared for genericity but not used
  images: z.custom<FileList>(fileListCheck),
});
export type ConnectorFormValues = z.infer<typeof connectorSchema>;

interface ConnectorFormProps {
  handleSubmit: (values: ConnectorFormValues) => void;
  document: documentItem_fragment$data | undefined;
}

export const ConnectorForm = ({
  handleSubmit,
  document,
}: ConnectorFormProps) => {
  const { me } = useContext(PortalContext);
  const { handleCloseSheet, setIsDirty } = useDialogContext();

  const [images, setImages] = useState<
    Array<ServiceFormMultipleImagesFieldImages>
  >(
    document?.children_documents as unknown as ServiceFormMultipleImagesFieldImages[]
  );
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const onSubmit = (values: ConnectorFormValues) => {
    const finalImages = images.filter(
      (img) => !imagesToDelete.includes(img.id)
    );

    const finalValues = {
      ...values,
      images: finalImages as unknown as FileList,
      verified: `${values.verified ?? false}` as unknown as boolean,
      manager_supported:
        `${values.manager_supported ?? false}` as unknown as boolean,
      playbook_supported:
        `${values.playbook_supported ?? false}` as unknown as boolean,
    };
    handleSubmit(finalValues);
  };

  const values = useMemo(
    () =>
      ({
        ...document,
        images: (document?.children_documents?.length
          ? document.children_documents.map((doc) => ({
              ...doc,
              name: doc.file_name,
            }))
          : undefined) as unknown as FileList,
        use_cases: document?.use_cases?.map((label) => label.id),
        uploader_id: document?.uploader?.id ?? me!.id,
        uploader_organization_id: document?.uploader_organization?.id ?? '',
        integration_type: IntegrationTypeEnum.CONNECTOR,
      }) as ConnectorFormValues,
    [me, document]
  );

  const {
    active,
    short_description,
    slug,
    name,
    description,
    use_cases,
    uploader_id,
    uploader_organization_id,
    integration_type,
    datasheet_url,
    demo_url,
    product_version,
    integration_subtype,
    container_image,
    source_code,
    verified,
    manager_supported,
    subscription_link,
    playbook_supported,
    images: imagesField,
  } = useServiceFormFields({
    documentType: 'Connector',
    platform: 'OpenCTI',
    isCreation: false,
    document,
    images,
    setImages,
    imagesToDelete,
    setImagesToDelete,
    setIsDirty,
    disabledFields: [
      'name',
      'slug',
      'uploader_id',
      'short_description',
      'description',
      'uploader_organization_id',
      'use_cases',
      'active',
      'product_version',
      'integration_subtype',
      'container_image',
      'source_code',
      'subscription_link',
      'verified',
      'manager_supported',
      'playbook_supported',
    ],
  });

  if (!document) {
    return null;
  }

  return (
    <>
      <AutoForm
        onSubmit={(values, _methods) => {
          onSubmit(values as ConnectorFormValues);
        }}
        values={values}
        formSchema={connectorSchema}
        fieldConfig={{
          description,
          use_cases,
          uploader_id,
          uploader_organization_id,
          active,
          short_description,
          slug,
          name,
          integration_type,
          datasheet_url,
          product_version,
          demo_url,
          integration_subtype,
          container_image,
          source_code,
          verified,
          manager_supported,
          playbook_supported,
          subscription_link,
          images: imagesField,
          document: { fieldType: () => <FormItem hidden={true} /> },
        }}>
        <ServiceFormSheetFooter handleCloseSheet={handleCloseSheet} />
      </AutoForm>
    </>
  );
};
