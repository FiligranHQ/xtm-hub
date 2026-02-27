import { ServiceFormDescriptionField } from '@/components/service/form/description-field';
import { ServiceFormIntegrationSubtypeField } from '@/components/service/form/integration-subtype-field';
import { ServiceFormUploaderIdField } from '@/components/service/form/uploader-id-field';
import { ServiceFormUploaderOrganizationIdField } from '@/components/service/form/uploader-organization-id-field';
import { ServiceFormUseCasesField } from '@/components/service/form/use-cases-field';
import { FormItem } from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

type DocumentType =
  | 'CSV Feed'
  | 'TAXII Feed'
  | 'Stream'
  | 'Third Party Integration'
  | 'Custom Dashboard'
  | 'Scenario';

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
};

type Platform = 'OpenCTI' | 'OpenAEV';

interface Props {
  documentType: DocumentType;
  platform: Platform;
  isCreation: boolean;
  document?: documentItem_fragment$data;
}

export const useSimpleServiceFormField = ({
  documentType,
  platform,
  isCreation,
  document,
}: Props) => {
  const integrationType = integrationTypeMappedByDocumentType[documentType];
  const t = useTranslations();
  return useMemo(
    () => ({
      description: {
        fieldType: ({
          field,
        }: {
          field: ControllerRenderProps<FieldValues, string>;
        }) => (
          <ServiceFormDescriptionField
            field={field}
            documentType={documentType}
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
          />
        ),
      },
      use_cases: {
        fieldType: ServiceFormUseCasesField,
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
                />
              ),
            },
          }
        : {}),
      integration_type: { fieldType: () => <FormItem hidden={true} /> },
      active: {
        label: t('Service.Form.PublishedPlaceholder', {
          documentType,
        }),
      },
      short_description: {
        label: t('Service.Form.ShortDescriptionLabel'),
        inputProps: {
          placeholder: t('Service.Form.ShortDescriptionPlaceholder'),
        },
      },
      slug: {
        label: t('Service.Form.SlugLabel'),
        inputProps: {
          placeholder: t('Service.Form.SlugPlaceholder'),
        },
      },
      name: {
        label: t(`Service.Form.NameLabel`),
        inputProps: {
          placeholder: t('Service.Form.NamePlaceholder', { documentType }),
        },
      },
      vendor_url: {
        label: t('Service.Form.VendorUrlLabel'),
        inputProps: {
          placeholder: t('Service.Form.UrlPlaceholder'),
        },
      },
      github_url: {
        label: t('Service.Form.GithubUrlLabel'),
        inputProps: {
          placeholder: t('Service.Form.UrlPlaceholder'),
        },
      },
      datasheet_url: {
        label: t('Service.Form.DatasheetUrlLabel'),
        inputProps: {
          placeholder: t('Service.Form.UrlPlaceholder'),
        },
      },
      demo_url: {
        label: t('Service.Form.DemoUrlLabel'),
        inputProps: {
          placeholder: t('Service.Form.UrlPlaceholder'),
        },
      },
      product_version: {
        label: t('Service.Form.ProductVersionLabel', { platform }),
        inputProps: {
          placeholder: t('Service.Form.ProductVersionPlaceholder'),
        },
      },
    }),
    [documentType, platform, t, isCreation, document, integrationType]
  );
};
