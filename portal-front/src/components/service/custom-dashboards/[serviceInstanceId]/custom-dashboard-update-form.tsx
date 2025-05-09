import { zodResolver } from '@hookform/resolvers/zod';

import { getLabels } from '@/components/admin/label/label.utils';
import { PortalContext } from '@/components/me/app-portal-context';
import { DocumentAddMutation } from '@/components/service/document/document.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import MarkdownInput from '@/components/ui/MarkdownInput';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import revalidatePathActions from '@/utils/actions/revalidatePath.actions';
import { PUBLIC_DASHBOARD_URL } from '@/utils/path/constant';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { documentAddMutation } from '@generated/documentAddMutation.graphql';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { AddIcon, DeleteIcon } from 'filigran-icon';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SheetFooter,
  Textarea,
  toast,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-relay';
import slugify from 'slugify';
import { z } from 'zod';

const fileListCheck = (file: FileList | undefined) => file && file.length > 0;

export const updateCustomDashboardSchema = z.object({
  name: z.string().min(1, 'Required'),
  shortDescription: z.string().max(255).min(1, 'Required'),
  productVersion: z.string().regex(/^\d+\.\d+\.\d+$/, {
    message: 'Product version must be X.Y.Z',
  }),
  description: z.string().min(1, 'Required'),
  uploader_organization_id: z.string().min(1, 'Required'),
  labels: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  images: z.custom<FileList>(fileListCheck).optional(),
  slug: z.string().min(1, 'Required'),
});

interface CustomDashboardFormProps {
  customDashboard: customDashboardsItem_fragment$data;
  serviceInstanceId: string;
  handleSubmit: (
    values: z.infer<typeof updateCustomDashboardSchema>,
    callback: () => void
  ) => void;
  onDelete?: (id?: string) => void;
  userCanDelete: boolean;
  userCanUpdate: boolean;
}

type CustomDashboardUpdateFormValues = z.infer<
  typeof updateCustomDashboardSchema
>;

