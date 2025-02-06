import {
  AddSubscriptionMutation,
  SelfSubscribeMutation,
} from '@/components/subcription/subscription.graphql';
import { publicServiceList_services$key } from '@generated/publicServiceList_services.graphql';
import { publicServiceQuery } from '@generated/publicServiceQuery.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { subscriptionCreateMutation } from '@generated/subscriptionCreateMutation.graphql';
import { subscriptionSelfSubscribeMutation } from '@generated/subscriptionSelfSubscribeMutation.graphql';
import { userServiceOwnedQuery } from '@generated/userServiceOwnedQuery.graphql';
import { userServiceOwnedUser$key } from '@generated/userServiceOwnedUser.graphql';
import { userServicesOwned_fragment$data } from '@generated/userServicesOwned_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import {
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  useRefetchableFragment,
  useSubscription,
} from 'react-relay';
import {
  publicServiceListFragment,
  publicServiceListQuery,
} from '../../public-service.graphql';
import { JOIN_TYPE } from '../../service.const';
import { subscription } from '../../service.graphql';
import {
  userServiceOwnedFragment,
  UserServiceOwnedQuery,
} from '../../user_service.graphql';

const getOwnedServices = (queryRef: PreloadedQuery<userServiceOwnedQuery>) => {
  const queryData = usePreloadedQuery<userServiceOwnedQuery>(
    UserServiceOwnedQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<
    userServiceOwnedQuery,
    userServiceOwnedUser$key
  >(userServiceOwnedFragment, queryData);

  const ownedServices: userServicesOwned_fragment$data[] = (
    data.userServiceOwned?.edges ?? []
  ).map((userService) => userService.node as userServicesOwned_fragment$data);

  return ownedServices;
};

const getPublicServices = (
  queryRef: PreloadedQuery<publicServiceQuery>,
  onUpdate: () => void,
  handleSuccess: (message: string) => void,
  handleError: (error: Error) => void
) => {
  const t = useTranslations();

  const queryData = usePreloadedQuery<publicServiceQuery>(
    publicServiceListQuery,
    queryRef
  );
  const [data] = useRefetchableFragment<
    publicServiceQuery,
    publicServiceList_services$key
  >(publicServiceListFragment, queryData);

  const connectionID = data?.publicServiceInstances?.__id;
  const config = useMemo(
    () => ({
      variables: { connections: [connectionID] },
      subscription,
    }),
    [connectionID]
  );
  useSubscription(config);

  const [subscriptionCreate] = useMutation<subscriptionCreateMutation>(
    AddSubscriptionMutation
  );
  const [selfSubscribe] = useMutation<subscriptionSelfSubscribeMutation>(
    SelfSubscribeMutation
  );

  const subcribe = useCallback(
    (service: serviceList_fragment$data) => {
      const commitCreateSubscription = (
        status: string,
        successMessage: string
      ) => {
        subscriptionCreate({
          variables: {
            service_instance_id: service.id,
            connections: [connectionID],
          },
          onCompleted: () => {
            handleSuccess(successMessage);
            onUpdate();
          },
          onError: (error: Error) => handleError(error),
        });
      };

      const commitSelfSubscribe = () => {
        selfSubscribe({
          variables: {
            service_instance_id: service.id,
            connections: [connectionID],
          },
          onCompleted: () => {
            handleSuccess(t('Service.SubscribeSuccessful'));
            onUpdate();
          },
          onError: (error: Error) => handleError(error),
        });
      };

      if (
        service.join_type &&
        [JOIN_TYPE.JOIN_SELF, JOIN_TYPE.JOIN_AUTO].includes(service.join_type)
      ) {
        // If the subscription already exists for the current organization
        if (service.organization_subscribed) {
          // Try to self subscribe to the service
          commitSelfSubscribe();
        } else {
          // If the subscription does not exist, create a subscription
          commitCreateSubscription(
            'ACCEPTED',
            t('Service.SubscribeSuccessful')
          );
        }
      } else {
        commitCreateSubscription(
          'REQUESTED',
          t('Service.SubscriptionRequestSuccessful')
        );
      }
    },
    [connectionID]
  );

  const publicServices: serviceList_fragment$data[] =
    data.publicServiceInstances.edges.map(
      ({ node }) => node as serviceList_fragment$data
    );

  return {
    publicServices,
    subcribe,
  };
};

export const useServiceQueries = (
  queryRefUserServiceOwned: PreloadedQuery<userServiceOwnedQuery>,
  queryRefPublicService: PreloadedQuery<publicServiceQuery>,
  onUpdate: () => void,
  handleSuccess: (message: string) => void,
  handleError: (error: Error) => void
) => {
  const { publicServices, subcribe } = getPublicServices(
    queryRefPublicService,
    onUpdate,
    handleSuccess,
    handleError
  );

  return {
    ownedServices: getOwnedServices(queryRefUserServiceOwned),
    publicServices,
    subcribe,
  };
};
