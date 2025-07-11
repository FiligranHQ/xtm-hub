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
  platform: {
    id: string;
    url: string;
    title: string;
  };
  queryRef: PreloadedQuery<organizationListUserOrganizationsQuery>;
}

export type EnrollmentStatus = 'idle' | 'succeeded' | 'failed';

export const EnrollOCTI: React.FC<Props> = ({ queryRef, platform }) => {
  const t = useTranslations();

  const userOrganizationsPreloadedQuery =
    usePreloadedQuery<organizationListUserOrganizationsQuery>(
      OrganizationListUserOrganizationsQueryGraphql,
      queryRef
    );

  const [enrollmentStatus, setEnrollmentStatus] =
    useState<EnrollmentStatus>('idle');
  const [organizationId, setOrganizationId] = useState<string>();
  const canEnrollState = canEnrollOCTIInstance({
    organizationId,
    platformId: platform.id,
  });
  const [enrollInstance] =
    useMutation<enrollOCTIInstanceMutation>(EnrollOCTIInstance);

  const cancel = () => {
    window.opener.postMessage({ action: 'cancel' }, '*');
  };

  useEffect(() => {
    if (canEnrollState && isEnrollmentPossible(canEnrollState)) {
      enroll();
    }
  }, [canEnrollState]);

  const enroll = () => {
    if (!organizationId) {
      return;
    }

    enrollInstance({
      variables: {
        input: { organizationId, platform },
      },
      onCompleted: (response) => {
        const token = response.enrollOCTIInstance.token;
        setEnrollmentStatus('succeeded');
        window.opener.postMessage(
          {
            action: 'enroll',
            token,
          },
          '*'
        );
      },
      onError: (error) => {
        setEnrollmentStatus('failed');
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

  return canEnrollState ? (
    <EnrollStateResult
      enrollmentStatus={enrollmentStatus}
      canEnrollState={canEnrollState}
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
