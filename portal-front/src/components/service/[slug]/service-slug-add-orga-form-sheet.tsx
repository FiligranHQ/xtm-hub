import { getOrganizations } from '@/components/organization/organization.service';
import { AddSubscriptionInServiceMutation } from '@/components/subcription/subscription.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  useToast,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { Dispatch, FunctionComponent, ReactNode, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-relay';
import { z, ZodSchema } from 'zod';
import { subscriptionInServiceCreateMutation } from '../../../../__generated__/subscriptionInServiceCreateMutation.graphql';
import { subscriptionWithUserService_fragment$data } from '../../../../__generated__/subscriptionWithUserService_fragment.graphql';

interface ServiceSlugAddOrgaFormSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
  serviceId: string;
  subscriptions: subscriptionWithUserService_fragment$data[];
  setSelectedSubscription: Dispatch<
    SetStateAction<subscriptionWithUserService_fragment$data>
  >;
}

export const ServiceSlugAddOrgaFormSheet: FunctionComponent<
  ServiceSlugAddOrgaFormSheetProps
> = ({
  open,
  setOpen,
  trigger,
  serviceId,
  subscriptions,
  setSelectedSubscription,
}) => {
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
      })
    ),
    defaultValues: {
      organization_id: '',
    },
  });

  const onSubmit = (inputValue: z.infer<ZodSchema>) => {
    commitSubscriptionCreateMutation({
      variables: {
        service_id: serviceId,
        organization_id: inputValue.organization_id,
      },
      onCompleted: (response) => {
        const findOrganization =
          response.addSubscriptionInService?.subscriptions?.find(
            (sub) => sub?.organization.id === inputValue.organization_id
          );
        if (findOrganization) {
          setSelectedSubscription(
            findOrganization as subscriptionWithUserService_fragment$data
          );
        }
        toast({
          title: t('Utils.Success'),
          description: t('ServiceActions.OrganizationAdded'),
        });
      },
      onError: (error: Error) => {
        const message = error.message.includes(
          "You've already subscribed this organization to this service"
        )
          ? t('Error.Subscription.SubscriptionAlreadyExistsForOrganization')
          : t('Error.Subscription.AddSubscriptionInService');
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{message}</>,
        });
      },
    });
    setOpen(false);
  };

  return (
    <Sheet
      key={'right'}
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader className="bg-page-background">
          <SheetTitle className="txt-title">
            {t('OrganizationInServiceAction.AddOrganization')}
          </SheetTitle>
          <SheetDescription>
            {t('OrganizationInServiceAction.AddOrganizationDescription')}
          </SheetDescription>
        </SheetHeader>

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

            <SheetFooter className="pt-2">
              <SheetClose asChild>
                <Button variant="outline">{t('Utils.Cancel')}</Button>
              </SheetClose>
              <Button
                disabled={!form.formState.isDirty}
                type="submit">
                {t('Utils.Validate')}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
