import { getUseCases } from '@/components/admin/use-case/use-case.utils';
import { PortalContext } from '@/components/me/app-portal-context';
import FileInputWithPrevent from '@/components/ui/file-input-with-prevent';
import MarkdownInput from '@/components/ui/MarkdownInput';
import SelectUsersFormField from '@/components/ui/select-users';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { fileToBase64 } from '@/lib/utils';
import {
  docIsExistingFile,
  ExistingFile,
  fileListCheck,
  NewFile,
} from '@/utils/documents';
import { AddIcon, DeleteIcon, ReplayIcon } from '@filigran/icon';
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
  TooltipTrigger,
} from '@filigran/ui';
import { TooltipProvider } from '@filigran/ui/clients';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useContext, useMemo, useRef, useState } from 'react';
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
  use_cases: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  document: z.custom<FileList>(fileListCheck),
  images: z.custom<FileList>(fileListCheck),
});
export type OpenAEVScenarioFormValues = z.infer<
  typeof openAEVScenarioFormSchema
>;

export interface OpenAEVScenarioFormProps {
  handleSubmit: (values: OpenAEVScenarioFormValues) => void;
  document?: documentItem_fragment$data;
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
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const [images, setImages] = useState<Array<ExistingFile | NewFile>>(
    openAEVScenario?.children_documents as unknown as ExistingFile[]
  );
  const onSubmit = (values: OpenAEVScenarioFormValues) => {
    if (isCreation) {
      handleSubmit(values);
    } else {
      const finalImages = images.filter(
        (img) => !imagesToDelete.includes(img.id)
      );

      const finalValues = {
        ...values,
        images: finalImages as unknown as FileList,
      };
      handleSubmit(finalValues);
    }
  };

  const values = useMemo(
    () =>
      ({
        ...openAEVScenario,
        images: openAEVScenario?.children_documents?.map((doc) => ({
          ...doc,
          name: doc.file_name,
        })) as unknown as FileList,
        use_cases: openAEVScenario?.use_cases?.map((useCase) => useCase.id),
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
          onSubmit(values as OpenAEVScenarioFormValues);
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
          use_cases: {
            fieldType: ({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('Service.OpenAEVScenario.Form.UseCasesLabel')}
                </FormLabel>
                <FormControl>
                  <MultiSelectFormField
                    noResultString={t('Utils.NotFound')}
                    options={getUseCases()}
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
          images: isCreation
            ? {
                label: t('Service.OpenAEVScenario.Form.ImageLabel'),
                fieldType: 'file',
                inputProps: {
                  allowedTypes: 'image/jpeg, image/png',
                  multiple: 'multiple',
                  texts: {
                    selectFile: t('Service.OpenAEVScenario.Form.SelectImage'),
                    noFile: t('Service.OpenAEVScenario.Form.NoImage'),
                    dropFiles: t('Service.Vault.FileForm.DropDocuments'),
                  },
                },
              }
            : {
                fieldType: ({ field: { value, ref } }) => {
                  const inputRef = useRef<HTMLInputElement | null>(null);
                  return (
                    <>
                      <FormItem>
                        <FormLabel className="flex items-center h-6">
                          {t('Service.OpenAEVScenario.Form.ImageLabel')}
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
                              return false;
                            }}
                            texts={{
                              selectFile: t(
                                'Service.OpenAEVScenario.Form.UploadImage'
                              ),
                              noFile: t('Service.OpenAEVScenario.Form.NoImage'),
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
                      {images?.length > 0 && (
                        <div
                          className="grid grid-cols-1 s:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-xl min-h-[15rem] pb-xl"
                          data-testid="images-grid">
                          {images.map((doc) => (
                            <div
                              key={doc!.id}
                              style={{
                                backgroundImage: docIsExistingFile(doc)
                                  ? `url(/document/visualize/${openAEVScenario!.service_instance!.id}/${doc!.id})`
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
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <ReplayIcon className="size-4" />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-gray-50">
                                        {t(
                                          'Service.OpenAEVScenario.Form.Restore'
                                        )}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
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
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <DeleteIcon className="size-4" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-50">
                                          {t(
                                            'Service.OpenAEVScenario.Form.DeleteSentence'
                                          )}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
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
