import { PortalContext } from '@/components/me/app-portal-context';
import {
  REGIONS,
  REGIONS_VALUES,
} from '@/components/service/trial-instances/form-constants';

import { DeploymentRequestsAvailableQuery } from '@/components/service/trial-instances/trial-instances.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import {
  AutoForm,
  Button,
  Checkbox,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { DeploymentRequestActivitySectorEnum } from '@generated/models/DeploymentRequestActivitySector.enum';
import { DeploymentRequestJobTitleEnum } from '@generated/models/DeploymentRequestJobTitle.enum';
import { DeploymentRequestUseCaseEnum } from '@generated/models/DeploymentRequestUseCase.enum';
import { trialInstancesDeploymentRequestsAvailableQuery } from '@generated/trialInstancesDeploymentRequestsAvailableQuery.graphql';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { FunctionComponent, useContext, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { z } from 'zod';

const EnumSelectField = ({
  field,
  label,
  placeholder,
  values,
  translationNamespace,
}: {
  field: ControllerRenderProps;
  label: string;
  placeholder: string;
  values: string[];
  translationNamespace: string;
}) => {
  const t = useTranslations();
  return (
    <FormItem>
      <FormLabel>
        {label} <span className="text-sm text-destructive">*</span>
      </FormLabel>
      <Select
        value={field.value}
        onValueChange={field.onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {values.map((value) => (
            <SelectItem
              key={value}
              value={value}>
              {t(`${translationNamespace}.${value}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage className="text-sm text-destructive" />
    </FormItem>
  );
};

export const tryFiligranProductFormSchema = z.object({
  region: z.enum(REGIONS_VALUES),
  job_title: z.enum(DeploymentRequestJobTitleEnum),
  activity_sector: z.enum(DeploymentRequestActivitySectorEnum),
  use_case: z.enum(DeploymentRequestUseCaseEnum),
  acceptTerms: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      error: 'Please accept the MSSA to continue.',
    }),
});

interface TryFiligranProductFormProps {
  handleSubmit: (values: z.infer<typeof tryFiligranProductFormSchema>) => void;
  handleCloseSheet: (e: React.MouseEvent<HTMLButtonElement>) => void;
  deploymentRequestsAvailabilityQueryRef: PreloadedQuery<trialInstancesDeploymentRequestsAvailableQuery>;
}
export const TryFiligranProductForm: FunctionComponent<
  TryFiligranProductFormProps
> = ({
  handleSubmit,
  handleCloseSheet,
  deploymentRequestsAvailabilityQueryRef,
}) => {
  const { me } = useContext(PortalContext);
  const t = useTranslations();

  const deploymentRequestsAvailability =
    usePreloadedQuery<trialInstancesDeploymentRequestsAvailableQuery>(
      DeploymentRequestsAvailableQuery,
      deploymentRequestsAvailabilityQueryRef
    );

  const [values, setValues] =
    useState<z.infer<typeof tryFiligranProductFormSchema>>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSubmit = (
    newValues: z.infer<typeof tryFiligranProductFormSchema>
  ) => {
    const availabilityForRegion =
      deploymentRequestsAvailability.deploymentRequestsAvailable.filter(
        (avl) => avl.region === newValues.region
      );

    const isRegionAvailable =
      availabilityForRegion[0]?.availableCount &&
      availabilityForRegion[0]?.availableCount > 0;
    if (isRegionAvailable) {
      handleSubmit({ ...newValues });
    } else {
      setIsDialogOpen(true);
      setValues(newValues);
    }
  };

  const confirmSubmit = () => {
    setIsDialogOpen(false);
    handleSubmit(values!);
  };
  return (
    <>
      <div>
        {t('Service.Trials.Form.AssociatedEmail')}: {me?.email}
        <AutoForm
          className="mt-l"
          formSchema={tryFiligranProductFormSchema}
          onSubmit={(values) => {
            onSubmit(values);
          }}
          fieldConfig={{
            region: {
              label: t('Service.Trials.Form.Region'),
              fieldType: ({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('Service.Trials.Form.Region')}{' '}
                    <span className="text-sm text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('Service.Trials.Form.RegionPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem
                          key={region.value}
                          value={region.value}>
                          {t(`Region.${region.label}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-sm text-destructive" />
                </FormItem>
              ),
            },
            job_title: {
              label: t('Service.Trials.Form.JobTitle'),
              fieldType: ({ field }) => (
                <EnumSelectField
                  field={field}
                  label={t('Service.Trials.Form.JobTitle')}
                  placeholder={t('Service.Trials.Form.JobTitlePlaceholder')}
                  values={Object.values(DeploymentRequestJobTitleEnum)}
                  translationNamespace="DeploymentRequestJobTitle"
                />
              ),
            },
            activity_sector: {
              label: t('Service.Trials.Form.ActivitySector'),
              fieldType: ({ field }) => (
                <EnumSelectField
                  field={field}
                  label={t('Service.Trials.Form.ActivitySector')}
                  placeholder={t(
                    'Service.Trials.Form.ActivitySectorPlaceholder'
                  )}
                  values={Object.values(DeploymentRequestActivitySectorEnum)}
                  translationNamespace="DeploymentRequestActivitySector"
                />
              ),
            },
            use_case: {
              label: t('Service.Trials.Form.UseCase'),
              fieldType: ({ field }) => (
                <EnumSelectField
                  field={field}
                  label={t('Service.Trials.Form.UseCase')}
                  placeholder={t('Service.Trials.Form.UseCasePlaceholder')}
                  values={Object.values(DeploymentRequestUseCaseEnum)}
                  translationNamespace="DeploymentRequestUseCase"
                />
              ),
            },
            acceptTerms: {
              fieldType: ({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="displayPersonalSpaces"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="displayPersonalSpaces"
                      className="txt-sub-content cursor-pointer">
                      {t('Service.Trials.Form.MSSAAgreement')}{' '}
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue"
                        href="https://filigran.io/mssa/">
                        {t('Service.Trials.Form.MSSA')}
                      </Link>
                      <span className="text-destructive">*</span>
                    </label>
                  </div>
                  <FormMessage className="text-sm text-destructive" />
                </FormItem>
              ),
            },
          }}>
          <div className="flex justify-end gap-s">
            <Button
              variant="outline"
              type="button"
              onClick={(values) => {
                handleCloseSheet(values);
              }}>
              {t('Utils.Cancel')}
            </Button>

            <Button type="submit">{t('Register.Confirm')}</Button>
          </div>
        </AutoForm>
      </div>
      <AlertDialogComponent
        isOpen={isDialogOpen}
        AlertTitle={t('Service.Trials.CapacityWarning.Title')}
        actionButtonText={t('Service.Trials.CapacityWarning.Continue')}
        variantName={'destructive'}
        onOpenChange={setIsDialogOpen}
        onClickContinue={confirmSubmit}>
        {t('Service.Trials.CapacityWarning.Content')}
      </AlertDialogComponent>
    </>
  );
};
