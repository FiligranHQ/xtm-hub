import { EnrollOCTIInstance } from '@/components/enroll/enroll.graphql';
import { EnrollOrganizationForm } from '@/components/enroll/form/organization';
import { listUserOrganizationsFragment } from '@/components/organization/organization.graphql';
import { organizationItem_fragment$data } from '@generated/organizationItem_fragment.graphql';
import { organizationList_userOrganizations$key } from '@generated/organizationList_userOrganizations.graphql';
import OrganizationListUserOrganizationsQuery, {
  organizationListUserOrganizationsQuery,
} from '@generated/organizationListUserOrganizationsQuery.graphql';
import { toast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import { redirect } from 'next/navigation';
import React from 'react';
import {
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface Props {
  platformId: string;
  platformUrl: string;
  platformTitle: string;
  queryRef: PreloadedQuery<organizationListUserOrganizationsQuery>;
}

export const EnrollOCTI: React.FC<Props> = ({
  queryRef,
  platformId,
  platformUrl,
  platformTitle,
}) => {
  const t = useTranslations();

  const query = usePreloadedQuery<organizationListUserOrganizationsQuery>(
    OrganizationListUserOrganizationsQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<
    organizationListUserOrganizationsQuery,
    organizationList_userOrganizations$key
  >(listUserOrganizationsFragment, query);

  const [enrollInstance] = useMutation(EnrollOCTIInstance);

  const organizations: Omit<
    organizationItem_fragment$data,
    ' $fragmentType'
  >[] = data.userOrganizations.edges.map(({ node }) => node);

  const cancel = () => {
    window.postMessage('cancel');
  };

  const confirm = (organizationId: string) => {
    enrollInstance({
      variables: {
        input: { organizationId, platformId, platformTitle, platformUrl },
      },
      onCompleted: () => {
        toast({
          title: t('Utils.Success'),
        });
      },
      onError: (error) => {
        if (error.message.includes('Not authorized')) {
          redirect(
            `/enroll/error/octi/capability?organization_id=${organizationId}`
          );
        } else {
          toast({
            variant: 'destructive',
            title: t('Utils.Error'),
            description: t(`Error.Server.${error.message}`),
          });
        }
      },
    });
  };

  return (
    <EnrollOrganizationForm
      cancel={cancel}
      confirm={confirm}
      organizations={organizations}
    />
  );
};
