import { useLazyLoadQuery } from 'react-relay';
import { organizationSelectQuery } from '../../../__generated__/organizationSelectQuery.graphql';
import { organizationFetch } from '@/components/organization/organization.graphql';

export const GetOrganizations = () => {
  const queryOrganizationData = useLazyLoadQuery<organizationSelectQuery>(
    organizationFetch,
    {}
  );
  return queryOrganizationData.organizations.edges;
};
