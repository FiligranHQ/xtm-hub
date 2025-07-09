import { EnrollOCTIInstance } from '@/components/enroll/enroll.graphql';
import { EnrollOrganizationForm } from '@/components/enroll/form/organization';
import { isEnrollmentPossible } from '@/components/enroll/helper';
import { EnrollStateSwitch } from '@/components/enroll/state/switch';
import OrganizationListUserOrganizationsQueryGraphql, {
  organizationListUserOrganizationsQuery,
} from '@generated/organizationListUserOrganizationsQuery.graphql';
import { toast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { PreloadedQuery, useMutation, usePreloadedQuery } from 'react-relay';

interface Props {
  platformId: string;
  platformUrl: string;
  platformTitle: string;
  queryRef: PreloadedQuery<organizationListUserOrganizationsQuery>;
}

export interface EnrollmentState {
  status: 'enrolled' | 'unenrolled' | 'never_enrolled';
  sameOrganization?: boolean;
  allowed: boolean;
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

  const [organizationId, setOrganizationId] = useState<string>();
  const [enrollmentState, setEnrollmentState] = useState<
    EnrollmentState | undefined
  >();
  const [enrollInstance] = useMutation(EnrollOCTIInstance);

  const cancel = () => {
    window.postMessage('cancel');
  };

  const chooseOrganization = (organizationId: string) => {
    setOrganizationId(organizationId);
    setEnrollmentState({
      status: 'enrolled',
      allowed: false,
      sameOrganization: false,
    });
  };

  useEffect(() => {
    if (enrollmentState && isEnrollmentPossible(enrollmentState)) {
      enroll();
    }
  }, [enrollmentState]);

  const enroll = () => {
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
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

  return enrollmentState ? (
    <EnrollStateSwitch
      state={enrollmentState}
      organizationId={organizationId}
      cancel={cancel}
      confirm={enroll}
    />
  ) : (
    <EnrollOrganizationForm
      cancel={cancel}
      confirm={chooseOrganization}
      organizations={query.userOrganizations}
    />
  );
};
