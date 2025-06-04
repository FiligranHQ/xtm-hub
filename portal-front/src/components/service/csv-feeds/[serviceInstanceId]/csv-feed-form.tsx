import { getLabels } from '@/components/admin/label/label.utils';
import { CsvFeedDelete } from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feed-delete';
import MarkdownInput from '@/components/ui/MarkdownInput';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { csvFeedsItem_fragment$data } from '@generated/csvFeedsItem_fragment.graphql';
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
import { useMemo } from 'react';
import slugify from 'slugify';
import { z } from 'zod';

const fileListCheck = (file: FileList | undefined) => file && file.length > 0;

const csvFeedFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  short_description: z.string().min(1, 'Required').max(250),
  description: z.string().min(1, 'Required'),
  labels: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  document: z.custom<FileList>(fileListCheck),
  illustration: z.custom<FileList>(fileListCheck),
});
export type CsvFeedFormValues = z.infer<typeof csvFeedFormSchema>;

interface CsvFeedFormProps {
  userCanDelete?: boolean;
  handleSubmit?: (values: CsvFeedFormValues) => void;
  onDelete?: () => void;
  csvFeed?: csvFeedsItem_fragment$data;
}

export const CsvFeedForm = ({
  userCanDelete,
  handleSubmit,
  onDelete,
  csvFeed,
}: CsvFeedFormProps) => {
  const t = useTranslations();
  const { handleCloseSheet } = useDialogContext();

  const values = useMemo(
    () =>
      ({
        ...csvFeed,
        illustration: csvFeed?.children_documents?.map((n) => ({
          ...n,
          name: n.file_name,
        })) as unknown as FileList,
      }) as CsvFeedFormValues,
    [csvFeed]
  );
  const formSchema = useMemo(
    () =>
      csvFeed
        ? csvFeedFormSchema.merge(
            z.object({
              document: z.custom<FileList>(fileListCheck).optional(),
              illustration: z.custom<FileList>(fileListCheck).optional(),
            })
          )
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
                  {t('Service.CsvFeed.Form.DescriptionLabel')}
                </FormLabel>
                <FormControl>
                  <MarkdownInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={'Service.CsvFeed.Form.DescriptionPlaceholder'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            ),
          },
          labels: {
            fieldType: ({ field }) => (
              <FormItem>
                <FormControl>
                  <MultiSelectFormField
                    noResultString={t('Utils.NotFound')}
                    options={getLabels().map(({ name, id }) => ({
                      label: name,
                      value: id,
                    }))}
                    value={field.value || []}
                    onValueChange={field.onChange}
                    placeholder={t('Service.CsvFeed.Form.LabelsLabel')}
                    variant="inverted"
                  />
                </FormControl>
              </FormItem>
            ),
          },
          document: {
            label: csvFeed
              ? t('Service.CsvFeed.Form.ExistingCsvFeedFile', {
                  file_name: csvFeed.file_name,
                })
              : t('Service.CsvFeed.Form.CsvFeedFile'),
            fieldType: 'file',
            inputProps: {
              allowedTypes: 'application/json',
              multiple: 'multiple',
            },
          },
          illustration: {
            label: t('Service.CsvFeed.Form.CsvFeedIllustration'),
            fieldType: 'file',
            inputProps: {
              allowedTypes: 'image/jpeg, image/png',
            },
          },
          active: {
            label: t('Service.CsvFeed.Form.PublishedPlaceholder'),
          },
          short_description: {
            label: t('Service.CsvFeed.Form.ShortDescriptionLabel'),
          },
          slug: {
            label: t('Service.CsvFeed.Form.SlugLabel'),
          },
          name: {
            label: t('Service.CsvFeed.Form.NameLabel'),
          },
        }}>
        <SheetFooter className="pt-2">
          {csvFeed && (
            <CsvFeedDelete
              userCanDelete={userCanDelete}
              onDelete={onDelete}
              csvFeed={csvFeed}
            />
          )}
          <div className="flex gap-s">
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