export const CustomDashboardUpdateForm = ({
  customDashboard,
  serviceInstanceId,
  handleSubmit,
  onDelete,
  userCanDelete,
  userCanUpdate,
}: CustomDashboardFormProps) => {
  const t = useTranslations();
  const { handleCloseSheet, setIsDirty } = useDialogContext();

  const { me } = useContext(PortalContext);

  const form = useForm<CustomDashboardUpdateFormValues>({
    resolver: zodResolver(updateCustomDashboardSchema),
    defaultValues: {
      name: customDashboard.name ?? '',
      shortDescription: customDashboard.short_description ?? '',
      productVersion: customDashboard.product_version ?? '',
      description: customDashboard.description ?? '',
      uploader_organization_id: customDashboard.uploader_organization?.id ?? '',
      active: customDashboard.active ?? false,
      labels: customDashboard.labels?.map((obj) => obj?.id) ?? [],
      slug: customDashboard.slug ?? '',
      images:
        (customDashboard.children_documents?.map((n) => ({
          ...n,
          name: n?.file_name,
        })) as unknown as FileList) ?? [],
    },
  });

  useEffect(() => setIsDirty(form.formState.isDirty), [form.formState.isDirty]);

  const onSubmit = (values: z.infer<typeof updateCustomDashboardSchema>) => {
    handleSubmit(values, () => form.reset());
  };

  const [currentDashboard, setCurrentDashboard] = useState<
    Partial<customDashboardsItem_fragment$data> | undefined
  >(customDashboard);

  const [openDelete, setOpenDelete] = useState<string>('');
  const [addDocument] = useMutation<documentAddMutation>(DocumentAddMutation);

  const uploadNewImage = (image: File) => {
    revalidatePathActions([`${PUBLIC_DASHBOARD_URL}/${customDashboard.slug}`]);
    return addDocument({
      variables: {
        name: customDashboard.name,
        document: { 0: image },
        parentDocumentId: customDashboard.id,
        serviceInstanceId,
        connections: [],
        type: 'custom_dashboard',
      },
      uploadables: { 0: image },
      updater: (store, response) => {
        if (response?.addDocument?.id) {
          const newNode = store.get(response!.addDocument!.id);
          if (!newNode) {
            return;
          }
          const items = store
            .get<documentItem_fragment$data>(customDashboard.id)
            ?.getLinkedRecords<'children_documents'>('children_documents');
          store
            .get(customDashboard.id)
            ?.setLinkedRecords(
              [...(items ?? []), newNode],
              'children_documents'
            );
        }
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

  const handleNameChange = (value: string) => {
    const slug = form.getValues('slug');
    if (
      !form.formState.dirtyFields.slug &&
      typeof slug !== 'undefined' &&
      slug.trim() === ''
    ) {
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
          {userCanUpdate && (
            <>
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
                name="uploader_organization_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('OrganizationInServiceAction.Organization')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
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
                        {t(
                          'Service.CustomDashboards.Form.PublishedPlaceholder'
                        )}
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={'images'}
                render={({ field: { value, ref } }) => {
                  const inputRef = useRef<HTMLInputElement | null>(null);
                  return (
                    <FormItem>
                      <FormLabel className="flex items-center h-6">
                        {t('Service.CustomDashboards.Form.ImageLabel')}
                        <Button
                          size="icon"
                          variant="link"
                          onClick={(e) => {
                            e.preventDefault();
                            inputRef.current!.click();
                          }}>
                          <AddIcon className="size-3" />
                        </Button>
                      </FormLabel>
                      <FormControl>
                        <FileInput
                          multiple
                          hidden
                          name={'images'}
                          onChangeCapture={(
                            e: ChangeEvent<HTMLInputElement>
                          ) => {
                            if (e.target?.files) {
                              for (let i = 0; i < e.target.files.length; i++) {
                                const image = e.target.files.item(i);
                                uploadNewImage(image!);
                              }
                            }
                          }}
                          texts={{
                            selectFile: t(
                              'Service.CustomDashboards.Form.UploadImage'
                            ),
                            noFile: t('Service.CustomDashboards.Form.NoImage'),
                            dropFiles: t(
                              'Service.Vault.FileForm.DropDocuments'
                            ),
                          }}
                          allowedTypes={'image/jpeg, image/png'}
                          ref={(e: HTMLInputElement) => {
                            ref(e);
                            inputRef.current = e;
                          }}
                          value={value ? [value] : []}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              {(customDashboard?.children_documents?.length ?? 0) > 0 && (
                <div className="grid grid-cols-1 s:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-xl min-h-[15rem] pb-xl">
                  {customDashboard.children_documents!.map((doc) => (
                    <div
                      key={doc!.id}
                      style={{
                        backgroundImage: `url(/document/visualize/${customDashboard!.id}/${doc!.id})`,
                        backgroundSize: 'cover',
                      }}
                      className="min-h-[15rem] border rounded relative">
                      <Button
                        variant="outline-destructive"
                        size="icon"
                        className="absolute right-2 top-2"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenDelete(doc!.id);
                        }}>
                        <DeleteIcon className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <AlertDialogComponent
                AlertTitle={t('DialogActions.ContinueTitle')}
                actionButtonText={t('MenuActions.Continue')}
                variantName={'destructive'}
                isOpen={!!openDelete}
                onOpenChange={() => setOpenDelete('')}
                onClickContinue={() => {
                  onDelete!(openDelete);
                  const newDashboard = { ...currentDashboard };
                  newDashboard.children_documents =
                    currentDashboard!.children_documents!.filter(
                      (c) => c?.id !== openDelete
                    );
                  setCurrentDashboard(newDashboard);
                  form.setValue(
                    'images',
                    [].filter.call(
                      form.getValues('images'),
                      ({ id }) => id !== openDelete
                    ) as unknown as FileList
                  );
                  setOpenDelete('');
                }}>
                {t('DialogActions.DeleteSentence')}
              </AlertDialogComponent>{' '}
            </>
          )}

          <SheetFooter className="sm:justify-between pb-0">
            {userCanDelete && (
              <Button
                variant="outline-destructive"
                type="button"
                onClick={(e) => {
                  onDelete?.();
                  handleCloseSheet(e);
                }}>
                {t('Utils.Delete')}
              </Button>
            )}
            <div className="ml-auto flex gap-s">
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
