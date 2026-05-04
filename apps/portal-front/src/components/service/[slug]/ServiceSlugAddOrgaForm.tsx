import { getOrganizations } from '@/components/organization/Organization.service';
import { AddSubscriptionInServiceMutation } from '@/components/subcription/subscription.graphql';
import { useDialogContext } from '@/components/ui/SheetWithPreventingDialog';
import { subscriptionInServiceCreateMutation } from '@generated/subscriptionInServiceCreateMutation.graphql';
import { subscription_fragment$data } from '@generated/subscription_fragment.graphql';

import {
  Button,
  Checkbox,
  Combobox,
  DatePicker,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SheetFooter,
  useToast,
} from '@filigran/ui';
import { serviceInstanceForSubscriptions_fragment$data } from '@generated/serviceInstanceForSubscriptions_fragment.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-relay';
import { z } from 'zod';

interface ServiceSlugAddOrgaFormSheetProps {
  serviceInstance: serviceInstanceForSubscriptions_fragment$data;
  subscriptions: subscription_fragment$data[];
  subscriptionConnectionId: string;
}

const formSchema = z.object({
  organization_id: z.string().min(2, {
    error: 'You must choose an organization.',
  }),
  capability_ids: z.array(z.string()),
  start_date: z.coerce.date<Date>(),
  end_date: z.coerce.date<Date>().optional(),
});

export const ServiceSlugAddOrgaForm = ({
                                         serviceInstance,
                                         subscriptions,
                                         subscriptionConnectionId,
}: ServiceSlugAddOrgaFormSheetProps) => {
  const { handleCloseSheet, setIsDirty, setOpenSheet } = useDialogContext();
  const t = useTranslations();
  const { toast } = useToast();
  const [organizationsData, refetch] = getOrganizations();
  const organizations = useMemo(() => {
    const subscribedOrganizationIds = new Set(
      subscriptions
        .map((subscription) => subscription.organization?.id)
        .filter((id): id is string => Boolean(id))
    );

    return organizationsData.organizations.edges
      .map(({ node }) => node)
      .filter(({ id }) => !subscribedOrganizationIds.has(id));
  }, [organizationsData.organizations.edges, subscriptions]);

  const onAutocompleteOrganization = (value: string) => {
    refetch({ searchTerm: value });
  };

  const onOrganizationChange = (
    value: { id: string; name: string } | undefined,
    onChange: (value: string) => void
  ) => {
    onChange(value?.id ?? '');
    refetch({ searchTerm: '' });
  };

  const [commitSubscriptionCreateMutation] =
    useMutation<subscriptionInServiceCreateMutation>(
      AddSubscriptionInServiceMutation
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization_id: '',
      capability_ids: [],
      start_date: new Date(),
    },
  });

  useEffect(() => {
    setIsDirty(form.formState.isDirty);
  }, [form.formState.isDirty, setIsDirty]);

  const onSubmit = (inputValue: z.infer<typeof formSchema>) => {
    const selectedOrganizationName =
      organizations.find(({ id }) => id === inputValue.organization_id)?.name ??
      '';

    const input = {
      service_instance_id: serviceInstance.id,
      organization_id: inputValue.organization_id,
      capability_ids: inputValue.capability_ids,
      start_date: inputValue.start_date,
      end_date: inputValue.end_date,
    };
    commitSubscriptionCreateMutation({
      variables: {
        input,
        connections: [subscriptionConnectionId],
      },
      onCompleted: (_response) => {
        toast({
          title: t('Utils.Success'),
          description: t('ServiceActions.OrganizationAdded', {
            name: selectedOrganizationName,
            serviceName: serviceInstance.name,
          }),
        });
        setOpenSheet(false);
      },
      onError: (error: Error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{t(`Error.Server.${error.message}`)}</>,
        });
      },
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-xl">
          <FormField
            control={form.control}
            name="organization_id"
            render={({ field }) => {
              const selectedOrganization = organizations.find(
                ({ id }) => id === field.value
              );

              return (
                <FormItem>
                  <FormLabel>
                    {t('OrganizationInServiceAction.Organization')}
                  </FormLabel>
                  <Combobox
                    className="w-45"
                    dataTab={organizations}
                    order={t('OrganizationInServiceAction.SelectOrganization')}
                    placeholder={t(
                      'OrganizationInServiceAction.SelectOrganization'
                    )}
                    emptyCommand={t('Utils.NotFound')}
                    keyValue={'id'}
                    keyLabel={'name'}
                    value={selectedOrganization}
                    onInputChange={onAutocompleteOrganization}
                    onValueChange={(value) =>
                      onOrganizationChange(value, field.onChange)
                    }
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div className="border border-primary rounded-lg p-l">
            <FormLabel>{t('OrganizationInServiceAction.SelectCapa')}</FormLabel>
            <p className="txt-sub-content italic">
              {t('OrganizationInServiceAction.SelectCapaDescription')}
            </p>
            {serviceInstance.service_definition?.service_capability
              ?.filter((sc) => !!sc)
              .map(({ id, name, description }) => (
                <FormField
                  key={id}
                  control={form.control}
                  name="capability_ids"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center">
                      <Checkbox
                        className="mt-xs"
                        checked={field.value.includes(id)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...field.value, id]
                            : field.value.filter(
                                (value: string) => value !== id
                              );
                          field.onChange(newValue);
                        }}
                        id={id}
                      />

                      <label
                        htmlFor={id}
                        className="txt-sub-content cursor-pointer">
                        {name} access: {description}
                      </label>
                    </FormItem>
                  )}
                />
              ))}
          </div>

          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <>
                <FormItem>
                  <FormLabel>
                    {t('OrganizationInServiceAction.StartDate')}
                  </FormLabel>
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              </>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <>
                <FormItem>
                  <FormLabel>
                    {t('OrganizationInServiceAction.EndDate')}
                  </FormLabel>
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              </>
            )}
          />

          <SheetFooter className="pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={(e) => handleCloseSheet(e)}>
              {t('Utils.Cancel')}
            </Button>
            <Button
              disabled={!form.formState.isValid}
              type="submit">
              {t('Utils.Validate')}
            </Button>
          </SheetFooter>
        </form>
      </Form>
    </>
  );
};
