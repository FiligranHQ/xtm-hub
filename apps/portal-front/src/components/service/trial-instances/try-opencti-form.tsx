import { PortalContext } from '@/components/me/app-portal-context';
import {
  ACTIVITIES_SECTOR,
  JOB_TITLES,
  REGIONS,
  REGIONS_VALUES,
  USE_CASES,
} from '@/components/service/trial-instances/form-constants';

import { DeploymentRequestsAvailableQuery } from '@/components/service/trial-instances/trial-instances.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { HubStatusEnum } from '@generated/models/HubStatus.enum';
import { trialInstancesDeploymentRequestsAvailableQuery } from '@generated/trialInstancesDeploymentRequestsAvailableQuery.graphql';
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
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { FunctionComponent, useContext, useState } from 'react';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { z } from 'zod';

export const tryOpenCTIFormSchema = z.object({
  region: z.enum(REGIONS_VALUES),
  job_title: z.enum(JOB_TITLES),
  activity_sector: z.enum(ACTIVITIES_SECTOR),
  use_case: z.enum(USE_CASES),
  acceptTerms: z.boolean().refine((value) => value === true, {
    error: 'You must accept the MSSA',
  }),
  hub_status: z
    .enum([HubStatusEnum.QUEUED, HubStatusEnum.PENDING])
    .default(HubStatusEnum.PENDING),
});

interface TryOpenCTIFormProps {
  handleSubmit: (values: z.infer<typeof tryOpenCTIFormSchema>) => void;
  handleCloseSheet: (e: React.MouseEvent<HTMLButtonElement>) => void;
  deploymentRequestsAvailabilityQueryRef: PreloadedQuery<trialInstancesDeploymentRequestsAvailableQuery>;
}
export const TryOpenCTIForm: FunctionComponent<TryOpenCTIFormProps> = ({
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

  const [pendingValues, setPendingValues] =
    useState<z.infer<typeof tryOpenCTIFormSchema>>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSubmit = (values: z.infer<typeof tryOpenCTIFormSchema>) => {
    const availabilityForRegion =
      deploymentRequestsAvailability.deploymentRequestsAvailable.filter(
        (avl) => avl.region === values.region
      );

    const isRegionAvailable =
      availabilityForRegion[0]?.availableCount &&
      availabilityForRegion[0]?.availableCount > 0;
    if (isRegionAvailable) {
      handleSubmit({ ...values });
    } else {
      setIsDialogOpen(true);
      setPendingValues({
        ...values,
        hub_status: HubStatusEnum.QUEUED,
      });
    }
  };

  const confirmSubmit = () => {
    setIsDialogOpen(false);
    handleSubmit(pendingValues!);
  };
  return (
    <>
      <div>
        {t('Service.Trials.Form.AssociatedEmail')}: {me?.email}
        <AutoForm
          className="mt-l"
          formSchema={tryOpenCTIFormSchema}
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
                      <SelectValue />
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
            },
            activity_sector: {
              label: t('Service.Trials.Form.ActivitySector'),
            },
            use_case: {
              label: t('Service.Trials.Form.UseCase'),
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
            hub_status: {
              fieldType: () => <FormItem hidden />,
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
