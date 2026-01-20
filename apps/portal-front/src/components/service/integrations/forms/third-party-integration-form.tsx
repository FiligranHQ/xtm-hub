import { getLabels } from '@/components/admin/label/label.utils';
import { PortalContext } from '@/components/me/app-portal-context';
import { useServiceContext } from '@/components/service/components/service-context';
import { ServiceDelete } from '@/components/service/components/service-delete';
import {
  getIntegrationSubTypeMetadata,
  ThirdPartyIntegrationIntegrationSubTypes,
} from '@/components/service/integrations/integration.utils';
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

const thirdPartyIntegrationFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  uploader_id: z.string().optional(),
  short_description: z.string().min(1, 'Required').max(250),
  description: z.string().min(1, 'Required'),
  uploader_organization_id: z.string().min(1, 'Required'),
  integration_type: z.string().min(1, 'Required'),
  labels: z.array(z.string()).optional(),
  integration_subtype: z.string().min(1, 'Required'),
  vendor_url: z.url().min(1, 'Required'),
  github_url: z.url().nullish(),
  product_version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, {
      error: 'Product version must be X.Y.Z',
    })
    .nullish(),
  active: z.boolean().optional(),
  document: z.custom<FileList>(fileListCheck).optional(), // declared for genericity but not used
});

export type ThirdPartyIntegrationFormValues = z.infer<
  typeof thirdPartyIntegrationFormSchema
>;

interface ThirdPartyIntegrationFormProps {
  userCanDelete?: boolean;
  handleSubmit?: (values: ThirdPartyIntegrationFormValues) => void;
  onDelete?: () => void;
  document: SubscribableResource | undefined;
}

export const ThirdPartyIntegrationForm = ({
  userCanDelete,
  handleSubmit,
  onDelete,
  document,
}: ThirdPartyIntegrationFormProps) => {
  const thirdPartyIntegration = document;
  const t = useTranslations();
  const { me } = useContext(PortalContext);
  const { handleCloseSheet } = useDialogContext();
  const { translationKey } = useServiceContext();

  const isCreation = !thirdPartyIntegration;
  const thirdPartyIntegrationItem =
    thirdPartyIntegration as integrationsItem_fragment$data;

  const values = useMemo(
    () =>
      ({
        ...thirdPartyIntegration,
        labels: thirdPartyIntegration?.labels?.map((label) => label.id),
        uploader_id: thirdPartyIntegration?.uploader?.id ?? me!.id,
        uploader_organization_id:
          (isCreation
            ? me?.selected_organization_id
            : thirdPartyIntegration?.uploader_organization?.id) ?? '',
        integration_type: IntegrationTypeEnum.THIRD_PARTY_INTEGRATION,
        integration_subtype:
          thirdPartyIntegrationItem?.integration_subtype ?? '',
        github_url: thirdPartyIntegrationItem?.github_url,
        product_version: thirdPartyIntegrationItem?.product_version,
        vendor_url: thirdPartyIntegrationItem?.vendor_url,
      }) as ThirdPartyIntegrationFormValues,
    [me, thirdPartyIntegration, isCreation, thirdPartyIntegrationItem]
  );
  const formSchema = useMemo(() => {
    const extendedSchema = thirdPartyIntegration
      ? thirdPartyIntegrationFormSchema.extend({
          document: z.custom<FileList>(fileListCheck).optional(),
        })
      : thirdPartyIntegrationFormSchema;

    return extendedSchema.superRefine((data, ctx) => {
      if (data.github_url && !data.product_version) {
        ctx.addIssue({
          path: ['product_version'],
          code: 'custom',
          message: 'Github URL and product version must be filled together',
        });
      }

      if (!data.github_url && data.product_version) {
        ctx.addIssue({
          path: ['github_url'],
          code: 'custom',
          message: 'Github URL and product version must be filled together',
        });
      }
    });
  }, [thirdPartyIntegration]);

  return (
    <>
      <AutoForm
        onSubmit={(values, _methods) => {
          handleSubmit?.(values as ThirdPartyIntegrationFormValues);
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
          if (values.product_version === '') {
            form.setValue('product_version', undefined);
          }
          if (values.github_url === '') {
            form.setValue('github_url', undefined);
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
                    defaultValue={
                      thirdPartyIntegration?.uploader?.email ?? me!.email
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
              <FormItem hidden={isCreation}>
                <FormLabel>
                  {t('OrganizationInServiceAction.Organization')}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={
                    (isCreation
                      ? me?.selected_organization_id
                      : thirdPartyIntegration?.uploader_organization?.id) ?? ''
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
          document: { fieldType: () => <FormItem hidden={true} /> },
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
                    (thirdPartyIntegration as integrationsItem_fragment$data)
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
                    {ThirdPartyIntegrationIntegrationSubTypes.map(
                      (integrationSubType) => {
                        return (
                          <SelectItem
                            key={integrationSubType}
                            value={integrationSubType}>
                            {getIntegrationSubTypeMetadata(integrationSubType)
                              ?.label ?? formatTitleCase(integrationSubType)}
                          </SelectItem>
                        );
                      }
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            ),
          },
          vendor_url: {
            label: t(`${translationKey}.Form.VendorUrlLabel`),
          },
          github_url: {
            label: t(`${translationKey}.Form.GithubUrlLabel`),
          },
          product_version: {
            label: t(`${translationKey}.Form.ProductVersionLabel`),
          },
        }}>
        <SheetFooter className="sm:justify-between pt-2">
          {thirdPartyIntegration && (
            <ServiceDelete
              userCanDelete={userCanDelete}
              onDelete={onDelete}
              serviceName={thirdPartyIntegration.name}
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
