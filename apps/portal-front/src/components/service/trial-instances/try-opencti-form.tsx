import { PortalContext } from '@/components/me/app-portal-context';
import {
  ACTIVITIES_SECTOR,
  JOB_TITLES,
  REGIONS,
  REGIONS_VALUES,
  USE_CASES,
} from '@/components/service/trial-instances/form-constants';
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
import React, { FunctionComponent, useContext } from 'react';
import { z } from 'zod';

export const tryOpenCTIFormSchema = z.object({
  region: z.enum(REGIONS_VALUES),
  job_title: z.enum(JOB_TITLES),
  activity_sector: z.enum(ACTIVITIES_SECTOR),
  use_case: z.enum(USE_CASES),
  acceptTerms: z.boolean().refine((value) => value === true, {
    error: 'You must accept the MSSA',
  }),
});

interface TryOpenCTIFormProps {
  handleSubmit: (values: z.infer<typeof tryOpenCTIFormSchema>) => void;
  handleCloseSheet: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
export const TryOpenCTIForm: FunctionComponent<TryOpenCTIFormProps> = ({
  handleSubmit,
  handleCloseSheet,
}) => {
  const { me } = useContext(PortalContext);

  const t = useTranslations();

  const onSubmit = (values: z.infer<typeof tryOpenCTIFormSchema>) => {
    handleSubmit({
      ...values,
    });
  };
  return (
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
                        {region.label}
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
                      href={'/app/service/free-trial/mssa'}>
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
  );
};
