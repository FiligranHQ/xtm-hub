import GuardCapacityComponent from '@/components/admin-guard';
import { ServiceSlugAddOrgaFormSheet } from '@/components/service/[slug]/service-slug-add-orga-form-sheet';
import { ServiceSlugFormSheet } from '@/components/service/[slug]/service-slug-form-sheet';
import ServiceUserServiceSlug from '@/components/service/[slug]/service-user-service-table';
import { ServiceById } from '@/components/service/service.graphql';
import {
  SubscriptionDeleteMutation,
  SubscriptionsByService,
} from '@/components/subcription/subscription.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import TriggerButton from '@/components/ui/trigger-button';
import useGranted from '@/hooks/useGranted';
import { RESTRICTION } from '@/utils/constant';
import { DeleteIcon } from 'filigran-icon';
import {
  Combobox,
  DataTableHeadBarOptions,
  useToast,
} from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { FunctionComponent, useState } from 'react';
import {
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';
import { serviceByIdQuery } from '../../../../__generated__/serviceByIdQuery.graphql';
import { subscriptionByService_fragment$data } from '../../../../__generated__/subscriptionByService_fragment.graphql';
import {
  subscriptionByServiceQuery,
  subscriptionByServiceQuery$variables,
} from '../../../../__generated__/subscriptionByServiceQuery.graphql';
import { subscriptionDeleteMutation } from '../../../../__generated__/subscriptionDeleteMutation.graphql';
import { userService_fragment$data } from '../../../../__generated__/userService_fragment.graphql';

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

  const [selectedSubscription, setSelectedSubscription] = useState<
    subscriptionByService_fragment$data | undefined
  >(
    (queryData
      .subscriptionsByServiceId?.[0] as subscriptionByService_fragment$data) ??
      undefined
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
        setSelectedSubscription(
          (queryData
            .subscriptionsByServiceId?.[0] as subscriptionByService_fragment$data) ??
            undefined
        );
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

  const onValueChange = (value: string) => {
    setSelectedSubscription(
      queryData.subscriptionsByServiceId?.find(
        (sub) => sub?.organization_name === value
      ) as subscriptionByService_fragment$data
    );
  };
  if (queryData.subscriptionsByServiceId?.length === 0) {
    return (
      <div className="border p-xl">
        There is no subscription yet on this service...
      </div>
    );
  }
  const dataOrganizationsTab = (queryData.subscriptionsByServiceId ?? []).map(
    (subs) => {
      return {
        value: subs?.organization_name ?? '',
        label: subs?.organization_name ?? '',
      };
    }
  );
  const toolbar = (
    <div className="flex justify-between flex-wrap gap-s pt-s">
      <div className="flex gap-s items-center">
        <Combobox
          key={selectedSubscription?.id}
          className="w-[200px]"
          dataTab={dataOrganizationsTab}
          order={'Select an organization'}
          placeholder={'Select an organization'}
          emptyCommand={'Not found'}
          onValueChange={onValueChange}
          value={selectedSubscription?.organization_name ?? ''}
          onInputChange={() => {}}
        />
        <GuardCapacityComponent
          capacityRestriction={[
            RESTRICTION.CAPABILITY_BYPASS,
            RESTRICTION.CAPABILITY_BCK_MANAGE_SERVICES,
          ]}
          displayError={false}>
          <AlertDialogComponent
            actionButtonText="Remove"
            variantName="destructive"
            AlertTitle="Remove organization"
            triggerElement={
              <Button
                variant="ghost"
                aria-label="Delete Organization from the service">
                <DeleteIcon className="h-4 w-4" />
              </Button>
            }
            onClickContinue={() =>
              onRemoveOrganization(selectedSubscription?.id ?? '')
            }>
            <div>
              Are you sure you want to delete this organization{' '}
              <span className="font-bold">
                {selectedSubscription?.organization_name}
              </span>{' '}
              from this service ? This action cannot be undone.
            </div>
          </AlertDialogComponent>
        </GuardCapacityComponent>
      </div>
      <div className="flex gap-s flex-wrap">
        <DataTableHeadBarOptions />
        <GuardCapacityComponent
          capacityRestriction={[
            RESTRICTION.CAPABILITY_BYPASS,
            RESTRICTION.CAPABILITY_BCK_MANAGE_SERVICES,
          ]}>
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
            subscriptionId={selectedSubscription?.id ?? ''}
            trigger={
              useGranted('BYPASS') && (
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
        </GuardCapacityComponent>
        <GuardCapacityComponent
          capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}
          displayError={false}>
          <ServiceSlugAddOrgaFormSheet
            open={openSheetAddOrga}
            setOpen={setOpenSheetAddOrga}
            insertedOrganization={() =>
              loadQuery(
                { service_id: serviceId },
                { fetchPolicy: 'network-only' }
              )
            }
            connectionId=""
            serviceId={serviceId}
            trigger={
              <Button
                className="text-nowrap"
                variant="outline"
                aria-label="Add organization">
                Add organization
              </Button>
            }
          />
        </GuardCapacityComponent>
      </div>
    </div>
  );
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="pb-s">{queryDataService.serviceById?.name}</h1>
      <div className="pb-s">{queryDataService.serviceById?.description}</div>
      <GuardCapacityComponent
        capacityRestriction={[
          RESTRICTION.CAPABILITY_BYPASS,
          RESTRICTION.CAPABILITY_BCK_MANAGE_SERVICES,
        ]}>
        <ServiceUserServiceSlug
          subscriptionId={selectedSubscription?.id}
          data={
            selectedSubscription?.user_service as userService_fragment$data[]
          }
          setOpenSheet={setOpenSheet}
          setCurrentUser={setCurrentUser}
          toolbar={toolbar}
          loadQuery={() =>
            loadQuery(
              { service_id: serviceId },
              { fetchPolicy: 'network-only' }
            )
          }
        />
      </GuardCapacityComponent>
    </>
  );
};

export default ServiceSlug;
