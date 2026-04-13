import { PortalContext } from '@/components/me/app-portal-context';
import { ServiceFormJsonFileField } from '@/components/service/form/json-file-field';
import { ServiceFormSheetFooter } from '@/components/service/form/sheet-footer';
import { useServiceFormFields } from '@/components/service/form/use-service-form-fields';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import {
  fileListCheck,
  optionalFileListCheck,
  transformToFileList,
} from '@/utils/documents';
import { AutoForm } from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { DocumentImageTypeEnum } from '@generated/models/DocumentImageType.enum';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import { useContext, useMemo } from 'react';
import slugify from 'slugify';
import { z } from 'zod';

const streamFormSchema = z.object({
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
  datasheet_url: z.url().or(z.literal('')).nullish(),
  blogpost_url: z.url().or(z.literal('')).nullish(),
  demo_url: z.url().or(z.literal('')).nullish(),
  document: z.custom<FileList>(fileListCheck),
  logo: z.custom<FileList>(optionalFileListCheck).optional(),
  images: z.custom<FileList>(optionalFileListCheck),
});
export type StreamFormValues = z.infer<typeof streamFormSchema>;

interface StreamFormProps {
  handleSubmit: (values: StreamFormValues) => void;
  document: documentItem_fragment$data | undefined;
}

export const StreamForm = ({ handleSubmit, document }: StreamFormProps) => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);
  const { handleCloseSheet, setIsDirty } = useDialogContext();

  const isCreation = !document;

  const onSubmit = (values: StreamFormValues) => {
    if (isCreation) {
      handleSubmit({ ...values, images: images as unknown as FileList });
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
        images: transformToFileList(DocumentImageTypeEnum.IMAGE, document),
        logo: transformToFileList(DocumentImageTypeEnum.LOGO, document),
        use_cases: document?.use_cases?.map((label) => label.id),
        uploader_id: document?.uploader?.id ?? me!.id,
        uploader_organization_id:
          (isCreation
            ? me?.selected_organization_id
            : document?.uploader_organization?.id) ?? '',
        integration_type: IntegrationTypeEnum.STREAM,
        integration_subtype: document?.integration_subtype ?? '',
      }) as StreamFormValues,
    [me, document, isCreation]
  );
  const formSchema = useMemo(
    () =>
      document
        ? streamFormSchema.extend({
            document: z.custom<FileList>(fileListCheck).optional(),
            images: z.custom<FileList>(optionalFileListCheck).optional(),
          })
        : streamFormSchema,
    [document]
  );

  const {
    active,
    slug,
    name,
    short_description,
    description,
    uploader_organization_id,
    uploader_id,
    use_cases,
    integration_subtype,
    integration_type,
    datasheet_url,
    blogpost_url,
    demo_url,
    imagesField,
    images,
    imagesToDelete,
    logo,
  } = useServiceFormFields({
    documentType: 'Stream',
    platform: 'OpenCTI',
    document,
  });

  return (
    <>
      <AutoForm
        onSubmit={(values, _methods) => {
          onSubmit(values as StreamFormValues);
        }}
        onValuesChange={(values, form) => {
          if (isCreation && values.name) {
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
          logo,
          images: imagesField,
          active,
          short_description,
          slug,
          name,
          integration_type,
          integration_subtype,
          datasheet_url,
          blogpost_url,
          demo_url,
        }}>
        <ServiceFormSheetFooter handleCloseSheet={handleCloseSheet} />
      </AutoForm>
    </>
  );
};
