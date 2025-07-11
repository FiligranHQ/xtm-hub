import { EnrollOCTIInstance } from '@/components/enroll/enroll.graphql';
import { EnrollOrganizationForm } from '@/components/enroll/form/organization';
import { isEnrollmentPossible } from '@/components/enroll/helper';
import { canEnrollOCTIInstance } from '@/components/enroll/service';
import { EnrollStateResult } from '@/components/enroll/state/result';
import enrollOCTIFragmentGraphql, {
  enrollOCTIFragment$key,
} from '@generated/enrollOCTIFragment.graphql';
import { enrollOCTIInstanceMutation } from '@generated/enrollOCTIInstanceMutation.graphql';
import OrganizationListUserOrganizationsQueryGraphql, {
  organizationListUserOrganizationsQuery,
} from '@generated/organizationListUserOrganizationsQuery.graphql';
import { toast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import {
  PreloadedQuery,
  useFragment,
  useMutation,
  usePreloadedQuery,
} from 'react-relay';

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

  const [enrollFragmentRef, setEnrollFragmentRef] =
    useState<enrollOCTIFragment$key | null>(null);
  const enrollDataResponse = useFragment<enrollOCTIFragment$key>(
    enrollOCTIFragmentGraphql,
    enrollFragmentRef
  );

  const cancel = () => {
    window.opener.postMessage({ action: 'cancel' }, '*');
  };

  useEffect(() => {
    if (!enrollDataResponse?.token) {
      return;
    }

    setEnrollmentStatus('succeeded');
    window.opener.postMessage(
      {
        action: 'enroll',
        token: enrollDataResponse.token,
      },
      '*'
    );
  }, [enrollDataResponse]);

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
        setEnrollFragmentRef(response.enrollOCTIInstance);
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
