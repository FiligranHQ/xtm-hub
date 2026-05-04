import { ServiceSlugAddOrgaForm } from '@/components/service/[slug]/ServiceSlugAddOrgaForm';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { Button } from '@filigran/ui';
import { serviceInstanceForSubscriptions_fragment$data } from '@generated/serviceInstanceForSubscriptions_fragment.graphql';
import { subscription_fragment$data } from '@generated/subscription_fragment.graphql';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useState } from 'react';

interface ServiceSlugAddSubscriptionActionProps {
  isAdminPath: boolean;
  serviceInstance: serviceInstanceForSubscriptions_fragment$data;
  subscriptions: subscription_fragment$data[];
  subscriptionConnectionId: string;
}

export const ServiceSlugAddSubscription: FunctionComponent<
  ServiceSlugAddSubscriptionActionProps
> = ({
  isAdminPath,
  serviceInstance,
  subscriptions,
  subscriptionConnectionId,
}) => {
  const [openSheetAddOrga, setOpenSheetAddOrga] = useState(false);
  const t = useTranslations();

  if (!isAdminPath || !serviceInstance) {
    return null;
  }

  return (
    <SheetWithPreventingDialog
      open={openSheetAddOrga}
      setOpen={setOpenSheetAddOrga}
      trigger={<Button>{t('Service.SubscribeOrganization')}</Button>}
      title={
        t('OrganizationInServiceAction.AddOrganization') +
        ' ' +
        serviceInstance.name
      }>
      <ServiceSlugAddOrgaForm
        subscriptions={subscriptions}
        subscriptionConnectionId={subscriptionConnectionId}
        serviceInstance={serviceInstance}
      />
    </SheetWithPreventingDialog>
  );
};
