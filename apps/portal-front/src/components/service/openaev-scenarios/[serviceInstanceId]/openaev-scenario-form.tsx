import { PortalContext } from '@/components/me/app-portal-context';
import { ServiceFormMultipleImagesFieldImages } from '@/components/service/form/multiple-images-field';
import { ServiceFormSheetFooter } from '@/components/service/form/sheet-footer';
import { useServiceFormFields } from '@/components/service/form/use-service-form-fields';
import FileInputWithPrevent from '@/components/ui/file-input-with-prevent';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { fileListCheck, optionalFileListCheck } from '@/utils/documents';
import {
  AutoForm,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useContext, useMemo, useState } from 'react';
import slugify from 'slugify';
import { z } from 'zod';

const openAEVScenarioFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  uploader_id: z.string().optional(),
  short_description: z.string().min(1, 'Required').max(250),
  product_version: z.string().regex(/^\d+\.\d+\.\d+$/, {
    error: 'Product version must be X.Y.Z',
  }),
  uploader_organization_id: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  use_cases: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  document: z.custom<FileList>(fileListCheck),
  images: z.custom<FileList>(optionalFileListCheck),
});
export type OpenAEVScenarioFormValues = z.infer<
  typeof openAEVScenarioFormSchema
>;

export interface OpenAEVScenarioFormProps {
  handleSubmit: (values: OpenAEVScenarioFormValues) => void;
  document?: documentItem_fragment$data;
}

export const OpenaevScenarioForm = ({
  handleSubmit,
  document,
}: OpenAEVScenarioFormProps) => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);

  const openAEVScenario = document;
  const isCreation = !openAEVScenario;
  const { handleCloseSheet, setIsDirty } = useDialogContext();
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const [images, setImages] = useState<
    Array<ServiceFormMultipleImagesFieldImages>
  >(
    openAEVScenario?.children_documents as unknown as ServiceFormMultipleImagesFieldImages[]
  );
  const onSubmit = (values: OpenAEVScenarioFormValues) => {
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
        ...openAEVScenario,
        images: openAEVScenario?.children_documents?.map((doc) => ({
          ...doc,
          name: doc.file_name,
        })) as unknown as FileList,
        use_cases: openAEVScenario?.use_cases?.map((useCase) => useCase.id),
        uploader_id: openAEVScenario?.uploader?.id ?? me?.id,
        uploader_organization_id:
          (isCreation
            ? me?.selected_organization_id
            : openAEVScenario?.uploader_organization?.id) ?? '',
      }) as OpenAEVScenarioFormValues,
    [me, openAEVScenario, isCreation]
  );
  const formSchema = useMemo(
    () =>
      openAEVScenario
        ? openAEVScenarioFormSchema.extend({
            document: z.custom<FileList>(fileListCheck).optional(),
            images: z.custom<FileList>(optionalFileListCheck).optional(),
          })
        : openAEVScenarioFormSchema,
    [openAEVScenario]
  );

  const {
    active,
    slug,
    name,
    short_description,
    product_version,
    description,
    uploader_organization_id,
    uploader_id,
    use_cases,
    images: imagesField,
  } = useServiceFormFields({
    documentType: 'Scenario',
    platform: 'OpenAEV',
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
        onSubmit(values as OpenAEVScenarioFormValues);
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
              label: t('Service.OpenAEVScenario.Form.OpenAEVScenarioFile'),
              fieldType: 'file',
              inputProps: {
                accept: 'application/zip',
                multiple: 'multiple',
              },
            }
          : {
              fieldType: ({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(
                      'Service.OpenAEVScenario.Form.ExistingOpenAEVScenarioFile',
                      {
                        file_name:
                          field.value?.[0].name ?? openAEVScenario?.file_name,
                      }
                    )}
                  </FormLabel>
                  <FormControl>
                    <div onClick={() => setIsDirty(true)}>
                      <FileInputWithPrevent
                        field={field}
                        texts={{
                          selectFile: t(
                            'Service.OpenAEVScenario.Form.UpdateZIPFile'
                          ),
                          dialogTitle: t(
                            'Service.OpenAEVScenario.Form.UpdateZIPFile'
                          ),
                          dialogDescription: t(
                            'Service.OpenAEVScenario.Form.DescriptionUpdateZIPFile'
                          ),
                        }}
                        allowedTypes="application/zip"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
