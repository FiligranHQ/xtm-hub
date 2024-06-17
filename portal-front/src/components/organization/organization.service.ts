import { useLazyLoadQuery } from 'react-relay';
import {
  OrderingMode,
  OrganizationOrdering,
  organizationSelectQuery,
} from '../../../__generated__/organizationSelectQuery.graphql';
import { organizationFetch } from '@/components/organization/organization.graphql';

export const getOrganizations = (
  count: number = 10,
  orderBy: OrganizationOrdering = 'name',
  orderMode: OrderingMode = 'asc'
) => {
  return useLazyLoadQuery<organizationSelectQuery>(organizationFetch, {
    count,
    orderBy,
    orderMode,
  });
};
