import { rolePortalFetch } from '@/components/organization/role.graphql';
import { rolePortalQuery } from '@generated/rolePortalQuery.graphql';
import { useLazyLoadQuery } from 'react-relay';

export const getRolesPortal = () => {
  return useLazyLoadQuery<rolePortalQuery>(rolePortalFetch, {});
};
