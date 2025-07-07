import { EnrollOrganizationForm } from '@/components/enroll/form/organization';
import { listUserOrganizationsFragment } from '@/components/organization/organization.graphql';
import { organizationItem_fragment$data } from '@generated/organizationItem_fragment.graphql';
import { organizationList_userOrganizations$key } from '@generated/organizationList_userOrganizations.graphql';
import OrganizationListUserOrganizationsQuery, {
  organizationListUserOrganizationsQuery,
} from '@generated/organizationListUserOrganizationsQuery.graphql';
import React from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface Props {
  queryRef: PreloadedQuery<organizationListUserOrganizationsQuery>;
}

export const EnrollOCTI: React.FC<Props> = ({ queryRef }) => {
  const query = usePreloadedQuery<organizationListUserOrganizationsQuery>(
    OrganizationListUserOrganizationsQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<
    organizationListUserOrganizationsQuery,
    organizationList_userOrganizations$key
  >(listUserOrganizationsFragment, query);

  const organizations: Omit<
    organizationItem_fragment$data,
    ' $fragmentType'
  >[] = data.userOrganizations.edges.map(({ node }) => node);

  return <EnrollOrganizationForm organizations={organizations} />;
};
