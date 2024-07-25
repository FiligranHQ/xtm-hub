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

export const getOrganizations = () => {
  let count = Number(localStorage.getItem('countOrganizationList'));
  if (!count) {
    localStorage.setItem('countOrganizationList', '50');
    count = 50;
  }
  let orderMode = localStorage.getItem(
    'orderModeOrganizationList'
  ) as OrderingMode;
  if (!orderMode) {
    localStorage.setItem('orderModeOrganizationList', 'asc');
    orderMode = 'asc';
  }

  let orderBy = localStorage.getItem(
    'orderByOrganizationList'
  ) as OrganizationOrdering;
  if (!orderBy) {
    localStorage.setItem('orderByOrganizationList', 'name');
    orderBy = 'name';
  }

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
