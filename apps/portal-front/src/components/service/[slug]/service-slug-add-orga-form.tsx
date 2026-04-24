import { getOrganizations } from '@/components/organization/organization.service';
import { AddSubscriptionInServiceMutation } from '@/components/subcription/subscription.graphql';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { subscriptionInServiceCreateMutation } from '@generated/subscriptionInServiceCreateMutation.graphql';

import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SheetFooter,
  useToast,
} from '@filigran/ui';
import { serviceCapability_fragment$data } from '@generated/serviceCapability_fragment.graphql';
import { subscriptionWithUserService_fragment$data } from '@generated/subscriptionWithUserService_fragment.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-relay';
import { z } from 'zod';

interface ServiceSlugAddOrgaFormSheetProps {
  serviceId: string;
  serviceName: string;
  subscriptions: subscriptionWithUserService_fragment$data[];
  capabilities: serviceCapability_fragment$data[];
}

const formSchema = z.object({
  organization_id: z.string().min(2, {
    error: 'You must choose an organization.',
  }),
  capability_ids: z.array(z.string()),
  start_date: z.coerce.date<Date>(),
  end_date: z.coerce.date<Date>().optional(),
});

export const ServiceSlugAddOrgaForm: FunctionComponent<
  ServiceSlugAddOrgaFormSheetProps
> = ({ serviceId, serviceName, subscriptions, capabilities }) => {
  const { handleCloseSheet, setIsDirty, setOpenSheet } = useDialogContext();
  const [organizations] = getOrganizations();
  const t = useTranslations();
  const { toast } = useToast();

  const currentOrganizationSubscriptions = subscriptions.map(
    ({ organization }) => organization.name
  );
  const canBeSelectedOrganizations = organizations.organizations.edges.filter(
    (organization) =>
      !currentOrganizationSubscriptions.includes(organization.node.name)
  );

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

  setIsDirty(form.formState.isDirty);
  const onSubmit = (inputValue: z.infer<typeof formSchema>) => {
    commitSubscriptionCreateMutation({
      variables: {
        service_instance_id: serviceId,
        organization_id: inputValue.organization_id,
        capability_ids: inputValue.capability_ids,
        start_date: inputValue.start_date,
        end_date: inputValue.end_date,
      },
      onCompleted: (response) => {
        const findOrganization =
          response.addSubscriptionInService?.subscriptions?.find(
            (sub) => sub?.organization.id === inputValue.organization_id
          );

        toast({
          title: t('Utils.Success'),
          description: t('ServiceActions.OrganizationAdded', {
            name: findOrganization!.organization.name,
            serviceName: serviceName,
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('OrganizationInServiceAction.Organization')}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
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
                    {canBeSelectedOrganizations.map(({ node }) => (
                      <SelectItem
                        key={node.id}
                        value={node.id}>
                        {node.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="border border-primary rounded-lg p-l">
            <FormLabel>{t('OrganizationInServiceAction.SelectCapa')}</FormLabel>
            <p className="txt-sub-content italic">
              {t('OrganizationInServiceAction.SelectCapaDescription')}
            </p>
            {capabilities.map(({ id, name, description }) => (
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
                          : field.value.filter((value: string) => value !== id);
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
