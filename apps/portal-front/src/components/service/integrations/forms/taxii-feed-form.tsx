import { PortalContext } from '@/components/me/app-portal-context';
import { ServiceFormJsonFileField } from '@/components/service/form/json-file-field';
import { ServiceFormSheetFooter } from '@/components/service/form/sheet-footer';
import { useServiceFormFields } from '@/components/service/form/use-service-form-fields';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { ExistingFile, fileListCheck, NewFile } from '@/utils/documents';
import { AutoForm } from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import { useContext, useMemo, useState } from 'react';
import slugify from 'slugify';
import { z } from 'zod';

const taxiiFeedFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  uploader_id: z.string().optional(),
  short_description: z.string().min(1, 'Required').max(250),
  description: z.string().min(1, 'Required'),
  uploader_organization_id: z.string().min(1, 'Required'),
  integration_type: z.string().min(1, 'Required'),
  use_cases: z.array(z.string()).optional(),
  integration_subtype: z.string().min(1, 'Required'),
  active: z.boolean().optional(),
  datasheet_url: z.url().nullish(),
  demo_url: z.url().nullish(),
  document: z.custom<FileList>(fileListCheck),
  images: z.custom<FileList>(fileListCheck),
});
export type TaxiiFeedFormValues = z.infer<typeof taxiiFeedFormSchema>;

interface TaxiiFeedFormProps {
  handleSubmit: (values: TaxiiFeedFormValues) => void;
  document: documentItem_fragment$data | undefined;
}

export const TaxiiFeedForm = ({
  handleSubmit,
  document,
}: TaxiiFeedFormProps) => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);
  const { handleCloseSheet, setIsDirty } = useDialogContext();

  const isCreation = !document;

  const [images, setImages] = useState<Array<ExistingFile | NewFile>>(
    document?.children_documents as unknown as ExistingFile[]
  );
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const onSubmit = (values: TaxiiFeedFormValues) => {
    if (isCreation) {
      handleSubmit(values);
    } else {
      const finalImages = images.filter(
        (img) => !imagesToDelete.includes(img.id)
      );

      const finalValues = {
        ...values,
        images: finalImages as unknown as FileList,
      };
      handleSubmit(finalValues);
    }
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
        use_cases: document?.use_cases?.map((useCase) => useCase.id),
        uploader_id: document?.uploader?.id ?? me!.id,
        uploader_organization_id:
          (isCreation
            ? me?.selected_organization_id
            : document?.uploader_organization?.id) ?? '',
        integration_type: IntegrationTypeEnum.TAXII_FEED,
        integration_subtype: document?.integration_subtype ?? '',
      }) as TaxiiFeedFormValues,
    [me, document, isCreation]
  );
  const formSchema = useMemo(
    () =>
      document
        ? taxiiFeedFormSchema.extend({
            document: z.custom<FileList>(fileListCheck).optional(),
            images: z.custom<FileList>(fileListCheck).optional(),
          })
        : taxiiFeedFormSchema,
    [document]
  );

  const {
    active,
    name,
    slug,
    short_description,
    description,
    use_cases,
    uploader_organization_id,
    uploader_id,
    integration_type,
    integration_subtype,
    datasheet_url,
    demo_url,
    images: imagesField,
  } = useServiceFormFields({
    documentType: 'TAXII Feed',
    platform: 'OpenCTI',
    isCreation,
    document,
    images,
    setImages,
    imagesToDelete,
    setImagesToDelete,
    setIsDirty,
  });

  return (
    <>
      <AutoForm
        onSubmit={(values, _methods) => {
          onSubmit(values as TaxiiFeedFormValues);
        }}
        onValuesChange={(values, form) => {
          if (values.name) {
            const generatedSlug = slugify(values.name, {
              lower: true,
              strict: true,
            });
            const currentSlug = form.getValues('slug');
            if (currentSlug !== generatedSlug) {
              form.setValue('slug', generatedSlug, { shouldDirty: false });
            }
          }
        }}
        values={values}
        formSchema={formSchema}
        fieldConfig={{
          description,
          use_cases,
          uploader_id,
          uploader_organization_id,
          document: isCreation
            ? {
                label: t('Service.Form.SelectJSONFile'),
                fieldType: 'file',
                inputProps: {
                  accept: 'application/json',
                },
              }
            : {
                fieldType: ({ field }) => (
                  <ServiceFormJsonFileField
                    field={field}
                    setIsDirty={setIsDirty}
                    document={document}
                  />
                ),
              },
          images: imagesField,
          active,
          short_description,
          slug,
          name,
          integration_type,
          integration_subtype,
          datasheet_url,
          demo_url,
        }}>
        <ServiceFormSheetFooter handleCloseSheet={handleCloseSheet} />
      </AutoForm>
    </>
  );
};
