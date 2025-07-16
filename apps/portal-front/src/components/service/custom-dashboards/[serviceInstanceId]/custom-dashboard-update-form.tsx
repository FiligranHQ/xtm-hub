import { zodResolver } from '@hookform/resolvers/zod';

import { getLabels } from '@/components/admin/label/label.utils';
import { PortalContext } from '@/components/me/app-portal-context';
import FileInputWithPrevent from '@/components/ui/file-input-with-prevent';
import MarkdownInput from '@/components/ui/MarkdownInput';
import SelectUsersFormField from '@/components/ui/select-users';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { fileToBase64 } from '@/lib/utils';
import {
  ExistingFile,
  NewFile,
  docIsExistingFile,
  fileListCheck,
} from '@/utils/documents';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { AddIcon, DeleteIcon, ReplayIcon } from 'filigran-icon';
import {
  AutoForm,
  Button,
  FileInput,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import {
  ChangeEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import slugify from 'slugify';
import { z } from 'zod';

export const updateCustomDashboardSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  uploader_id: z.string().optional(),
  short_description: z.string().max(255).min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  product_version: z.string().regex(/^\d+\.\d+\.\d+$/, {
    message: 'Product version must be X.Y.Z',
  }),
  uploader_organization_id: z.string().min(1, 'Required'),
  labels: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  document: z.custom<FileList>(fileListCheck).optional(),
  images: z.custom<FileList>(fileListCheck).optional(),
});

export type CustomDashboardFormValues = z.infer<
  typeof updateCustomDashboardSchema
>;

interface CustomDashboardFormProps {
  customDashboard: customDashboardsItem_fragment$data;
  handleSubmit: (
    values: z.infer<typeof updateCustomDashboardSchema>,
    callback: () => void
  ) => void;
  onDelete: () => void;
  userCanDelete: boolean;
  userCanUpdate: boolean;
}

type CustomDashboardUpdateFormValues = z.infer<
  typeof updateCustomDashboardSchema
>;

