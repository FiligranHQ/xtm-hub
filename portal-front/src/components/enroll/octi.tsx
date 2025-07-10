import { EnrollOCTIInstance } from '@/components/enroll/enroll.graphql';
import { EnrollOrganizationForm } from '@/components/enroll/form/organization';
import { isEnrollmentPossible } from '@/components/enroll/helper';
import { canEnrollOCTIInstance } from '@/components/enroll/service';
import { EnrollStateResult } from '@/components/enroll/state/result';
import { enrollOCTIInstanceMutation } from '@generated/enrollOCTIInstanceMutation.graphql';
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

export const EnrollOCTI: React.FC<Props> = ({
  queryRef,
  platformId,
  platformUrl,
  platformTitle,
}) => {
  const t = useTranslations();

  const userOrganizationsPreloadedQuery =
    usePreloadedQuery<organizationListUserOrganizationsQuery>(
      OrganizationListUserOrganizationsQueryGraphql,
      queryRef
    );

  const [isSuccess, setIsSuccess] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>();
  const enrollmentState = canEnrollOCTIInstance({ organizationId, platformId });
  const [enrollInstance] =
    useMutation<enrollOCTIInstanceMutation>(EnrollOCTIInstance);

  const cancel = () => {
    window.opener.postMessage({ action: 'cancel' }, '*');
  };

  useEffect(() => {
    if (enrollmentState && isEnrollmentPossible(enrollmentState)) {
      enroll();
    }
  }, [enrollmentState]);

  const enroll = () => {
    if (!organizationId) {
      return;
    }

    enrollInstance({
      variables: {
        input: { organizationId, platformId, platformTitle, platformUrl },
      },
      onCompleted: (response) => {
        const token = response.enrollOCTIInstance.token;
        setIsSuccess(true);
        window.opener.postMessage(
          {
            action: 'enroll',
            token,
          },
          '*'
        );
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
    <EnrollStateResult
      isSuccess={isSuccess}
      state={enrollmentState}
      organizationId={organizationId}
      cancel={cancel}
      confirm={enroll}
    />
  ) : (
    <EnrollOrganizationForm
      cancel={cancel}
      confirm={setOrganizationId}
      organizations={userOrganizationsPreloadedQuery.userOrganizations}
    />
  );
};
