import { zodResolver } from '@hookform/resolvers/zod';

import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
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
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const fileListCheck = (file: FileList | undefined) => file && file.length > 0;

const updateCustomDashboardSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().optional(),
  active: z.boolean().optional(),
  images: z.custom<FileList>(fileListCheck).optional(),
});

export const newCustomDashboardSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().optional(),
  documentId: z.string().optional(),
  parentDocumentId: z.string().optional(),
  document: z.custom<FileList>(fileListCheck),
  images: z.custom<FileList>(fileListCheck),
  active: z.boolean().optional(),
});

export type CustomDashboardFormValues = z.infer<
  typeof newCustomDashboardSchema
>;

interface CustomDashboardFormProps {
  customDashboard?: documentItem_fragment$data;
  handleSubmit: (
    values: z.infer<typeof newCustomDashboardSchema>,
    callback: () => void
  ) => void;
  onDelete?: (id?: string) => void;
}

export const CustomDashboardForm = ({
  customDashboard,
  handleSubmit,
  onDelete,
}: CustomDashboardFormProps) => {
  const t = useTranslations();
  const { handleCloseSheet, setIsDirty } = useDialogContext();

  const form = useForm<CustomDashboardFormValues>({
    resolver: customDashboard
      ? zodResolver(updateCustomDashboardSchema)
      : zodResolver(newCustomDashboardSchema),
    defaultValues: {
      name: customDashboard?.name ?? '',
      description: customDashboard?.description ?? '',
      documentId: customDashboard?.id ?? '',
      active: customDashboard?.active ?? false,
      document: undefined,
      images: undefined,
    },
  });

  useEffect(() => setIsDirty(form.formState.isDirty), [form.formState.isDirty]);

  const onSubmit = (values: z.infer<typeof newCustomDashboardSchema>) => {
    if (values.images?.length > 3) {
      form.setError('images', {
        type: 'manual',
        message: 'Too much images uploaded, max 3.',
      });
      return;
    }
    handleSubmit(
      {
        ...values,
      },
      () => form.reset()
    );
  };

  const [currentDashboard, setCurrentDashboard] = useState<
    documentItem_fragment$data | undefined
  >(customDashboard);

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
            disabled={!!customDashboard}
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
          {currentDashboard?.children_documents && (
            <div className="flex gap-xl">
              {currentDashboard.children_documents.map(({ id }) => (
                <div
                  key={id}
                  style={{
                    backgroundImage: `url(/document/visualize/${customDashboard!.id}/${id})`,
                    backgroundSize: 'cover',
                  }}
                  className="h-[10rem] w-[10rem] border rounded relative">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 rounded-[100%]"
                    onClick={() => {
                      onDelete!(id);
                      const newDashboard = { ...currentDashboard };
                      newDashboard.children_documents =
                        currentDashboard!.children_documents!.filter(
                          (c) => c.id !== id
                        );
                      setCurrentDashboard(newDashboard);
                    }}>
                    <DeleteIcon className="w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <SheetFooter className="pt-2 sm:justify-between">
            <Button
              variant="destructive"
              type="button"
              onClick={(e) => {
                onDelete?.();
                handleCloseSheet(e);
              }}>
              {t('Utils.Delete')}
            </Button>
            <div className="flex gap-s">
              <Button
                variant="outline"
                type="button"
                onClick={(e) => handleCloseSheet(e)}>
                {t('Utils.Cancel')}
              </Button>

              <Button
                disabled={!form.formState.isValid}
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
