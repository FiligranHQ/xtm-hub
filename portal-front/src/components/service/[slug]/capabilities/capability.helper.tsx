import { serviceByIdWithSubscriptionsQuery$data } from '../../../../../__generated__/serviceByIdWithSubscriptionsQuery.graphql';

export enum GenericCapabilityName {
  ManageAccess = 'MANAGE_ACCESS',
}

export function hasGenericServiceCapa(
  capabilityName: string,
  queryData: serviceByIdWithSubscriptionsQuery$data,
  currentUserId: string | undefined
): boolean {
  if (
    !currentUserId ||
    !queryData?.serviceInstanceByIdWithSubscriptions?.subscriptions
  )
    return false;
  return queryData.serviceInstanceByIdWithSubscriptions.subscriptions.some(
    (subscription) => {
      const userService = subscription?.user_service?.find(
        (userService) => userService?.user?.id === currentUserId
      );
      if (!userService) return false;

      return userService.generic_service_capability?.some(
        (capability) => capability?.service_capability_name === capabilityName
      );
    }
  );
}
