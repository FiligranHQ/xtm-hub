import { getLabels } from '@/components/admin/label/label.utils';
import { PortalContext } from '@/components/me/app-portal-context';
import { useServiceContext } from '@/components/service/components/service-context';
import { ServiceDelete } from '@/components/service/components/service-delete';
import MarkdownInput from '@/components/ui/MarkdownInput';
import SelectUsersFormField from '@/components/ui/select-users';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { fileListCheck } from '@/utils/documents';
import { SubscribableResource } from '@/utils/shareable-resources/shareable-resources.types';
import {
  AutoForm,
  Button,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  MultiSelectFormField,
  SheetFooter,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useContext, useMemo } from 'react';
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
  description: z.string().min(1, 'Required'),
  labels: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  document: z.custom<FileList>(fileListCheck),
  illustration: z.custom<FileList>(fileListCheck),
});
export type OpenAEVScenarioFormValues = z.infer<
  typeof openAEVScenarioFormSchema
>;

export interface OpenAEVScenarioFormProps {
  userCanDelete?: boolean;
  handleSubmit?: (values: OpenAEVScenarioFormValues) => void;
  onDelete?: () => void;
  document?: SubscribableResource;
}

export const OpenaevScenarioForm = ({
  userCanDelete,
  handleSubmit,
  onDelete,
  document,
}: OpenAEVScenarioFormProps) => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);
  const { translationKey } = useServiceContext();

  const openAEVScenario = document;
  const { handleCloseSheet } = useDialogContext();

  const values = useMemo(
    () =>
      ({
        ...openAEVScenario,
        illustration: openAEVScenario?.children_documents?.map((doc) => ({
          ...doc,
          name: doc.file_name,
        })) as unknown as FileList,
        labels: openAEVScenario?.labels?.map((label) => label.id),
        uploader_id: openAEVScenario?.uploader?.id ?? me?.id,
      }) as OpenAEVScenarioFormValues,
    [me, openAEVScenario]
  );
  const formSchema = useMemo(
    () =>
      openAEVScenario
        ? openAEVScenarioFormSchema.extend({
            document: z.custom<FileList>(fileListCheck).optional(),
            illustration: z.custom<FileList>(fileListCheck).optional(),
          })
        : openAEVScenarioFormSchema,
    [openAEVScenario]
  );

  return (
    <>
      <AutoForm
        onSubmit={(values, _methods) => {
          handleSubmit?.(values as OpenAEVScenarioFormValues);
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
          description: {
            fieldType: ({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('Service.OpenAEVScenario.Form.DescriptionLabel')}
                </FormLabel>
                <FormControl>
                  <MarkdownInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={
                      'Service.OpenAEVScenario.Form.DescriptionPlaceholder'
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            ),
          },
          labels: {
            fieldType: ({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('Service.OpenAEVScenario.Form.LabelsLabel')}
                </FormLabel>
                <FormControl>
                  <MultiSelectFormField
                    noResultString={t('Utils.NotFound')}
                    options={getLabels()}
                    keyValue="id"
                    keyLabel="name"
                    defaultValue={field.value}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t(
                      'Service.OpenAEVScenario.Form.LabelsPlaceholder'
                    )}
                    variant="inverted"
                  />
                </FormControl>
              </FormItem>
            ),
          },
          uploader_id: {
            fieldType: ({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('Service.OpenAEVScenario.Form.Author')}
                </FormLabel>
                <FormControl>
                  <SelectUsersFormField
                    defaultValue={openAEVScenario?.uploader?.email ?? me!.email}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            ),
          },
          document: {
            label: openAEVScenario
              ? t('Service.OpenAEVScenario.Form.ExistingOpenAEVScenarioFile', {
                  file_name: openAEVScenario.file_name ?? '',
                })
              : t('Service.OpenAEVScenario.Form.OpenAEVScenarioFile'),
            fieldType: 'file',
            inputProps: {
              allowedTypes: 'application/zip',
              multiple: 'multiple',
            },
          },
          illustration: {
            label: t(
              'Service.OpenAEVScenario.Form.OpenAEVScenarioIllustration'
            ),
            fieldType: 'file',
            inputProps: {
              allowedTypes: 'image/jpeg, image/png',
            },
          },
          active: {
            label: t('Service.OpenAEVScenario.Form.PublishedPlaceholder'),
          },
          short_description: {
            label: t('Service.OpenAEVScenario.Form.ShortDescriptionLabel'),
          },
          slug: {
            label: t('Service.OpenAEVScenario.Form.SlugLabel'),
          },
          name: {
            label: t('Service.OpenAEVScenario.Form.NameLabel'),
          },
          product_version: {
            label: t('Service.OpenAEVScenario.Form.ProductVersionLabel'),
          },
        }}>
        <SheetFooter className="sm:justify-between pt-2">
          {openAEVScenario && (
            <ServiceDelete
              userCanDelete={userCanDelete}
              onDelete={onDelete}
              serviceName={openAEVScenario.name}
              translationKey={translationKey}
            />
          )}
          <div className="ml-auto flex gap-s">
            <Button
              variant="outline"
              type="button"
              onClick={(e) => handleCloseSheet(e)}>
              {t('Utils.Cancel')}
            </Button>

            <Button>{t('Utils.Validate')}</Button>
          </div>
        </SheetFooter>
      </AutoForm>
    </>
  );
};
