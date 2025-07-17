import { getLabels } from '@/components/admin/label/label.utils';
import { PortalContext } from '@/components/me/app-portal-context';
import { ObasScenarioDelete } from '@/components/service/obas-scenarios/[serviceInstanceId]/obas-scenario-delete';
import MarkdownInput from '@/components/ui/MarkdownInput';
import SelectUsersFormField from '@/components/ui/select-users';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { obasScenariosItem_fragment$data } from '@generated/obasScenariosItem_fragment.graphql';
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
import { useContext, useMemo } from 'react';
import slugify from 'slugify';
import { z } from 'zod';

const fileListCheck = (file: FileList | undefined) => file && file.length > 0;

const obasScenarioFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  uploader_id: z.string().optional(),
  short_description: z.string().min(1, 'Required').max(250),
  product_version: z.string().regex(/^\d+\.\d+\.\d+$/, {
    message: 'Product version must be X.Y.Z',
  }),
  description: z.string().min(1, 'Required'),
  labels: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  document: z.custom<FileList>(fileListCheck),
  illustration: z.custom<FileList>(fileListCheck),
});
export type ObasScenarioFormValues = z.infer<typeof obasScenarioFormSchema>;

interface ObasScenarioFormProps {
  userCanDelete?: boolean;
  handleSubmit?: (values: ObasScenarioFormValues) => void;
  onDelete?: () => void;
  obasScenario?: obasScenariosItem_fragment$data;
}

export const ObasScenarioForm = ({
  userCanDelete,
  handleSubmit,
  onDelete,
  obasScenario,
}: ObasScenarioFormProps) => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);

  const { handleCloseSheet } = useDialogContext();

  const values = useMemo(
    () =>
      ({
        ...obasScenario,
        illustration: obasScenario?.children_documents?.map((doc) => ({
          ...doc,
          name: doc.file_name,
        })) as unknown as FileList,
        labels: obasScenario?.labels?.map((label) => label.id),
        uploader_id: obasScenario?.uploader?.id ?? me?.id,
      }) as ObasScenarioFormValues,
    [obasScenario]
  );
  const formSchema = useMemo(
    () =>
      obasScenario
        ? obasScenarioFormSchema.merge(
            z.object({
              document: z.custom<FileList>(fileListCheck).optional(),
              illustration: z.custom<FileList>(fileListCheck).optional(),
            })
          )
        : obasScenarioFormSchema,
    [obasScenario]
  );

  return (
    <>
      <AutoForm
        onSubmit={(values, _methods) => {
          handleSubmit?.(values as ObasScenarioFormValues);
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
                  {t('Service.ObasScenario.Form.DescriptionLabel')}
                </FormLabel>
                <FormControl>
                  <MarkdownInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={
                      'Service.ObasScenario.Form.DescriptionPlaceholder'
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
                    placeholder={t('Service.ObasScenario.Form.LabelsLabel')}
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
                  {t('Service.CustomDashboards.Form.LabelsLabel')}
                </FormLabel>
                <FormControl>
                  <SelectUsersFormField
                    defaultValue={obasScenario?.uploader?.email ?? me!.email}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            ),
          },
          document: {
            label: obasScenario
              ? t('Service.ObasScenario.Form.ExistingObasScenarioFile', {
                  file_name: obasScenario.file_name,
                })
              : t('Service.ObasScenario.Form.ObasScenarioFile'),
            fieldType: 'file',
            inputProps: {
              allowedTypes: 'application/zip',
              multiple: 'multiple',
            },
          },
          illustration: {
            label: t('Service.ObasScenario.Form.ObasScenarioIllustration'),
            fieldType: 'file',
            inputProps: {
              allowedTypes: 'image/jpeg, image/png',
            },
          },
          active: {
            label: t('Service.ObasScenario.Form.PublishedPlaceholder'),
          },
          short_description: {
            label: t('Service.ObasScenario.Form.ShortDescriptionLabel'),
          },
          slug: {
            label: t('Service.ObasScenario.Form.SlugLabel'),
          },
          name: {
            label: t('Service.ObasScenario.Form.NameLabel'),
          },
          product_version: {
            label: t('Service.ObasScenario.Form.ProductVersionLabel'),
          },
        }}>
        <SheetFooter className="pt-2">
          {obasScenario && (
            <ObasScenarioDelete
              userCanDelete={userCanDelete}
              onDelete={onDelete}
              obasScenario={obasScenario}
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
