import { PortalContext } from '@/components/me/app-portal-context';
import { ServiceFormSheetFooter } from '@/components/service/form/sheet-footer';
import { useSimpleServiceFormField } from '@/components/service/form/use-service-form-fields';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { fileListCheck } from '@/utils/documents';
import { AutoForm, FormItem } from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import { useContext, useMemo } from 'react';
import slugify from 'slugify';
import { z } from 'zod';

const thirdPartyIntegrationFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  uploader_id: z.string().optional(),
  short_description: z.string().min(1, 'Required').max(250),
  description: z.string().min(1, 'Required'),
  uploader_organization_id: z.string().min(1, 'Required'),
  integration_type: z.string().min(1, 'Required'),
  use_cases: z.array(z.string()).optional(),
  integration_subtype: z.string().min(1, 'Required'),
  vendor_url: z.url().min(1, 'Required'),
  github_url: z.url().nullish(),
  product_version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, {
      error: 'Product version must be X.Y.Z',
    })
    .nullish(),
  active: z.boolean().optional(),
  document: z.custom<FileList>(fileListCheck).optional(), // declared for genericity but not used
  images: z.custom<FileList>(fileListCheck).optional(),
});

export type ThirdPartyIntegrationFormValues = z.infer<
  typeof thirdPartyIntegrationFormSchema
>;

interface ThirdPartyIntegrationFormProps {
  handleSubmit?: (values: ThirdPartyIntegrationFormValues) => void;
  document: documentItem_fragment$data | undefined;
}

export const ThirdPartyIntegrationForm = ({
  handleSubmit,
  document,
}: ThirdPartyIntegrationFormProps) => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);
  const { handleCloseSheet } = useDialogContext();

  const isCreation = !document;

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
        integration_type: IntegrationTypeEnum.THIRD_PARTY_INTEGRATION,
        integration_subtype: document?.integration_subtype ?? '',
        github_url: document?.github_url,
        product_version: document?.product_version,
        vendor_url: document?.vendor_url,
      }) as ThirdPartyIntegrationFormValues,
    [me, document, isCreation]
  );
  const formSchema = useMemo(() => {
    const extendedSchema = document
      ? thirdPartyIntegrationFormSchema.extend({
          document: z.custom<FileList>(fileListCheck).optional(),
          images: z.custom<FileList>(fileListCheck).optional(),
        })
      : thirdPartyIntegrationFormSchema;

    return extendedSchema.superRefine((data, ctx) => {
      if (data.github_url && !data.product_version) {
        ctx.addIssue({
          path: ['product_version'],
          code: 'custom',
          message: 'Github URL and product version must be filled together',
        });
      }

      if (!data.github_url && data.product_version) {
        ctx.addIssue({
          path: ['github_url'],
          code: 'custom',
          message: 'Github URL and product version must be filled together',
        });
      }
    });
  }, [document]);

  const {
    active,
    short_description,
    slug,
    name,
    product_version,
    vendor_url,
    github_url,
    description,
    use_cases,
    uploader_id,
    uploader_organization_id,
    integration_type,
    integration_subtype,
  } = useSimpleServiceFormField({
    documentType: 'Third Party Integration',
    platform: 'OpenCTI',
    isCreation,
    document,
  });

  return (
    <>
      <AutoForm
        onSubmit={(values, _methods) => {
          handleSubmit?.(values as ThirdPartyIntegrationFormValues);
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
          if (values.product_version === '') {
            form.setValue('product_version', undefined);
          }
          if (values.github_url === '') {
            form.setValue('github_url', undefined);
          }
        }}
        values={values}
        formSchema={formSchema}
        fieldConfig={{
          description,
          use_cases,
          uploader_id,
          uploader_organization_id,
          document: { fieldType: () => <FormItem hidden={true} /> },
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
          vendor_url,
          github_url,
          product_version,
        }}>
        <ServiceFormSheetFooter handleCloseSheet={handleCloseSheet} />
      </AutoForm>
    </>
  );
};
