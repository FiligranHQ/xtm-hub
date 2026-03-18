import { ServiceFormDescriptionField } from '@/components/service/form/description-field';
import { ServiceFormIntegrationSubtypeField } from '@/components/service/form/integration-subtype-field';
import {
  ServiceFormMultipleImagesField,
  ServiceFormMultipleImagesFieldImages,
} from '@/components/service/form/multiple-images-field';
import { ServiceFormUploaderIdField } from '@/components/service/form/uploader-id-field';
import { ServiceFormUploaderOrganizationIdField } from '@/components/service/form/uploader-organization-id-field';
import { ServiceFormUseCasesField } from '@/components/service/form/use-cases-field';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { LogoFiligranIcon } from '@filigran/icon';
import {
  FileInput,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { DocumentImageTypeEnum } from '@generated/models/DocumentImageType.enum';
import { DocumentSourceTypeEnum } from '@generated/models/DocumentSourceType.enum';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

type DocumentType =
  | 'CSV Feed'
  | 'TAXII Feed'
  | 'Stream'
  | 'Third Party Integration'
  | 'Custom Dashboard'
  | 'Scenario'
  | 'Connector';

const integrationTypeMappedByDocumentType: Record<
  DocumentType,
  IntegrationTypeEnum | null
> = {
  'Custom Dashboard': null,
  Scenario: null,
  'CSV Feed': IntegrationTypeEnum.CSV_FEED,
  'TAXII Feed': IntegrationTypeEnum.TAXII_FEED,
  Stream: IntegrationTypeEnum.STREAM,
  'Third Party Integration': IntegrationTypeEnum.THIRD_PARTY_INTEGRATION,
  Connector: IntegrationTypeEnum.CONNECTOR,
};

type Platform = 'OpenCTI' | 'OpenAEV';

type AvailableFields =
  | 'description'
  | 'uploader_id'
  | 'uploader_organization_id'
  | 'use_cases'
  | 'integration_subtype'
  | 'images'
  | 'integration_type'
  | 'active'
  | 'short_description'
  | 'slug'
  | 'name'
  | 'vendor_url'
  | 'github_url'
  | 'datasheet_url'
  | 'demo_url'
  | 'product_version'
  | 'container_image'
  | 'source_code'
  | 'subscription_link'
  | 'verified'
  | 'manager_supported'
  | 'playbook_supported';

interface Props {
  documentType: DocumentType;
  platform: Platform;
  document?: documentItem_fragment$data;
  disabledFields?: AvailableFields[];
}

export const useServiceFormFields = ({
  documentType,
  platform,
  document,
  disabledFields = [],
}: Props) => {
  const isCreation = !document;
  const [images, setImages] = useState<
    Array<ServiceFormMultipleImagesFieldImages>
  >(
    (document?.children_documents ?? []).filter(
      (doc) => doc.image_type === DocumentImageTypeEnum.IMAGE
    ) as unknown as ServiceFormMultipleImagesFieldImages[]
  );
  const existingLogo = (document?.children_documents ?? []).find(
    (doc) => doc.image_type === DocumentImageTypeEnum.LOGO
  );

  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const { setIsDirty } = useDialogContext();
  const integrationType = integrationTypeMappedByDocumentType[documentType];
  const t = useTranslations();

  return useMemo(
    () => ({
      images,
      imagesToDelete,
      description: {
        fieldType: ({
          field,
        }: {
          field: ControllerRenderProps<FieldValues, string>;
        }) => (
          <ServiceFormDescriptionField
            field={field}
            documentType={documentType}
            disabled={disabledFields.includes('description')}
          />
        ),
      },
      uploader_id: {
        fieldType: ({
          field,
        }: {
          field: ControllerRenderProps<FieldValues, string>;
        }) => (
          <ServiceFormUploaderIdField
            field={field}
            document={document}
            disabled={disabledFields.includes('uploader_id')}
          />
        ),
      },
      uploader_organization_id: {
        fieldType: ({
          field,
        }: {
          field: ControllerRenderProps<FieldValues, string>;
        }) => (
          <ServiceFormUploaderOrganizationIdField
            field={field}
            isCreation={isCreation}
            document={document}
            disabled={disabledFields.includes('uploader_organization_id')}
          />
        ),
      },
      use_cases: {
        fieldType: ({
          field,
        }: {
          field: ControllerRenderProps<FieldValues, string>;
        }) => (
          <ServiceFormUseCasesField
            field={field}
            disabled={disabledFields.includes('use_cases')}
          />
        ),
      },
      ...(integrationType
        ? {
            integration_subtype: {
              fieldType: ({
                field,
              }: {
                field: ControllerRenderProps<FieldValues, string>;
              }) => (
                <ServiceFormIntegrationSubtypeField
                  field={field}
                  integrationType={integrationType}
                  document={document}
                  disabled={disabledFields.includes('integration_subtype')}
                />
              ),
            },
          }
        : {}),
      imagesField: {
        fieldType: ({
          field,
        }: {
          field: ControllerRenderProps<FieldValues, string>;
        }) => (
          <ServiceFormMultipleImagesField
            field={field}
            document={document}
            images={images}
            setImages={setImages}
            imagesToDelete={imagesToDelete}
            setImagesToDelete={setImagesToDelete}
            setIsDirty={setIsDirty}
          />
        ),
      },
      logo: {
        fieldType: ({
          field,
        }: {
          field: ControllerRenderProps<FieldValues, string>;
        }) => (
          <FormItem>
            <FormLabel>{t('Service.Form.LogoLabel')}</FormLabel>
            <FormControl>
              <FileInput
                {...field}
                disabled={
                  existingLogo?.source_type === DocumentSourceTypeEnum.EXTERNAL
                }
                texts={{
                  selectFile: t('Service.Form.UploadLogo'),
                  noFile: t('Service.Vault.FileForm.NoDocument'),
                  dropFiles: t('Service.Vault.FileForm.DropDocuments'),
                }}
                allowedTypes={'image/jpeg, image/gif, image/png, image/svg'}
              />
            </FormControl>
            {existingLogo && document?.service_instance && (
              <>
                <p>{t('Service.Form.CurrentLogo')}</p>
                <div className="w-24 flex-shrink-0 rounded overflow-hidden">
                  <Image
                    src={`/document/images/${document?.service_instance?.id}/${existingLogo.id}`}
                    alt={`${document.name} logo`}
                    width={96}
                    height={96}
                    loading="lazy"
                    className="w-full h-full object-contain rounded"
                  />
                </div>
              </>
            )}
            <FormMessage />
            <div>
              <p className="mb-xs">
                {t('Service.Form.IllustrationDisclaimer')}
              </p>
              <div className="w-24 p-m border border-light">
                <LogoFiligranIcon className="size-18" />
              </div>
            </div>
          </FormItem>
        ),
      },
      integration_type: { fieldType: () => <FormItem hidden={true} /> },
      active: {
        label: t('Service.Form.PublishedPlaceholder', {
          documentType,
        }),
        inputProps: {
          disabled: disabledFields.includes('active'),
        },
      },
      short_description: {
        label: t('Service.Form.ShortDescriptionLabel'),
        inputProps: {
          placeholder: t('Service.Form.ShortDescriptionPlaceholder'),
          disabled: disabledFields.includes('short_description'),
        },
      },
      slug: {
        label: t('Service.Form.SlugLabel'),
        inputProps: {
          placeholder: t('Service.Form.SlugPlaceholder'),
          disabled: disabledFields.includes('slug'),
        },
      },
      name: {
        label: t(`Service.Form.NameLabel`),
        inputProps: {
          placeholder: t('Service.Form.NamePlaceholder', { documentType }),
          disabled: disabledFields.includes('name'),
        },
      },
      vendor_url: {
        label: t('Service.Form.VendorUrlLabel'),
        inputProps: {
          placeholder: t('Service.Form.UrlPlaceholder'),
          disabled: disabledFields.includes('vendor_url'),
        },
      },
      github_url: {
        label: t('Service.Form.GithubUrlLabel'),
        inputProps: {
          placeholder: t('Service.Form.UrlPlaceholder'),
          disabled: disabledFields.includes('github_url'),
        },
      },
      datasheet_url: {
        label: t('Service.Form.DatasheetUrlLabel'),
        inputProps: {
          placeholder: t('Service.Form.UrlPlaceholder'),
          disabled: disabledFields.includes('datasheet_url'),
        },
      },
      demo_url: {
        label: t('Service.Form.DemoUrlLabel'),
        inputProps: {
          placeholder: t('Service.Form.UrlPlaceholder'),
          disabled: disabledFields.includes('demo_url'),
        },
      },
      product_version: {
        label: t('Service.Form.ProductVersionLabel', { platform }),
        inputProps: {
          placeholder: t('Service.Form.ProductVersionPlaceholder'),
          disabled: disabledFields.includes('product_version'),
        },
      },
      container_image: {
        label: t('Service.Form.ContainerImageLabel'),
        inputProps: {
          disabled: disabledFields.includes('container_image'),
        },
      },
      source_code: {
        label: t('Service.Form.SourceCodeLabel'),
        inputProps: {
          disabled: disabledFields.includes('source_code'),
        },
      },
      subscription_link: {
        label: t('Service.Form.SubscriptionLinkLabel'),
        inputProps: {
          disabled: disabledFields.includes('subscription_link'),
        },
      },
      verified: {
        label: t('Service.Form.VerifiedLabel'),
        inputProps: {
          disabled: disabledFields.includes('verified'),
        },
      },
      manager_supported: {
        label: t('Service.Form.ManagerSupportedLabel'),
        inputProps: {
          disabled: disabledFields.includes('manager_supported'),
        },
      },
      playbook_supported: {
        label: t('Service.Form.PlaybookSupportedLabel'),
        inputProps: {
          disabled: disabledFields.includes('playbook_supported'),
        },
      },
    }),
    [
      documentType,
      platform,
      t,
      isCreation,
      document,
      integrationType,
      existingLogo,
      images,
      setImages,
      imagesToDelete,
      setImagesToDelete,
      setIsDirty,
      disabledFields,
    ]
  );
};
