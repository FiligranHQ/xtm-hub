import { PortalContext } from '@/components/me/AppPortalContext';
import {
  REGIONS_VALUES,
  USE_CASES_BY_PLATFORM_IDENTIFIER,
} from '@/components/service/trial-instances/form-constants';
import { TranslatableEnumSelectField } from '@/components/ui/TranslatableEnumSelectField';
import { WarningIcon } from '@filigran/icon';
import {
  Button,
  Checkbox,
  Form,
  FormField,
  FormItem,
  FormMessage,
} from '@filigran/ui';
import {
  DeploymentRequestActivitySector,
  DeploymentRequestJobTitle,
  DeploymentRequestUseCase,
  PlatformIdentifier,
} from '@graphql/generated';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useContext } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

export const xtmPlatformTrialFormSchema = z.object({
  region: z.enum(REGIONS_VALUES),
  job_title: z.enum(DeploymentRequestJobTitle),
  activity_sector: z.enum(DeploymentRequestActivitySector),
  products: z.array(z.enum(PlatformIdentifier)),
  use_cases_by_product: z.array(
    z.object({
      platform_identifier: z.enum(PlatformIdentifier),
      use_case: z.enum(DeploymentRequestUseCase),
    })
  ),
  acceptTerms: z.boolean().refine((value) => value === true, {
    error: 'Please accept the MSSA to continue.',
  }),
});

const SELECTABLE_PRODUCTS = [
  PlatformIdentifier.Opencti,
  PlatformIdentifier.Openaev,
];

const emptyUseCase = undefined as unknown as DeploymentRequestUseCase;

interface XtmPlatformTrialFormProps {
  handleSubmit: (values: z.infer<typeof xtmPlatformTrialFormSchema>) => void;
}

export const XtmPlatformTrialForm = ({
  handleSubmit,
}: XtmPlatformTrialFormProps) => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);

  const form = useForm<z.infer<typeof xtmPlatformTrialFormSchema>>({
    resolver: zodResolver(xtmPlatformTrialFormSchema),
    defaultValues: {
      products: [
        PlatformIdentifier.Opencti,
        PlatformIdentifier.Openaev,
        PlatformIdentifier.Xtmone,
      ],
      use_cases_by_product: SELECTABLE_PRODUCTS.map((platformIdentifier) => ({
        platform_identifier: platformIdentifier,
        use_case: emptyUseCase,
      })),
      acceptTerms: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'use_cases_by_product',
  });

  const products = form.watch('products');

  const hasSelectableProduct = products.some(
    (product) => product !== PlatformIdentifier.Xtmone
  );

  const toggleProduct = (
    platformIdentifier: PlatformIdentifier,
    checked: boolean
  ) => {
    if (checked) {
      form.setValue('products', [...products, platformIdentifier]);
      append({
        platform_identifier: platformIdentifier,
        use_case: emptyUseCase,
      });
      return;
    }
    form.setValue(
      'products',
      products.filter((product) => product !== platformIdentifier)
    );
    const index = fields.findIndex(
      (entry) => entry.platform_identifier === platformIdentifier
    );
    if (index !== -1) {
      remove(index);
    }
  };

  return (
    <div className="flex w-full flex-col gap-xl rounded bg-page-background p-xl">
      <div className="flex items-center gap-l">
        <span className="txt-default text-muted-foreground">
          {t('Service.Trials.Form.AssociatedEmail')}
        </span>
        <span className="txt-default-bold">{me?.email}</span>
      </div>

      <Form {...form}>
        <form
          className="flex w-full flex-col gap-l"
          onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex flex-col gap-s rounded bg-hover p-l">
            <h3 className="txt-title-xs">
              {t('Service.Trials.XtmPlatform.Page.Form.ProductsTitle')}
            </h3>

            <div className="flex items-start gap-xs rounded border border-solid border-orange p-s text-sm ">
              <WarningIcon className="size-4 shrink-0 text-feedback-warning-primary" />
              <span>
                {t('Service.Trials.XtmPlatform.Page.Form.ProductsWarning')}
              </span>
            </div>

            <div className="flex items-center gap-xl">
              {SELECTABLE_PRODUCTS.map((platformIdentifier) => (
                <div
                  key={platformIdentifier}
                  className="flex items-center gap-s">
                  <Checkbox
                    id={`product-${platformIdentifier}`}
                    checked={products.includes(platformIdentifier)}
                    onCheckedChange={(checked) =>
                      toggleProduct(platformIdentifier, checked === true)
                    }
                  />
                  <label
                    htmlFor={`product-${platformIdentifier}`}
                    className="txt-default cursor-pointer">
                    {t(`PlatformIdentifier.${platformIdentifier}`)}
                  </label>
                </div>
              ))}

              <div className="flex items-center gap-s">
                <Checkbox
                  id="product-xtmone"
                  checked
                  disabled
                />
                <label
                  htmlFor="product-xtmone"
                  className="txt-default text-muted-foreground">
                  {t(`PlatformIdentifier.${PlatformIdentifier.Xtmone}`)}
                </label>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <TranslatableEnumSelectField
                field={field}
                label={t('Service.Trials.Form.Region')}
                placeholder={t('Service.Trials.Form.RegionPlaceholder')}
                values={REGIONS_VALUES}
                translationNamespace="Region"
              />
            )}
          />

          <FormField
            control={form.control}
            name="job_title"
            render={({ field }) => (
              <TranslatableEnumSelectField
                field={field}
                label={t('Service.Trials.Form.JobTitle')}
                placeholder={t('Service.Trials.Form.JobTitlePlaceholder')}
                values={Object.values(DeploymentRequestJobTitle)}
                translationNamespace="DeploymentRequestJobTitle"
              />
            )}
          />

          <FormField
            control={form.control}
            name="activity_sector"
            render={({ field }) => (
              <TranslatableEnumSelectField
                field={field}
                label={t('Service.Trials.Form.ActivitySector')}
                placeholder={t('Service.Trials.Form.ActivitySectorPlaceholder')}
                values={Object.values(DeploymentRequestActivitySector)}
                translationNamespace="DeploymentRequestActivitySector"
              />
            )}
          />

          {fields.map((entry, index) => (
            <FormField
              key={entry.id}
              control={form.control}
              name={`use_cases_by_product.${index}.use_case`}
              render={({ field }) => (
                <TranslatableEnumSelectField
                  field={field}
                  label={t('Service.Trials.XtmPlatform.Page.Form.UseCaseFor', {
                    product: t(
                      `PlatformIdentifier.${entry.platform_identifier}`
                    ),
                  })}
                  placeholder={t('Service.Trials.Form.UseCasePlaceholder')}
                  values={
                    USE_CASES_BY_PLATFORM_IDENTIFIER[entry.platform_identifier]
                  }
                  translationNamespace="DeploymentRequestUseCase"
                />
              )}
            />
          ))}

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-l">
                  <Checkbox
                    id="acceptTerms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="txt-default cursor-pointer text-muted-foreground">
                    {t('Service.Trials.Form.MSSAAgreement')}{' '}
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-primary"
                      href="https://filigran.io/mssa/">
                      {t('Service.Trials.Form.MSSA')}
                    </Link>
                  </label>
                </div>
                <FormMessage className="text-sm text-destructive" />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!hasSelectableProduct}>
              {t('Service.Trials.XtmPlatform.Page.Form.Submit')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
