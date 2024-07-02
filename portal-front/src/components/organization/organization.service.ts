import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import {
  OrderingMode,
  OrganizationOrdering,
  organizationSelectQuery,
} from '../../../__generated__/organizationSelectQuery.graphql';
import {
  organizationFetch,
  organizationsFragment,
} from '@/components/organization/organization.graphql';
import { organizationList_organizations$key } from '../../../__generated__/organizationList_organizations.graphql';

export const getOrganizations = (
  count: number = 50,
  orderBy: OrganizationOrdering = 'name',
  orderMode: OrderingMode = 'asc'
) => {
  const organizationData = useLazyLoadQuery<organizationSelectQuery>(
    organizationFetch,
    {
      count,
      orderBy,
      orderMode,
    }
  );
  return useRefetchableFragment<
    organizationSelectQuery,
    organizationList_organizations$key
  >(organizationsFragment, organizationData);
};
