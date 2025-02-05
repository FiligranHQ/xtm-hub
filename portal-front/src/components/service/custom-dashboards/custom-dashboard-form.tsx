import { zodResolver } from '@hookform/resolvers/zod';

import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { DeleteIcon } from 'filigran-icon';
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
  SheetFooter,
  Textarea,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

const fileListCheck = (file: FileList | undefined) => file && file.length > 0;

export const newCustomDashboardSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().optional(),
  documentId: z.string().optional(),
  parentDocumentId: z.string().optional(),
  document: z.custom<FileList>(fileListCheck),
  images: z
    .array(z.object({ file: z.custom<FileList>(fileListCheck).optional() }))
    .min(1)
    .max(5),
  active: z.boolean().optional(),
});

export type CustomDashboardFormValues = z.infer<
  typeof newCustomDashboardSchema
>;

interface CustomDashboardFormProps {
  document?: documentItem_fragment$data;
  handleSubmit: (values: z.infer<typeof newCustomDashboardSchema>) => void;
  serviceInstanceId: NonNullable<
    serviceByIdQuery$data['serviceInstanceById']
  >['id'];
}

export const CustomDashboardForm = ({
  document,
  handleSubmit,
}: CustomDashboardFormProps) => {
  const t = useTranslations();
  const { handleCloseSheet, setIsDirty } = useDialogContext();

  const form = useForm<CustomDashboardFormValues>({
    resolver: zodResolver(newCustomDashboardSchema),
    defaultValues: {
      name: document?.name ?? '',
      description: document?.description ?? '',
      documentId: document?.id ?? '',
      document: undefined,
      images: [{ file: undefined }],
      active: document?.active ?? false,
    },
  });

  setIsDirty(form.formState.isDirty);
  if (form.getValues('document') || form.getValues('images')) {
    setIsDirty(true);
  }

  const { fields, append, remove } = useFieldArray<
    CustomDashboardFormValues,
    'images'
  >({
    control: form.control,
    name: 'images',
  });
  const watchedImages = useWatch({
    control: form.control,
    name: 'images',
  });
  useEffect(() => {
    if (watchedImages.length) {
      const lastImage = watchedImages[watchedImages.length - 1];
      // Ici, on suppose que la présence d'un fichier dans lastImage indique qu'il faut ajouter un nouvel input.
      if (lastImage?.file !== undefined && watchedImages.length < 5) {
        append({ file: undefined });
      }
    }
  }, [watchedImages, append]);

  const onSubmit = (values: z.infer<typeof newCustomDashboardSchema>) => {
    handleSubmit({
      ...values,
    });
    form.reset();
  };

  return (
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
                <Textarea
                  placeholder={t(
                    'Service.CustomDashboards.Form.DescriptionPlaceholder'
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
                    value="1"
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

        {fields.map((fieldItem, index) => (
          <FormField
            key={fieldItem.id}
            control={form.control}
            // Le nom devient "images.0.file", "images.1.file", etc.
            name={`images.${index}.file` as const}
            render={({ field: { value, ref } }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 h-6">
                  {t('Service.CustomDashboards.Form.ImageLabel', {
                    num: index + 1,
                  })}
                  {index < fields.length - 1 && (
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={() => remove(index)}
                      className="h-6 px-2">
                      <DeleteIcon className="h-3 w-3" />
                    </Button>
                  )}
                </FormLabel>
                <FormControl>
                  <FileInput
                    name={`images.${index}.file` as const}
                    texts={{
                      selectFile: t(
                        'Service.CustomDashboards.Form.SelectImage',
                        { num: index + 1 }
                      ),
                      noFile: t('Service.CustomDashboards.Form.NoImage', {
                        num: index + 1,
                      }),
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
        ))}

        <SheetFooter className="pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={(e) => handleCloseSheet(e)}>
            {t('Utils.Cancel')}
          </Button>

          <Button type="submit">{t('Utils.Validate')}</Button>
        </SheetFooter>
      </form>
    </Form>
  );
};
