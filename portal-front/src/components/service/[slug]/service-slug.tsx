import {
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';
import { useToast } from 'filigran-ui/clients';
import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { RESTRICTION } from '@/utils/constant';
import GuardCapacityComponent from '@/components/admin-guard';
import {
  SubscriptionDeleteMutation,
  SubscriptionsByService,
} from '@/components/subcription/subscription.graphql';
import { subscriptionDeleteMutation } from '../../../../__generated__/subscriptionDeleteMutation.graphql';
import {
  subscriptionByServiceQuery,
  subscriptionByServiceQuery$variables,
} from '../../../../__generated__/subscriptionByServiceQuery.graphql';
import { serviceByIdQuery } from '../../../../__generated__/serviceByIdQuery.graphql';
import { ServiceById } from '@/components/service/service.graphql';
import { ServiceSlugFormSheet } from '@/components/service/[slug]/service-slug-form-sheet';
import TriggerButton from '@/components/ui/trigger-button';
import { subscriptionByService_fragment$data } from '../../../../__generated__/subscriptionByService_fragment.graphql';
import { SubscriptionStatusTypeBadge } from '@/components/ui/subscription-status-badge';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { SubscriptionTabs } from '@/components/service/[slug]/subscription-tabs';
import { ServiceHeader } from '@/components/service/[slug]/service-header';
import useGranted from '@/hooks/useGranted';

interface ServiceSlugProps {
  queryRef: PreloadedQuery<subscriptionByServiceQuery>;
  queryRefService: PreloadedQuery<serviceByIdQuery>;
  loadQuery: (
    variables: subscriptionByServiceQuery$variables,
    options?: UseQueryLoaderLoadQueryOptions | undefined
  ) => void;
  serviceId: string;
}

const ServiceSlug: FunctionComponent<ServiceSlugProps> = ({
  queryRef,
  queryRefService,
  loadQuery,
  serviceId,
}) => {
  const [openSheet, setOpenSheet] = useState(false);
  const [openSheetAddOrga, setOpenSheetAddOrga] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  const { toast } = useToast();

  const queryData = usePreloadedQuery<subscriptionByServiceQuery>(
    SubscriptionsByService,
    queryRef
  );
  const queryDataService = usePreloadedQuery<serviceByIdQuery>(
    ServiceById,
    queryRefService
  );

  const [commitSubscriptionMutation] = useMutation<subscriptionDeleteMutation>(
    SubscriptionDeleteMutation
  );

  const onRemoveOrganization = (subscription_id: string) => {
    commitSubscriptionMutation({
      variables: {
        subscription_id: subscription_id,
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: <>{'Organization removed'}</>,
        });
        loadQuery({ service_id: serviceId }, { fetchPolicy: 'network-only' });

        setOpenSheet(false);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      },
    });
  };

  const breadcrumbValue = [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: queryDataService.serviceById?.name,
    },
  ];
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1>{queryDataService.serviceById?.type} management</h1>
      <ServiceHeader
        serviceType={queryDataService.serviceById?.type}
        serviceName={queryDataService.serviceById?.name}
        subscriptionStatus={
          queryData.subscriptionsByServiceId?.[0]
            ?.status as SubscriptionStatusTypeBadge
        }
      />

      <div>{queryDataService.serviceById?.description}</div>
      <GuardCapacityComponent
        capacityRestriction={[
          RESTRICTION.CAPABILITY_BYPASS,
          RESTRICTION.CAPABILITY_BCK_MANAGE_SERVICES,
          RESTRICTION.CAPABILITY_BCK_MANAGE_COMMUNITIES,
        ]}>

        <div className="flex justify-end">
          <ServiceSlugFormSheet
            open={openSheet}
            setOpen={setOpenSheet}
            userService={currentUser}
            connectionId={''}
            refetch={() =>
              loadQuery(
                { service_id: serviceId },
                { fetchPolicy: 'network-only' }
              )
            }
            subscriptionId={queryData.subscriptionsByServiceId?.[0]?.id ?? ''}
            trigger={
              (queryDataService.serviceById?.type === 'COMMUNITY' ||
                useGranted('BYPASS')) && (
                <TriggerButton
                  disabled={
                    queryData.subscriptionsByServiceId?.[0]?.status ===
                    'REQUESTED'
                  }
                  onClick={() => setCurrentUser({})}
                  label="Invite user"
                />
              )
            }
          />
        </div>
        <div className="pt-xs">
        <SubscriptionTabs
          subscriptions={
            queryData.subscriptionsByServiceId as subscriptionByService_fragment$data[]
          }
          serviceType={queryDataService.serviceById?.type}
          serviceId={serviceId}
          onRemoveOrganization={onRemoveOrganization}
          openSheet={openSheet}
          setOpenSheet={setOpenSheet}
          setCurrentUser={setCurrentUser}
          openSheetAddOrga={openSheetAddOrga}
          setOpenSheetAddOrga={setOpenSheetAddOrga}
          loadQuery={() =>
            loadQuery(
              { service_id: serviceId },
              { fetchPolicy: 'network-only' }
            )
          }
        />
        </div>
      </GuardCapacityComponent>
    </>
  );
};

export default ServiceSlug;
