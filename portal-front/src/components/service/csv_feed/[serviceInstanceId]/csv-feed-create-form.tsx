import { getLabels } from '@/components/admin/label/label.utils';
import MarkdownInput from '@/components/ui/MarkdownInput';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
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
import { z } from 'zod';

const fileListCheck = (file: FileList | undefined) => file && file.length > 0;

export const csvFeedCreateFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  short_description: z.string().min(1, 'Required').max(250),
  description: z.string().min(1, 'Required'),
  labels: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  document: z.custom<FileList>(fileListCheck),
});
export type CsvFeedCreateFormValues = z.infer<typeof csvFeedCreateFormSchema>;

interface CsvFeedCreateFormProps {
  handleSubmit: (values: z.infer<typeof csvFeedCreateFormSchema>) => void;
}

export const CsvFeedCreateForm = ({ handleSubmit }: CsvFeedCreateFormProps) => {
  const t = useTranslations();
  const { handleCloseSheet } = useDialogContext();

  return (
    <>
      <AutoForm
        onSubmit={(values, _methods) => {
          handleSubmit(values as z.infer<typeof csvFeedCreateFormSchema>);
        }}
        formSchema={csvFeedCreateFormSchema}
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
            fieldType: 'file',
            inputProps: {
              allowedTypes: 'application/json',
              multiple: 'multiple',
            },
          },
          active: {
            label: t('Service.CsvFeed.Form.PublishedPlaceholder'),
          },
          short_description: {
            label: t('Service.CsvFeed.Form.ShortDescriptionLabel'),
          },
          name: {
            label: t('Service.CsvFeed.Form.NameLabel'),
          },
        }}>
        <SheetFooter className="pt-2">
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
