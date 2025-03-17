import { getLabels } from '@/components/admin/label/label.utils';
import MarkdownInput from '@/components/ui/MarkdownInput';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  FileInput,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  MultiSelectFormField,
  SheetFooter,
  Textarea,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import slugify from 'slugify';
import { z } from 'zod';

const fileListCheck = (file: FileList | undefined) => file && file.length > 0;

export const newCustomDashboardSchema = z.object({
  name: z.string().nonempty(),
  shortDescription: z.string().max(255),
  description: z.string().optional(),
  productVersion: z.string().regex(/^\d+\.\d+\.\d+$/, {
    message: 'Product version must be X.Y.Z',
  }),
  documentId: z.string().optional(),
  parentDocumentId: z.string().optional(),
  document: z.custom<FileList>(fileListCheck),
  images: z.custom<FileList>(fileListCheck),
  active: z.boolean().optional(),
  labels: z.array(z.string()).optional(),
  slug: z.string(),
});

export type CustomDashboardFormValues = z.infer<
  typeof newCustomDashboardSchema
>;

interface CustomDashboardFormProps {
  handleSubmit: (
    values: z.infer<typeof newCustomDashboardSchema>,
    callback: () => void
  ) => void;
}

export const CustomDashboardForm = ({
  handleSubmit,
}: CustomDashboardFormProps) => {
  const t = useTranslations();
  const { handleCloseSheet, setIsDirty } = useDialogContext();

  const form = useForm<CustomDashboardFormValues>({
    resolver: zodResolver(newCustomDashboardSchema),
    criteriaMode: 'all',
    defaultValues: {
      name: '',
      shortDescription: undefined,
      description: '',
      productVersion: '',
      documentId: '',
      active: false,
      document: undefined,
      images: undefined,
      labels: [],
      slug: '',
    },
  });

  useEffect(() => setIsDirty(form.formState.isDirty), [form.formState.isDirty]);
  form.watch(['images', 'document']);

  const onSubmit = (values: z.infer<typeof newCustomDashboardSchema>) => {
    handleSubmit(
      {
        ...values,
      },
      () => form.reset()
    );
  };

  const handleNameChange = (value: string) => {
    if (!form.formState.dirtyFields.slug) {
      const generatedSlug = slugify(value, { lower: true, strict: true });
      form.setValue('slug', generatedSlug, { shouldDirty: false });
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-xl">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('Service.CustomDashboards.Form.NameLabel')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      'Service.CustomDashboards.Form.NamePlaceholder'
                    )}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleNameChange(e.target.value);
                      return true;
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('Service.CustomDashboards.Form.SlugLabel')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      'Service.CustomDashboards.Form.SlugPlaceholder'
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('Service.CustomDashboards.Form.ShortDescriptionLabel')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t(
                      'Service.CustomDashboards.Form.ShortDescriptionPlaceholder'
                    )}
                    maxLength={250}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="productVersion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('Service.CustomDashboards.Form.productVersion')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      'Service.CustomDashboards.Form.productVersionPlaceholder'
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('Service.CustomDashboards.Form.DescriptionLabel')}
                </FormLabel>
                <FormControl>
                  <MarkdownInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={
                      'Service.CustomDashboards.Form.DescriptionPlaceholder'
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="labels"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('Service.CustomDashboards.Form.LabelsLabel')}
                </FormLabel>
                <FormControl>
                  <MultiSelectFormField
                    noResultString={t('Utils.NotFound')}
                    options={getLabels().map(({ name, id }) => ({
                      label: name,
                      value: id,
                    }))}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder={t(
                      'Service.CustomDashboards.Form.LabelsPlaceholder'
                    )}
                    variant="inverted"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('Service.CustomDashboards.Form.PublishedLabel')}
                </FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      {...field}
                      checked={field.value}
                      value="on"
                      onCheckedChange={() =>
                        form.setValue('active', !field.value)
                      }
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    {t('Service.CustomDashboards.Form.PublishedPlaceholder')}
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="document"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    {t('Service.CustomDashboards.Form.JSONFile')}
                  </FormLabel>
                  <FormControl>
                    <FileInput
                      {...field}
                      texts={{
                        selectFile: t(
                          'Service.CustomDashboards.Form.SelectJSONFile'
                        ),
                        noFile: t('Service.CustomDashboards.Form.NoJSONFile'),
                        dropFiles: t('Service.Vault.FileForm.DropDocuments'),
                      }}
                      allowedTypes={'application/json'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name={'images'}
            render={({ field: { value, ref } }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 h-6">
                  {t('Service.CustomDashboards.Form.ImageLabel')}
                </FormLabel>
                <FormControl>
                  <FileInput
                    multiple
                    name={'images'}
                    texts={{
                      selectFile: t(
                        'Service.CustomDashboards.Form.SelectImage'
                      ),
                      noFile: t('Service.CustomDashboards.Form.NoImage'),
                      dropFiles: t('Service.Vault.FileForm.DropDocuments'),
                    }}
                    allowedTypes={'image/jpeg, image/png'}
                    ref={ref}
                    value={value ? [value] : []}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SheetFooter className="pt-2">
            <div className="flex gap-s">
              <Button
                variant="outline"
                type="button"
                onClick={(e) => handleCloseSheet(e)}>
                {t('Utils.Cancel')}
              </Button>

              <Button
                disabled={!form.formState.isDirty}
                type="submit">
                {t('Utils.Validate')}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </Form>
    </>
  );
};
