import {
  organizationFetch,
  organizationItemFragment,
  organizationQuery,
  organizationsFragment,
} from '@/components/organization/organization.graphql';
import { OrganizationOrderingEnum } from '@generated/models/OrganizationOrdering.enum';
import { organizationItem_fragment$key } from '@generated/organizationItem_fragment.graphql';
import { organizationList_organizations$key } from '@generated/organizationList_organizations.graphql';
import { organizationQuery as organizationQueryGraphql } from '@generated/organizationQuery.graphql';
import {
  OrderingMode,
  organizationSelectQuery,
} from '@generated/organizationSelectQuery.graphql';
import {
  useFragment,
  useLazyLoadQuery,
  useRefetchableFragment,
} from 'react-relay';

interface OrganizationParamsQuery {
  count: number;
  orderBy: OrganizationOrderingEnum;
  orderMode: OrderingMode;
  searchTerm?: string;
}

export const getOrganization = (organizationId: string) => {
  const organizationData = useLazyLoadQuery<organizationQueryGraphql>(
    organizationQuery,
    { id: organizationId }
  );

  return useFragment<organizationItem_fragment$key>(
    organizationItemFragment,
    organizationData.organization
  );
};

export const getOrganizations = ({
  searchTerm = '',
  count = 50,
  orderBy = OrganizationOrderingEnum.NAME,
  orderMode = 'asc',
}: Partial<OrganizationParamsQuery> = {}) => {
  const organizationData = useLazyLoadQuery<organizationSelectQuery>(
    organizationFetch,
    {
      searchTerm,
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
