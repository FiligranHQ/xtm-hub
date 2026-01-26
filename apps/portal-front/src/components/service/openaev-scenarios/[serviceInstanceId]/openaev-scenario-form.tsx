import { getLabels } from '@/components/admin/label/label.utils';
import { PortalContext } from '@/components/me/app-portal-context';
import FileInputWithPrevent from '@/components/ui/file-input-with-prevent';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SheetFooter,
} from '@filigran/ui';
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
  uploader_organization_id: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  labels: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  document: z.custom<FileList>(fileListCheck),
  images: z.custom<FileList>(fileListCheck).optional(),
});
export type OpenAEVScenarioFormValues = z.infer<
  typeof openAEVScenarioFormSchema
>;

export interface OpenAEVScenarioFormProps {
  handleSubmit?: (values: OpenAEVScenarioFormValues) => void;
  document?: SubscribableResource;
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

  const values = useMemo(
    () =>
      ({
        ...openAEVScenario,
        images: openAEVScenario?.children_documents?.map((doc) => ({
          ...doc,
          name: doc.file_name,
        })) as unknown as FileList,
        labels: openAEVScenario?.labels?.map((label) => label.id),
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
            images: z.custom<FileList>(fileListCheck).optional(),
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
                  {t('Service.OpenAEVScenario.Form.UseCasesLabel')}
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
                      'Service.OpenAEVScenario.Form.UseCasesPlaceholder'
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
          uploader_organization_id: {
            fieldType: ({ field }) => (
              <FormItem hidden={isCreation}>
                <FormLabel>
                  {t('OrganizationInServiceAction.Organization')}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={
                    (isCreation
                      ? me?.selected_organization_id
                      : openAEVScenario?.uploader_organization?.id) ?? ''
                  }>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          'OrganizationInServiceAction.SelectOrganization'
                        )}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {me?.organizations.map((node) => {
                      return (
                        <SelectItem
                          key={node?.id}
                          value={node?.id}>
                          {node?.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            ),
          },
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
          images: {
            label: t(
              'Service.OpenAEVScenario.Form.OpenAEVScenarioIllustration'
            ),
            fieldType: 'file',
            inputProps: {
              accept: 'image/jpeg, image/png',
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
