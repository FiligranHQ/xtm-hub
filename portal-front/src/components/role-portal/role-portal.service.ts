import { rolePortalFetch } from '@/components/organization/role.graphql';
import { useLazyLoadQuery } from 'react-relay';
import { rolePortalQuery } from '../../../__generated__/rolePortalQuery.graphql';

export const getRolesPortal = () => {
  return useLazyLoadQuery<rolePortalQuery>(rolePortalFetch, {});
};
