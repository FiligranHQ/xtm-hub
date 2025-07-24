import { EnrollOCTIPlatform } from '@/components/enroll/enroll.graphql';
import { EnrollOrganizationForm } from '@/components/enroll/form/organization';
import { isEnrollmentPossible } from '@/components/enroll/helper';
import { useCanEnrollOCTIPlatform } from '@/components/enroll/service';
import { EnrollStateResult } from '@/components/enroll/state/result';
import enrollOCTIFragmentGraphql, {
  enrollOCTIFragment$key,
} from '@generated/enrollOCTIFragment.graphql';
import { OCTIPlatformContract } from '@generated/enrollOCTIPlatformFragment.graphql';
import { enrollOCTIPlatformMutation } from '@generated/enrollOCTIPlatformMutation.graphql';
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
    contract: OCTIPlatformContract;
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
  const canEnrollState = useCanEnrollOCTIPlatform({
    organizationId,
    platformId: platform.id,
  });
  const [enrollPlatform] =
    useMutation<enrollOCTIPlatformMutation>(EnrollOCTIPlatform);

  const [enrollFragmentRef, setEnrollFragmentRef] =
    useState<enrollOCTIFragment$key | null>(null);
  const enrollDataResponse = useFragment<enrollOCTIFragment$key>(
    enrollOCTIFragmentGraphql,
    enrollFragmentRef
  );

  const cancel = () => {
    window.opener?.postMessage({ action: 'cancel' }, '*');
  };

  useEffect(() => {
    if (!enrollDataResponse?.token) {
      return;
    }

    setEnrollmentStatus('succeeded');
    window.opener?.postMessage(
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

    enrollPlatform({
      variables: {
        input: { organizationId, platform },
      },
      onCompleted: (response) => {
        setEnrollFragmentRef(response.enrollOCTIPlatform);
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
