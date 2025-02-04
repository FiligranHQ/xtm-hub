import { serviceByIdWithSubscriptionsQuery$data } from '@generated/serviceByIdWithSubscriptionsQuery.graphql';

export enum GenericCapabilityName {
  ManageAccess = 'MANAGE_ACCESS',
  Access = 'ACCESS',
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

      return (
        userService.user_service_capability?.some(
          (user_service_capa) =>
            user_service_capa?.generic_service_capability?.name ===
            capabilityName
        ) ?? false
      );
    }
  );
}
