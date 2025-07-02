import { getLabels } from '@/components/admin/label/label.utils';
import {
  UserFragment,
  userListFragment,
  UserListQuery,
} from '@/components/admin/user/user-list';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { CsvFeedDelete } from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feed-delete';
import FileInputWithPrevent from '@/components/ui/file-input-with-prevent';
import MarkdownInput from '@/components/ui/MarkdownInput';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { csvFeedsItem_fragment$data } from '@generated/csvFeedsItem_fragment.graphql';
import { userListQuery } from '@generated/userListQuery.graphql';
import { userList_fragment$key } from '@generated/userList_fragment.graphql';
import { userList_users$key } from '@generated/userList_users.graphql';
import {
  AutoForm,
  Button,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  MultiSelectFormField,
  SheetFooter,
  Tag,
  TagInput,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  readInlineData,
  useLazyLoadQuery,
  useRefetchableFragment,
} from 'react-relay';
import slugify from 'slugify';
import { useDebounceCallback } from 'usehooks-ts';
import { z } from 'zod';
const fileListCheck = (file: FileList | undefined) => file && file.length > 0;

const csvFeedFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  author_id: z.array(z.string()),
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

  const isCreation = !csvFeed;

  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsId, setTagsId] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const { orderMode, orderBy } = useUserListLocalstorage();

  const filterRef = useRef({ search: undefined });
  const queryData = useLazyLoadQuery<userListQuery>(UserListQuery, {
    count: 10,
    orderMode,
    orderBy,
    searchTerm: filterRef.current.search,
  });
  const [data, refetch] = useRefetchableFragment<
    userListQuery,
    userList_users$key
  >(userListFragment, queryData);
  const users = data?.users?.edges?.map((edge) => {
    const user = readInlineData<userList_fragment$key>(UserFragment, edge.node);
    return {
      id: user.id,
      text: user.email,
    };
  });

  const handleInputChange = useCallback((inputValue: string) => {
    filterRef.current = {
      ...filterRef.current,
      search: inputValue,
    };

    refetch({
      count: 10,
      orderMode,
      orderBy,
      searchTerm: filterRef.current.search,
    });
  }, []);

  const debounceHandleInput = useDebounceCallback(
    handleInputChange,
    DEBOUNCE_TIME
  );

  const values = useMemo(
    () =>
      ({
        ...csvFeed,
        illustration: csvFeed?.children_documents?.map((doc) => ({
          ...doc,
          name: doc.file_name,
        })) as unknown as FileList,
        labels: csvFeed?.labels?.map((label) => label.id),
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
          if (values.author_id) {
            form.setValue('author_id', tagsId, { shouldDirty: true });
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
                    options={getLabels()}
                    keyValue="id"
                    keyLabel="name"
                    defaultValue={field.value}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('Service.CsvFeed.Form.LabelsLabel')}
                    variant="inverted"
                  />
                </FormControl>
              </FormItem>
            ),
          },
          author_id: {
            fieldType: ({ field }) => (
              <FormItem>
                <FormLabel>{'Author'}</FormLabel>
                <FormControl>
                  {/*<MultiSelectFormField*/}
                  {/*  noResultString={t('Utils.NotFound')}*/}
                  {/*  options={users}*/}
                  {/*  keyValue="id"*/}
                  {/*  keyLabel="text"*/}
                  {/*  defaultValue={field.value}*/}
                  {/*  value={field.value}*/}
                  {/*  onValueChange={field.onChange}*/}
                  {/*  onInputChange={debounceHandleInput}*/}
                  {/*  placeholder={'Email'}*/}
                  {/*  variant="inverted"*/}
                  {/*/>*/}
                  <TagInput
                    {...field}
                    placeholder={t('OrganizationForm.DomainsPlaceholder')}
                    tags={tags}
                    className="sm:min-w-[450px]"
                    activeTagIndex={activeTagIndex}
                    enableAutocomplete={true}
                    autocompleteOptions={users}
                    setActiveTagIndex={setActiveTagIndex}
                    onInputChange={debounceHandleInput}
                    setTags={(newTags) => {
                      const newTagsId: string[] = (newTags as Tag[]).map(
                        (tag) => tag.id
                      );
                      setTags(newTags);
                      setTagsId(newTagsId);
                      // setValue('domains', newTagsText, {
                      //   shouldDirty: true,
                      // });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            ),
          },
          document: isCreation
            ? {
                label: t('Service.CsvFeed.Form.CsvFeedFile'),
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
                      {t('Service.CsvFeed.Form.ExistingCsvFeedFile', {
                        file_name: field.value?.[0].name ?? csvFeed?.file_name,
                      })}
                    </FormLabel>
                    <FormControl>
                      <div>
                        <FileInputWithPrevent
                          field={field}
                          texts={{
                            selectFile: t(
                              'Service.CsvFeed.Form.UpdateJSONFile'
                            ),
                            dialogTitle: t(
                              'Service.CsvFeed.Form.UpdateJSONFile'
                            ),
                            dialogDescription: t(
                              'Service.CsvFeed.Form.DescriptionUpdateJSONFile'
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
