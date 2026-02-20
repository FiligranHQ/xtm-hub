import { PortalContext } from '@/components/me/app-portal-context';
import { ServiceFormJsonFileField } from '@/components/service/form/json-file-field';
import { ServiceFormSheetFooter } from '@/components/service/form/sheet-footer';
import { useSimpleServiceFormField } from '@/components/service/form/use-service-form-fields';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { fileListCheck } from '@/utils/documents';
import { AutoForm } from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import { useContext, useMemo } from 'react';
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
  document: z.custom<FileList>(fileListCheck),
  images: z.custom<FileList>(fileListCheck).optional(),
});
export type TaxiiFeedFormValues = z.infer<typeof taxiiFeedFormSchema>;

interface TaxiiFeedFormProps {
  handleSubmit?: (values: TaxiiFeedFormValues) => void;
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

  const values = useMemo(
    () =>
      ({
        ...document,
        images: document?.children_documents?.map((doc) => ({
          ...doc,
          name: doc.file_name,
        })) as unknown as FileList,
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
  } = useSimpleServiceFormField({
    documentType: 'TAXII Feed',
    platform: 'OpenCTI',
    isCreation,
    document,
  });

  return (
    <>
      <AutoForm
        onSubmit={(values, _methods) => {
          handleSubmit?.(values as TaxiiFeedFormValues);
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
                  allowedTypes: 'application/json',
                  multiple: 'multiple',
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
          images: {
            label: t('Service.Form.Illustration'),
            fieldType: 'file',
            inputProps: {
              accept: 'image/jpeg, image/png',
            },
          },
          active,
          short_description,
          slug,
          name,
          integration_type,
          integration_subtype,
        }}>
        <ServiceFormSheetFooter handleCloseSheet={handleCloseSheet} />
      </AutoForm>
    </>
  );
};
