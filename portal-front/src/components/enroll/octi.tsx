import { EnrollOCTIInstance } from '@/components/enroll/enroll.graphql';
import { EnrollOrganizationForm } from '@/components/enroll/form/organization';
import OrganizationListUserOrganizationsQueryGraphql, {
  organizationListUserOrganizationsQuery,
} from '@generated/organizationListUserOrganizationsQuery.graphql';
import { toast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import { redirect } from 'next/navigation';
import React from 'react';
import { PreloadedQuery, useMutation, usePreloadedQuery } from 'react-relay';

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
    OrganizationListUserOrganizationsQueryGraphql,
    queryRef
  );

  const [enrollInstance] = useMutation(EnrollOCTIInstance);

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
      organizations={query.userOrganizations}
    />
  );
};
