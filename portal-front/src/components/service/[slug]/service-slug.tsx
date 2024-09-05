import {
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';
import {
  DataTable,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from 'filigran-ui/clients';
import * as React from 'react';
import { FunctionComponent, useMemo, useState } from 'react';
import { Badge, Button } from 'filigran-ui/servers';
import {
  AddIcon,
  ChevronIcon,
  DeleteIcon,
  LittleArrowIcon,
} from 'filigran-icon';
import { userServiceDeleteMutation } from '../../../../__generated__/userServiceDeleteMutation.graphql';
import { UserServiceDeleteMutation } from '@/components/service/user_service.graphql';
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
import { ServiceSlugAddOrgaFormSheet } from '@/components/service/[slug]/service-slug-add-orga-form-sheet';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import AcceptCommunity from '@/components/service/[slug]/accept-community';
import { subscriptionByService_fragment$data } from '../../../../__generated__/subscriptionByService_fragment.graphql';
import { ColumnDef } from '@tanstack/react-table';
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

  const [commitUserServiceDeletingMutation] =
    useMutation<userServiceDeleteMutation>(UserServiceDeleteMutation);

  const { toast } = useToast();
  const deleteCurrentUser = (userService: any) => {
    commitUserServiceDeletingMutation({
      variables: {
        input: {
          email: userService.user.email,
          subscriptionId: '',
        },
      },
      onCompleted() {
        loadQuery({ service_id: serviceId }, { fetchPolicy: 'network-only' });
      },
    });
  };

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

  const columns: ColumnDef<userService_fragment$data>[] = useMemo(
    () => [
      {
        accessorKey: 'user.first_name',
        id: 'first_name',
        header: 'First Name',
      },
      {
        accessorKey: 'user.last_name',
        id: 'last_name',
        header: 'Last Name',
      },
      {
        accessorKey: 'user.email',
        id: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'service_capability_names',
        id: 'service_capability_names',
        header: 'Capabilities',
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <>
              {row.original?.service_capability?.map((service_capa) => (
                <Badge
                  key={service_capa?.id}
                  className="mb-2 mr-2 mt-2">
                  {service_capa?.service_capability_name}
                </Badge>
              ))}
            </>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          return (
            <>
              <Button
                variant={'ghost'}
                onClick={() => {
                  setCurrentUser(row.original);
                  setOpenSheet(true);
                }}>
                <ChevronIcon className="h-4 w-4"></ChevronIcon>
              </Button>
              <Button
                variant={'ghost'}
                onClick={() => {
                  deleteCurrentUser(row.original);
                }}>
                <LittleArrowIcon className="h-4 w-4"></LittleArrowIcon>
              </Button>
            </>
          );
        },
      },
    ],
    []
  );

  return (
    <>
      <h2>Community {queryDataService.serviceById?.name}</h2>
      <Badge className={'cursor-default'}>
        {queryData.subscriptionsByServiceId
          ? queryData.subscriptionsByServiceId[0]?.status
          : ''}
      </Badge>
      <div>{queryDataService.serviceById?.description}</div>
      <GuardCapacityComponent
        capacityRestriction={[
          RESTRICTION.CAPABILITY_BYPASS,
          RESTRICTION.CAPABILITY_BCK_MANAGE_SERVICES,
          RESTRICTION.CAPABILITY_BCK_MANAGE_COMMUNITIES,
        ]}>
        <AcceptCommunity
          insertedUserServices={() =>
            loadQuery(
              { service_id: serviceId },
              { fetchPolicy: 'network-only' }
            )
          }
          serviceId={serviceId}
          subscription={
            queryData
              .subscriptionsByServiceId?.[0] as subscriptionByService_fragment$data
          }></AcceptCommunity>
        <div className="flex justify-end gap-m pb-s">
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
              <TriggerButton
                disabled={
                  queryData.subscriptionsByServiceId?.[0]?.status ===
                    'REQUESTED' ?? false
                }
                onClick={() => setCurrentUser({})}
                label="Invite user"
              />
            }
          />
        </div>

        <Tabs
          defaultValue={
            queryData.subscriptionsByServiceId?.[0]?.user_service?.[0]?.user
              ?.organization.name ?? ''
          }>
          <TabsList>
            {queryData.subscriptionsByServiceId?.map((subscription) => {
              return (
                <TabsTrigger
                  key={
                    subscription?.user_service?.[0]?.user?.organization?.name
                  }
                  value={
                    subscription?.user_service?.[0]?.user?.organization.name ??
                    ''
                  }
                  className="mb-5 min-h-[55px] data-[state=active]:bg-white">
                  {subscription?.user_service?.[0]?.user?.organization.name}{' '}
                  (billing: {subscription?.billing} % )
                  {subscription?.billing === 0 ? (
                    <AlertDialogComponent
                      actionButtonText={'Remove'}
                      variantName={'destructive'}
                      AlertTitle={'Remove organization'}
                      triggerElement={
                        <Button
                          className="ml-2"
                          variant="ghost"
                          aria-label="Delete Organization from Community">
                          <DeleteIcon className="h-4 w-4" />
                        </Button>
                      }
                      onClickContinue={() =>
                        onRemoveOrganization(subscription?.id ?? '')
                      }>
                      Are you sure you want to delete this organization{' '}
                      {subscription?.user_service?.[0]?.user?.organization.name}{' '}
                      from this community? This action can not be undone.
                    </AlertDialogComponent>
                  ) : (
                    <></>
                  )}
                </TabsTrigger>
              );
            })}
            <ServiceSlugAddOrgaFormSheet
              open={openSheetAddOrga}
              setOpen={setOpenSheetAddOrga}
              insertedOrganization={() =>
                loadQuery(
                  { service_id: serviceId },
                  { fetchPolicy: 'network-only' }
                )
              }
              connectionId={''}
              serviceId={queryDataService.serviceById?.id ?? ''}
              trigger={
                <Button
                  className="mb-5 min-h-[55px]"
                  aria-label="Add organization">
                  <AddIcon className="mr-2 h-4 w-4" />
                  Add organization
                </Button>
              }
            />
          </TabsList>
          {queryData.subscriptionsByServiceId?.map((subscription) => {
            return (
              <TabsContent
                key={subscription?.user_service?.[0]?.user?.organization.name}
                value={
                  subscription?.user_service?.[0]?.user?.organization.name ?? ''
                }
                className="ml-1 mt-0 bg-white p-10">
                <DataTable
                  columns={columns}
                  data={subscription?.user_service ?? []}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </GuardCapacityComponent>
    </>
  );
};

export default ServiceSlug;