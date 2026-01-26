import { getLabels } from '@/components/admin/label/label.utils';
import { PortalContext } from '@/components/me/app-portal-context';
import { useServiceContext } from '@/components/service/components/service-context';
import { ServiceDelete } from '@/components/service/components/service-delete';
import { SubTypesPerIntegrationType } from '@/components/service/integrations/integration.utils';
import FileInputWithPrevent from '@/components/ui/file-input-with-prevent';
import MarkdownInput from '@/components/ui/MarkdownInput';
import SelectUsersFormField from '@/components/ui/select-users';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { fileListCheck } from '@/utils/documents';
import { formatTitleCase } from '@/utils/format/case';
import { SubscribableResource } from '@/utils/shareable-resources/shareable-resources.types';
import {
  AutoForm,
  Button,
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
} from '@filigran/ui';
import { integrationsItem_fragment$data } from '@generated/integrationsItem_fragment.graphql';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import { useContext, useMemo } from 'react';
import slugify from 'slugify';
import { z } from 'zod';

const taxiiFeedFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  uploader_id: z.string().optional(),
  short_description: z.string().min(1, 'Required').max(250),
  description: z.string().min(1, 'Required'),
  uploader_organization_id: z.string().min(1, 'Required'),
  integration_type: z.string().min(1, 'Required'),
  labels: z.array(z.string()).optional(),
  integration_subtype: z.string().min(1, 'Required'),
  active: z.boolean().optional(),
  document: z.custom<FileList>(fileListCheck),
  images: z.custom<FileList>(fileListCheck).optional(),
});
export type TaxiiFeedFormValues = z.infer<typeof taxiiFeedFormSchema>;

interface TaxiiFeedFormProps {
  userCanDelete?: boolean;
  handleSubmit?: (values: TaxiiFeedFormValues) => void;
  onDelete?: () => void;
  document: SubscribableResource | undefined;
}

export const TaxiiFeedForm = ({
  userCanDelete,
  handleSubmit,
  onDelete,
  document,
}: TaxiiFeedFormProps) => {
  const taxiiFeed = document;
  const t = useTranslations();
  const { me } = useContext(PortalContext);
  const { handleCloseSheet } = useDialogContext();
  const { translationKey } = useServiceContext();

  const isCreation = !taxiiFeed;

  const values = useMemo(
    () =>
      ({
        ...taxiiFeed,
        images: taxiiFeed?.children_documents?.map((doc) => ({
          ...doc,
          name: doc.file_name,
        })) as unknown as FileList,
        labels: taxiiFeed?.labels?.map((label) => label.id),
        uploader_id: taxiiFeed?.uploader?.id ?? me!.id,
        uploader_organization_id:
          (isCreation
            ? me?.selected_organization_id
            : taxiiFeed?.uploader_organization?.id) ?? '',
        integration_type: IntegrationTypeEnum.TAXII_FEED,
        integration_subtype:
          (taxiiFeed as integrationsItem_fragment$data)?.integration_subtype ??
          '',
      }) as TaxiiFeedFormValues,
    [me, taxiiFeed, isCreation]
  );
  const formSchema = useMemo(
    () =>
      taxiiFeed
        ? taxiiFeedFormSchema.extend({
            document: z.custom<FileList>(fileListCheck).optional(),
            images: z.custom<FileList>(fileListCheck).optional(),
          })
        : taxiiFeedFormSchema,
    [taxiiFeed]
  );

  return (
    <>
      <AutoForm
        onSubmit={(values, _methods) => {
          handleSubmit?.(values as TaxiiFeedFormValues);
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
                  {t(`${translationKey}.Form.DescriptionLabel`)}
                </FormLabel>
                <FormControl>
                  <MarkdownInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={`${translationKey}.Form.DescriptionPlaceholder`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            ),
          },
          labels: {
            fieldType: ({ field }) => (
              <FormItem>
                <FormLabel>{t(`${translationKey}.Form.LabelsLabel`)}</FormLabel>
                <FormControl>
                  <MultiSelectFormField
                    noResultString={t('Utils.NotFound')}
                    options={getLabels()}
                    keyValue="id"
                    keyLabel="name"
                    defaultValue={field.value}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t(`${translationKey}.Form.LabelsPlaceholder`)}
                    variant="inverted"
                  />
                </FormControl>
              </FormItem>
            ),
          },
          uploader_id: {
            fieldType: ({ field }) => (
              <FormItem>
                <FormLabel>{t(`${translationKey}.Form.Author`)}</FormLabel>
                <FormControl>
                  <SelectUsersFormField
                    defaultValue={taxiiFeed?.uploader?.email ?? me!.email}
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
                      : taxiiFeed?.uploader_organization?.id) ?? ''
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
                label: t(`${translationKey}.Form.TaxiiFeedFile`),
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
                      {t(`${translationKey}.Form.ExistingTaxiiFeedFile`, {
                        file_name:
                          field.value?.[0].name ?? taxiiFeed?.file_name,
                      })}
                    </FormLabel>
                    <FormControl>
                      <div>
                        <FileInputWithPrevent
                          field={field}
                          texts={{
                            selectFile: t(
                              `${translationKey}.Form.UpdateJSONFile`
                            ),
                            dialogTitle: t(
                              `${translationKey}.Form.UpdateJSONFile`
                            ),
                            dialogDescription: t(
                              `${translationKey}.Form.DescriptionUpdateJSONFile`
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
            label: t(`${translationKey}.Form.TaxiiFeedIllustration`),
            fieldType: 'file',
            inputProps: {
              accept: 'image/jpeg, image/png',
            },
          },
          active: {
            label: t(`${translationKey}.Form.PublishedPlaceholder`),
          },
          short_description: {
            label: t(`${translationKey}.Form.ShortDescriptionLabel`),
          },
          slug: {
            label: t(`${translationKey}.Form.SlugLabel`),
          },
          name: {
            label: t(`${translationKey}.Form.NameLabel`),
          },
          integration_type: { fieldType: () => <FormItem hidden={true} /> },
          integration_subtype: {
            fieldType: ({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(
                    'Service.OpenctiIntegrations.Form.SelectIntegrationSubType'
                  )}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={
                    (taxiiFeed as integrationsItem_fragment$data)
                      ?.integration_subtype
                  }>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          'Service.OpenctiIntegrations.Form.SelectIntegrationSubType'
                        )}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SubTypesPerIntegrationType.get(
                      IntegrationTypeEnum.TAXII_FEED
                    )?.map((node) => {
                      return (
                        <SelectItem
                          key={node}
                          value={node}>
                          {formatTitleCase(node)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            ),
          },
        }}>
        <SheetFooter className="sm:justify-between pt-2">
          {taxiiFeed && (
            <ServiceDelete
              userCanDelete={userCanDelete}
              onDelete={onDelete}
              serviceName={taxiiFeed.name}
              translationKey={translationKey}
            />
          )}
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
