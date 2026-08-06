'use client';

import GuardCapacityComponent from '@/components/AdminGuard';
import { useServiceContext } from '@/components/service/components/ServiceContext';
import {
  EditSeoServiceInstanceMutation,
  SeoServiceInstanceMetadataByIdQuery,
} from '@/components/service/service.graphql';
import { Locale, locales } from '@/i18n/config';
import { EditIcon } from '@filigran/icon';
import {
  AutoForm,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@filigran/ui';
import { toast } from '@filigran/ui/clients';
import { libraryUpdateEditSeoServiceInstanceMutation } from '@generated/libraryUpdateEditSeoServiceInstanceMutation.graphql';
import { libraryUpdateSeoServiceInstanceMetadataQuery } from '@generated/libraryUpdateSeoServiceInstanceMetadataQuery.graphql';
import {
  PortalCapability,
  SeoServiceInstanceLanguage,
} from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import { z } from 'zod';

const SEO_METADATA_MAX_LENGTH = 155;
const optionalSeoField = z.string().max(SEO_METADATA_MAX_LENGTH).optional();

type SeoLocaleConfig = {
  language: SeoServiceInstanceLanguage;
  titleField: string;
  descriptionField: string;
  label: string;
};

const SEO_LANGUAGES = Object.values(SeoServiceInstanceLanguage);

const getSeoLanguageFromLocale = (
  locale: Locale
): SeoServiceInstanceLanguage => {
  const language = SEO_LANGUAGES.find((value) => value === locale);
  if (!language) {
    throw new Error(`Unsupported SEO locale: ${locale}`);
  }
  return language;
};

const SEO_LOCALES: SeoLocaleConfig[] = locales.map((locale) => {
  return {
    language: getSeoLanguageFromLocale(locale),
    titleField: `metaTitle${locale}`,
    descriptionField: `metaDescription${locale}`,
    label: locale.toUpperCase(),
  };
});

type LibraryUpdateFormValues = Record<string, string | undefined>;

const libraryUpdateSchema = z.object(
  SEO_LOCALES.reduce(
    (acc, { titleField, descriptionField }) => {
      acc[titleField] = optionalSeoField;
      acc[descriptionField] = optionalSeoField;
      return acc;
    },
    {} as Record<string, typeof optionalSeoField>
  )
);

const libraryUpdateDefaultValues = SEO_LOCALES.reduce(
  (acc, { titleField, descriptionField }) => {
    acc[titleField] = '';
    acc[descriptionField] = '';
    return acc;
  },
  {} as LibraryUpdateFormValues
);

const libraryUpdateFieldConfig = SEO_LOCALES.reduce(
  (acc, { titleField, descriptionField, label }) => {
    acc[titleField] = {
      label: `Meta-title (${label})`,
      inputProps: { maxLength: SEO_METADATA_MAX_LENGTH },
    };
    acc[descriptionField] = {
      label: `Meta-description (${label})`,
      inputProps: { maxLength: SEO_METADATA_MAX_LENGTH },
    };
    return acc;
  },
  {} as Record<
    string,
    {
      label: string;
      inputProps: {
        maxLength: number;
      };
    }
  >
);

export const LibraryUpdateMetadatas = () => {
  const t = useTranslations();
  const { serviceInstance } = useServiceContext();
  const [isOpen, setIsOpen] = useState(false);
  const { seoServiceInstanceMetadata } =
    useLazyLoadQuery<libraryUpdateSeoServiceInstanceMetadataQuery>(
      SeoServiceInstanceMetadataByIdQuery,
      {
        service_instance_id: serviceInstance.id,
      }
    );

  const existingSeoMetadataByLocale = useMemo(() => {
    return seoServiceInstanceMetadata.reduce(
      (acc, metadata) => {
        const matchingLocale = SEO_LOCALES.find(
          ({ language }) => language === metadata.language
        );
        if (!matchingLocale) {
          return acc;
        }

        acc[matchingLocale.titleField] = metadata.meta_title;
        acc[matchingLocale.descriptionField] = metadata.meta_description;
        return acc;
      },
      { ...libraryUpdateDefaultValues }
    );
  }, [seoServiceInstanceMetadata]);

  const [editSeoServiceInstance] =
    useMutation<libraryUpdateEditSeoServiceInstanceMutation>(
      EditSeoServiceInstanceMutation
    );

  const updateSeoServiceInstance = (
    language: SeoServiceInstanceLanguage,
    metaTitle: string | undefined,
    metaDescription: string | undefined
  ) => {
    return new Promise<void>((resolve, reject) => {
      editSeoServiceInstance({
        variables: {
          service_instance_id: serviceInstance.id,
          language,
          input: {
            meta_title: metaTitle ?? '',
            meta_description: metaDescription ?? '',
          },
        },
        onCompleted: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  };

  return (
    <GuardCapacityComponent
      portalCapabilityRestriction={[PortalCapability.ModifyServiceMetadata]}>
      <>
        <Button
          variant="tertiary"
          onClick={() => setIsOpen(true)}>
          <EditIcon className="h-4 w-4 mr-s " />
          {t('Utils.Edit')}
        </Button>
        <Dialog
          open={isOpen}
          onOpenChange={setIsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader className="mb-s">
              <DialogTitle>{t('Metadata.SeoMetadata')}</DialogTitle>
            </DialogHeader>
            <AutoForm
              className="space-y-m"
              formSchema={libraryUpdateSchema}
              values={existingSeoMetadataByLocale}
              fieldConfig={libraryUpdateFieldConfig}
              onSubmit={async (values) => {
                try {
                  await Promise.all(
                    SEO_LOCALES.map(
                      ({ language, titleField, descriptionField }) =>
                        updateSeoServiceInstance(
                          language,
                          values[titleField],
                          values[descriptionField]
                        )
                    )
                  );
                  toast({
                    title: t('Utils.Success'),
                  });
                  setIsOpen(false);
                } catch (error) {
                  const errorMessage =
                    error instanceof Error ? error.message : 'UNKNOWN_ERROR';
                  toast({
                    variant: 'destructive',
                    title: t('Utils.Error'),
                    description: t(`Error.Server.${errorMessage}`),
                  });
                }
              }}>
              <DialogFooter className="pt-s">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsOpen(false)}>
                  {t('Utils.Cancel')}
                </Button>
                <Button type="submit">{t('Utils.Validate')}</Button>
              </DialogFooter>
            </AutoForm>
          </DialogContent>
        </Dialog>
      </>
    </GuardCapacityComponent>
  );
};