export const CustomDashboardUpdateForm = ({
  customDashboard,
  handleSubmit,
  userCanDelete,
  userCanUpdate,
  onDelete,
}: CustomDashboardFormProps) => {
  const t = useTranslations();
  const { handleCloseSheet, setIsDirty } = useDialogContext();

  const { me } = useContext(PortalContext);

  const form = useForm<CustomDashboardUpdateFormValues>({
    resolver: zodResolver(updateCustomDashboardSchema),
    defaultValues: {
      name: customDashboard.name ?? '',
      short_description: customDashboard.short_description ?? '',
      product_version: customDashboard.product_version ?? '',
      description: customDashboard.description ?? '',
      uploader_id: customDashboard.uploader?.email,
      uploader_organization_id: customDashboard.uploader_organization?.id ?? '',
      active: customDashboard.active ?? false,
      labels: customDashboard.labels?.map((obj) => obj?.id) ?? [],
      slug: customDashboard.slug ?? '',
      images:
        (customDashboard.children_documents?.map((doc) => ({
          ...doc,
          name: doc.file_name,
        })) as unknown as FileList) ?? [],
    },
  });

  useEffect(
    () => setIsDirty(form.formState.isDirty),
    [form.formState.isDirty, setIsDirty]
  );
  form.watch(['images', 'document']);

  const onSubmit = (values: CustomDashboardFormValues) => {
    const finalImages = images.filter(
      (img) => !imagesToDelete.includes(img.id)
    );

    const finalValues = {
      ...values,
      images: finalImages as unknown as FileList,
    };

    handleSubmit(finalValues, () => {
      form.reset();
      setImagesToDelete([]);
    });
  };

  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const [images, setImages] = useState<Array<ExistingFile | NewFile>>(
    customDashboard.children_documents as ExistingFile[]
  );

  const values = useMemo(
    () =>
      ({
        ...customDashboard,

        labels: customDashboard?.labels?.map((label) => label.id),
        uploader_id: customDashboard?.uploader?.id ?? me?.id,
        uploader_organization_id:
          customDashboard?.uploader_organization?.id ?? '',
      }) as CustomDashboardFormValues,
    [customDashboard]
  );
  const formSchema = useMemo(
    () =>
      customDashboard
        ? updateCustomDashboardSchema.merge(
            z.object({
              document: z.custom<FileList>(fileListCheck).optional(),
            })
          )
        : updateCustomDashboardSchema,
    [customDashboard]
  );

  return (
    <TooltipProvider delayDuration={1}>
      <AutoForm
        onSubmit={(values, _methods) => {
          onSubmit(values as CustomDashboardFormValues);
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
          ...(userCanUpdate
            ? {
                description: {
                  fieldType: ({ field }) => (
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
                  ),
                },
                labels: {
                  fieldType: ({ field }) => (
                    <FormItem>
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
                            'Service.CustomDashboards.Form.LabelsPlaceholder'
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
                        {t('Service.CustomDashboards.Form.Author')}
                      </FormLabel>
                      <FormControl>
                        <SelectUsersFormField
                          defaultValue={
                            customDashboard?.uploader?.email ?? me!.email
                          }
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  ),
                },
                uploader_organization_id: {
                  fieldType: ({ field }) => (
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
                  ),
                },
                document: {
                  fieldType: ({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('Service.CustomDashboards.Form.ExistingJSONFile')}
                        {form.getValues('document')?.[0]?.name ??
                          customDashboard?.file_name}
                      </FormLabel>
                      <FormControl>
                        <div onClick={() => setIsDirty(true)}>
                          <FileInputWithPrevent
                            field={field}
                            texts={{
                              selectFile: t(
                                'Service.CustomDashboards.Form.UpdateJSONFile'
                              ),
                              dialogTitle: t(
                                'Service.CustomDashboards.Form.UpdateJSONFile'
                              ),
                              dialogDescription: t(
                                'Service.CustomDashboards.Form.DescriptionUpdateJSONFile'
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
                  fieldType: ({ field: { value, ref } }) => {
                    const inputRef = useRef<HTMLInputElement | null>(null);
                    return (
                      <>
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
                              name="images"
                              onChangeCapture={async (
                                e: ChangeEvent<HTMLInputElement>
                              ) => {
                                const localImages = [...images];
                                if (e.target?.files) {
                                  for (const image of Array.from(
                                    e.target.files
                                  )) {
                                    const extendedImage = image as NewFile;
                                    extendedImage.preview = await fileToBase64(
                                      image as File
                                    );
                                    extendedImage.id = new Date()
                                      .getTime()
                                      .toString();
                                    localImages.push(extendedImage);
                                  }
                                }
                                setImages(localImages);
                                form.setValue(
                                  'images',
                                  localImages as unknown as FileList
                                );
                                return false;
                              }}
                              texts={{
                                selectFile: t(
                                  'Service.CustomDashboards.Form.UploadImage'
                                ),
                                noFile: t(
                                  'Service.CustomDashboards.Form.NoImage'
                                ),
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
                        {images.length > 0 && (
                          <div
                            className="grid grid-cols-1 s:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-xl min-h-[15rem] pb-xl"
                            data-testid="images-grid">
                            {images.map((doc) => (
                              <div
                                key={doc!.id}
                                style={{
                                  backgroundImage: docIsExistingFile(doc)
                                    ? `url(/document/visualize/${customDashboard!.service_instance!.id}/${doc!.id})`
                                    : `url(${doc.preview})`,
                                  backgroundSize: 'cover',
                                }}
                                className="min-h-[15rem] border rounded relative">
                                <div
                                  className={`absolute inset-0 bg-black flex flex-col items-center justify-center transition-all duration-800 ease-in ${
                                    imagesToDelete.includes(doc!.id)
                                      ? 'bg-opacity-90 opacity-100'
                                      : 'bg-opacity-0 opacity-0'
                                  }`}>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute right-2 top-2"
                                    type="button"
                                    onClick={() => {
                                      setImagesToDelete(
                                        imagesToDelete.filter(
                                          (id) => id !== doc!.id
                                        )
                                      );
                                    }}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <ReplayIcon className="size-4" />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-gray-50">
                                        {t(
                                          'Service.CustomDashboards.Form.Restore'
                                        )}
                                      </TooltipContent>
                                    </Tooltip>
                                  </Button>
                                  <DeleteIcon
                                    focusable={false}
                                    className="size-6 text-gray-300"
                                  />
                                </div>

                                {!imagesToDelete.includes(doc!.id) && (
                                  <div className="flex flex-row items-center bg-page-background h-12 opacity-90">
                                    <div className="truncate overflow-hidden whitespace-nowrap text-ellipsis ml-s mr-s flex-1 min-w-0">
                                      {(doc as ExistingFile)?.file_name ??
                                        (doc as NewFile)?.name}
                                    </div>
                                    <Button
                                      variant="outline-destructive"
                                      size="icon"
                                      type="button"
                                      className="ml-auto m-s"
                                      onClick={() => {
                                        setImagesToDelete([
                                          ...imagesToDelete,
                                          doc!.id,
                                        ]);
                                        setIsDirty(true);
                                      }}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <DeleteIcon className="size-4" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-50">
                                          {t(
                                            'Service.CustomDashboards.Form.DeleteSentence'
                                          )}
                                        </TooltipContent>
                                      </Tooltip>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  },
                },
              }
            : {
                // Used for user that have the Delete Capa but not the Upload Capa
                name: { fieldType: () => <></> },
                slug: { fieldType: () => <></> },
                uploader_id: { fieldType: () => <></> },
                short_description: { fieldType: () => <></> },
                description: { fieldType: () => <></> },
                product_version: { fieldType: () => <></> },
                message: { fieldType: () => <></> },
                uploader_organization_id: { fieldType: () => <></> },
                labels: { fieldType: () => <></> },
                active: { fieldType: () => <></> },
                document: { fieldType: () => <></> },
                images: { fieldType: () => <></> },
              }),
        }}>
        <SheetFooter className="sm:justify-between pb-0">
          {userCanDelete && (
            <Button
              variant="outline-destructive"
              type="button"
              onClick={onDelete}>
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

            <Button type="submit">{t('Utils.Validate')}</Button>
          </div>
        </SheetFooter>
      </AutoForm>
    </TooltipProvider>
  );
};
