import { getOrganizations } from '@/components/organization/organization.service';
import { AddSubscriptionInServiceMutation } from '@/components/subcription/subscription.graphql';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { serviceCapability_fragment$data } from '@generated/serviceCapability_fragment.graphql';
import { subscriptionInServiceCreateMutation } from '@generated/subscriptionInServiceCreateMutation.graphql';
import { subscriptionWithUserService_fragment$data } from '@generated/subscriptionWithUserService_fragment.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
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
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-relay';
import { z, ZodSchema } from 'zod';

interface ServiceSlugAddOrgaFormSheetProps {
  serviceId: string;
  subscriptions: subscriptionWithUserService_fragment$data[];
  capabilities: serviceCapability_fragment$data[];
}

export const ServiceSlugAddOrgaForm: FunctionComponent<
  ServiceSlugAddOrgaFormSheetProps
> = ({ serviceId, subscriptions, capabilities }) => {
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

  const form = useForm<z.infer<ZodSchema>>({
    resolver: zodResolver(
      z.object({
        organization_id: z.string().min(2, {
          message: 'You must choose an organization.',
        }),
        capability_ids: z.array(z.string()),
      })
    ),
    defaultValues: {
      organization_id: '',
      capability_ids: [],
    },
  });
  setIsDirty(form.formState.isDirty);
  const onSubmit = (inputValue: z.infer<ZodSchema>) => {
    commitSubscriptionCreateMutation({
      variables: {
        service_instance_id: serviceId,
        organization_id: inputValue.organization_id,
        capability_ids: inputValue.capability_ids,
      },
      onCompleted: (response) => {
        const findOrganization =
          response.addSubscriptionInService?.subscriptions?.find(
            (sub) => sub?.organization.id === inputValue.organization_id
          );

        toast({
          title: t('Utils.Success'),
          description: t('ServiceActions.OrganizationAdded', {
            name: findOrganization?.organization?.name,
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
                <FormItem className="flex items-center space-x-2">
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
  );
};
