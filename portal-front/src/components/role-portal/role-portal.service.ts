import { useLazyLoadQuery } from 'react-relay';
import { rolePortalFetch } from '@/components/organization/role.graphql';
import { rolePortalQuery } from '../../../__generated__/rolePortalQuery.graphql';

export const GetRolesPortal = () => {
  return useLazyLoadQuery<rolePortalQuery>(rolePortalFetch, {});
};
