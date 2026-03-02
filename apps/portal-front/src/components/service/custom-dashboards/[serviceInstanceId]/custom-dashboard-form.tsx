import { PortalContext } from '@/components/me/app-portal-context';
import { ServiceFormJsonFileField } from '@/components/service/form/json-file-field';
import { ServiceFormSheetFooter } from '@/components/service/form/sheet-footer';
import { useServiceFormFields } from '@/components/service/form/use-service-form-fields';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { ExistingFile, fileListCheck, NewFile } from '@/utils/documents';
import { AutoForm } from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useContext, useMemo, useState } from 'react';
import slugify from 'slugify';
import { z } from 'zod';

const customDashboardSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  uploader_id: z.string().optional(),
  short_description: z.string().max(255).min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  product_version: z.string().regex(/^\d+\.\d+\.\d+$/, {
    error: 'Product version must be X.Y.Z',
  }),
  uploader_organization_id: z.string().min(1, 'Required'),
  use_cases: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  document: z.custom<FileList>(fileListCheck),
  images: z.custom<FileList>(fileListCheck),
});

export type CustomDashboardFormValues = z.infer<typeof customDashboardSchema>;

interface CustomDashboardFormProps {
  document: documentItem_fragment$data | undefined;
  handleSubmit: (values: CustomDashboardFormValues) => void;
}

export const CustomDashboardForm = ({
  document,
  handleSubmit,
}: CustomDashboardFormProps) => {
  const t = useTranslations();
  const { handleCloseSheet, setIsDirty } = useDialogContext();

  const { me } = useContext(PortalContext);

  const isCreation = !document;

  const [images, setImages] = useState<Array<ExistingFile | NewFile>>(
    document?.children_documents as unknown as ExistingFile[]
  );
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const onSubmit = (values: CustomDashboardFormValues) => {
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
        images: document?.children_documents?.map((doc) => ({
          ...doc,
          name: doc.file_name,
        })) as unknown as FileList,
        use_cases: document?.use_cases?.map((useCase) => useCase.id),
        uploader_id: document?.uploader?.id ?? me?.id,
        uploader_organization_id:
          (isCreation
            ? me?.selected_organization_id
            : document?.uploader_organization?.id) ?? '',
      }) as CustomDashboardFormValues,
    [me, document, isCreation]
  );
  const formSchema = useMemo(
    () =>
      document
        ? customDashboardSchema.extend({
            document: z.custom<FileList>(fileListCheck).optional(),
            images: z.custom<FileList>(fileListCheck).optional(),
          })
        : customDashboardSchema,
    [document]
  );

  const {
    active,
    name,
    short_description,
    slug,
    product_version,
    description,
    use_cases,
    uploader_id,
    uploader_organization_id,
    images: imagesField,
  } = useServiceFormFields({
    documentType: 'Custom Dashboard',
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
    <AutoForm
      onSubmit={(values, _methods) => {
        onSubmit(values as CustomDashboardFormValues);
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
        images: imagesField,
        active,
        short_description,
        slug,
        name,
        product_version,
      }}>
      <ServiceFormSheetFooter handleCloseSheet={handleCloseSheet} />
    </AutoForm>
  );
};
