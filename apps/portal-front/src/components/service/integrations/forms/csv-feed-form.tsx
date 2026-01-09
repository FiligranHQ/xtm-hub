import { getLabels } from '@/components/admin/label/label.utils';
import { PortalContext } from '@/components/me/app-portal-context';
import { useServiceContext } from '@/components/service/components/service-context';
import { ServiceDelete } from '@/components/service/components/service-delete';
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
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import { useContext, useMemo } from 'react';
import slugify from 'slugify';
import { z } from 'zod';

const csvFeedFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  uploader_id: z.string().optional(),
  short_description: z.string().min(1, 'Required').max(250),
  description: z.string().min(1, 'Required'),
  uploader_organization_id: z.string().min(1, 'Required'),
  integration_type: z.string().min(1, 'Required'),
  labels: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  document: z.custom<FileList>(fileListCheck),
  images: z.custom<FileList>(fileListCheck),
});
export type CsvFeedFormValues = z.infer<typeof csvFeedFormSchema>;

interface CsvFeedFormProps {
  userCanDelete?: boolean;
  handleSubmit?: (values: CsvFeedFormValues) => void;
  onDelete?: () => void;
  document: SubscribableResource | undefined;
}

export const CsvFeedForm = ({
  userCanDelete,
  handleSubmit,
  onDelete,
  document,
}: CsvFeedFormProps) => {
  const csvFeed = document;
  const t = useTranslations();
  const { me } = useContext(PortalContext);
  const { handleCloseSheet } = useDialogContext();
  const { translationKey } = useServiceContext();

  const isCreation = !csvFeed;

  const values = useMemo(
    () =>
      ({
        ...csvFeed,
        images: csvFeed?.children_documents?.map((doc) => ({
          ...doc,
          name: doc.file_name,
        })) as unknown as FileList,
        labels: csvFeed?.labels?.map((label) => label.id),
        uploader_id: csvFeed?.uploader?.id ?? me!.id,
        uploader_organization_id:
          (isCreation
            ? me?.selected_organization_id
            : csvFeed?.uploader_organization?.id) ?? '',
        integration_type: IntegrationTypeEnum.CSV_FEED,
      }) as CsvFeedFormValues,
    [me, csvFeed, isCreation]
  );
  const formSchema = useMemo(
    () =>
      csvFeed
        ? csvFeedFormSchema.extend({
            document: z.custom<FileList>(fileListCheck).optional(),
            images: z.custom<FileList>(fileListCheck).optional(),
          })
        : csvFeedFormSchema,
    [csvFeed]
  );

  return (
    <>
      <AutoForm
        onSubmit={(values, _methods) => {
          handleSubmit?.(values as CsvFeedFormValues);
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
                  {t(`${translationKey}.Form.DescriptionLabel`)}
                </FormLabel>
                <FormControl>
                  <MarkdownInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={`${translationKey}.Form.DescriptionPlaceholder`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            ),
          },
          labels: {
            fieldType: ({ field }) => (
              <FormItem>
                <FormLabel>{t(`${translationKey}.Form.LabelsLabel`)}</FormLabel>
                <FormControl>
                  <MultiSelectFormField
                    noResultString={t('Utils.NotFound')}
                    options={getLabels()}
                    keyValue="id"
                    keyLabel="name"
                    defaultValue={field.value}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t(`${translationKey}.Form.LabelsPlaceholder`)}
                    variant="inverted"
                  />
                </FormControl>
              </FormItem>
            ),
          },
          uploader_id: {
            fieldType: ({ field }) => (
              <FormItem>
                <FormLabel>{t(`${translationKey}.Form.Author`)}</FormLabel>
                <FormControl>
                  <SelectUsersFormField
                    defaultValue={csvFeed?.uploader?.email ?? me!.email}
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
                      : csvFeed?.uploader_organization?.id) ?? ''
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
                label: t(`${translationKey}.Form.CsvFeedFile`),
                fieldType: 'file',
                inputProps: {
                  allowedTypes: 'application/json',
                  multiple: 'multiple',
                },
              }
            : {
                fieldType: ({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t(`${translationKey}.Form.ExistingCsvFeedFile`, {
                        file_name: field.value?.[0].name ?? csvFeed?.file_name,
                      })}
                    </FormLabel>
                    <FormControl>
                      <div>
                        <FileInputWithPrevent
                          field={field}
                          texts={{
                            selectFile: t(
                              `${translationKey}.Form.UpdateJSONFile`
                            ),
                            dialogTitle: t(
                              `${translationKey}.Form.UpdateJSONFile`
                            ),
                            dialogDescription: t(
                              `${translationKey}.Form.DescriptionUpdateJSONFile`
                            ),
                          }}
                          allowedTypes="application/json"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ),
              },
          images: {
            label: t(`${translationKey}.Form.CsvFeedIllustration`),
            fieldType: 'file',
            inputProps: {
              allowedTypes: 'image/jpeg, image/png',
            },
          },
          active: {
            label: t(`${translationKey}.Form.PublishedPlaceholder`),
          },
          short_description: {
            label: t(`${translationKey}.Form.ShortDescriptionLabel`),
          },
          slug: {
            label: t(`${translationKey}.Form.SlugLabel`),
          },
          name: {
            label: t(`${translationKey}.Form.NameLabel`),
          },
          integration_type: { fieldType: () => <FormItem hidden={true} /> },
        }}>
        <SheetFooter className="sm:justify-between pt-2">
          {csvFeed && (
            <ServiceDelete
              userCanDelete={userCanDelete}
              onDelete={onDelete}
              serviceName={csvFeed.name}
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
