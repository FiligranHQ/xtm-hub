import { SubscriptionDeleteMutation } from '@/components/subcription/subscription.graphql';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { useToast } from '@filigran/ui';
import { subscriptionDeleteMutation } from '@generated/subscriptionDeleteMutation.graphql';
import { subscription_fragment$data } from '@generated/subscription_fragment.graphql';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { useMutation } from 'react-relay';

interface ServiceSlugDeleteSubscriptionProps {
  subscription: subscription_fragment$data;
  subscriptionConnectionId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const ServiceSlugDeleteSubscription: FunctionComponent<
  ServiceSlugDeleteSubscriptionProps
> = ({ subscription, subscriptionConnectionId, open, setOpen }) => {
  const [commitDeleteSubscription] = useMutation<subscriptionDeleteMutation>(
    SubscriptionDeleteMutation
  );

  const { toast } = useToast();
  const t = useTranslations();

  const onDeleteSubscription = () => {
    commitDeleteSubscription({
      variables: {
        subscription_id: subscription.id,
        connections: [subscriptionConnectionId],
      },
      onCompleted: () => {
        setOpen(false);
        toast({
          title: t('Utils.Success'),
          description: t('ServiceActions.OrganizationDeleted', {
            name: subscription.organization.name,
          }),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{t(`Error.Server.${error.message}`)}</>,
        });
      },
    });
  };

  return (
    <AlertDialogComponent
      key={`remove-${subscription.id}`}
      AlertTitle={t('Service.Management.RemoveAccess')}
      actionButtonText={t('Service.Management.RemoveAccess')}
      variantName={'destructive'}
      isOpen={open}
      onOpenChange={setOpen}
      onClickContinue={onDeleteSubscription}>
      {t('Service.Management.AreYouSureRemoveOrganizationAccess', {
        organizationName: subscription.organization.name,
      })}
    </AlertDialogComponent>
  );
};
