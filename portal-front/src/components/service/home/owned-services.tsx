'use client';

import * as React from 'react';
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
