'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, Button } from 'filigran-ui/servers';
import Link from 'next/link';
import { CourseOfActionIcon } from 'filigran-icon';
import GuardCapacityComponent from '@/components/admin-guard';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import {
  userServiceOwnedFragment,
  UserServiceOwnedQuery,
} from '@/components/service/user_service.graphql';
import { userServiceOwnedQuery } from '../../../../__generated__/userServiceOwnedQuery.graphql';
import { userServiceOwnedUser$key } from '../../../../__generated__/userServiceOwnedUser.graphql';
import { userServicesOwned_fragment$data } from '../../../../__generated__/userServicesOwned_fragment.graphql';
import { EmptyServices } from '@/components/service/home/empty-services';
import { OwnedServicesList } from '@/components/service/home/owned-services-list';

const columns: ColumnDef<userServicesOwned_fragment$data>[] = [
  {
    id: 'service_name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          {row.original.subscription?.service?.name}
        </div>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return (
        <Badge
          variant={
            row.original?.subscription?.status === 'REQUESTED'
              ? 'destructive'
              : 'secondary'
          }>
          {row.original?.subscription?.status}
        </Badge>
      );
    },
  },
  {
    id: 'service_type',
    size: 30,
    header: 'Type',
    cell: ({ row }) => {
      return (
        <Badge className={'cursor-default'}>
          {row.original?.subscription?.service?.type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'subscription.service.provider',
    id: 'service_provider',
    size: 30,
    header: 'Provider',
  },
  {
    size: 300,
    accessorKey: 'subscription.service.description',
    id: 'service_description',
    header: 'Description',
  },
  {
    id: 'action',
    size: 30,
    enableHiding: false,
    enableSorting: false,
    enableResizing: false,
    cell: ({ row }) => {
      return (
        <>
          {row.original?.subscription?.status === 'ACCEPTED' &&
          row.original.service_capability?.some(
            (service_capability) =>
              service_capability?.service_capability_name === 'ACCESS_SERVICE'
          ) ? (
            <>
              <GuardCapacityComponent
                capacityRestriction={['FRT_ACCESS_SERVICES']}
                displayError={false}>
                {row.original?.subscription?.service?.links?.map((link) => (
                  <Button
                    asChild
                    key={link?.id}
                    className="mt-2 w-3/4">
                    <Link
                      href={link?.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer nofollow">
                      {link?.name}
                    </Link>
                  </Button>
                ))}
              </GuardCapacityComponent>

              {row.original.service_capability?.some(
                (service_capability) =>
                  service_capability?.service_capability_name ===
                  'MANAGE_ACCESS'
              ) ? (
                <GuardCapacityComponent
                  capacityRestriction={['BCK_MANAGE_SERVICES']}
                  displayError={false}>
                  <Button
                    asChild
                    className="mt-2 w-3/4">
                    <Link
                      href={`/admin/service/${row.original?.subscription?.service?.id}`}>
                      <CourseOfActionIcon className="mr-2 h-5 w-5" />
                      Manage
                    </Link>
                  </Button>{' '}
                </GuardCapacityComponent>
              ) : (
                <></>
              )}
            </>
          ) : (
            <></>
          )}
        </>
      );
    },
  },
];

interface OwnedServicesProps {
  queryRef: PreloadedQuery<userServiceOwnedQuery>;
}

const OwnedServices: React.FunctionComponent<OwnedServicesProps> = ({
  queryRef,
}) => {
  const queryData = usePreloadedQuery<userServiceOwnedQuery>(
    UserServiceOwnedQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<
    userServiceOwnedQuery,
    userServiceOwnedUser$key
  >(userServiceOwnedFragment, queryData);

  const ownedServices: userServicesOwned_fragment$data[] =
    data.userServiceOwned?.edges.map(
      (userService) => userService.node
    ) as unknown as userServicesOwned_fragment$data[];

  return (
    <>
      {ownedServices.length > 0 ? (
        <OwnedServicesList services={ownedServices} />
      ) : (
        <EmptyServices />
      )}
    </>
  );
};

export default OwnedServices;
