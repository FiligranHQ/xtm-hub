import {
  organizationFetch,
  organizationsFragment,
} from '@/components/organization/organization.graphql';
import { organizationList_organizations$key } from '@generated/organizationList_organizations.graphql';
import {
  OrderingMode,
  OrganizationFilter,
  OrganizationOrdering,
  organizationSelectQuery,
} from '@generated/organizationSelectQuery.graphql';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

interface OrganizationParamsQuery {
  count: number;
  orderBy: OrganizationOrdering;
  orderMode: OrderingMode;
  filter?: OrganizationFilter;
}
export const getOrganizations = ({
  count = 50,
  orderBy = 'name',
  orderMode = 'asc',
  filter,
}: Partial<OrganizationParamsQuery> = {}) => {
  const organizationData = useLazyLoadQuery<organizationSelectQuery>(
    organizationFetch,
    {
      count,
      orderBy,
      orderMode,
      filter,
    }
  );
  return useRefetchableFragment<
    organizationSelectQuery,
    organizationList_organizations$key
  >(organizationsFragment, organizationData);
};
