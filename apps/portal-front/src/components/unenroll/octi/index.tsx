import {
  CanUnenrollOCTIPlatformFragment,
  UnenrollOCTIPlatform,
} from '@/components/enroll/enroll.graphql';
import { EnrollStateLayout } from '@/components/enroll/state/layout';
import Loader from '@/components/loader';
import { UnenrollOCTIConfirm } from '@/components/unenroll/octi/confirm';
import { UnenrollOCTIMissingCapability } from '@/components/unenroll/octi/missing-capability';
import { UnenrollOCTIPlatformNotEnrolled } from '@/components/unenroll/octi/platform-not-enrolled';
import useMountingLoader from '@/hooks/useMountingLoader';
import { enrollCanUnenrollOCTIPlatformFragment$key } from '@generated/enrollCanUnenrollOCTIPlatformFragment.graphql';
import EnrollCanUnenrollOCTIPlatformQueryGraphql, {
  enrollCanUnenrollOCTIPlatformQuery,
} from '@generated/enrollCanUnenrollOCTIPlatformQuery.graphql';
import { enrollUnenrollOCTIPlatformMutation } from '@generated/enrollUnenrollOCTIPlatformMutation.graphql';
import UserListOrganizationAdministratorsQueryGraphql, {
  userListOrganizationAdministratorsQuery,
} from '@generated/userListOrganizationAdministratorsQuery.graphql';
import { toast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import {
  PreloadedQuery,
  useFragment,
  useMutation,
  usePreloadedQuery,
  useQueryLoader,
} from 'react-relay';

interface Props {
  platformId: string;
  queryRef: PreloadedQuery<enrollCanUnenrollOCTIPlatformQuery>;
}

type UnenrollmentStatus = 'idle' | 'succeeded' | 'failed';

export const UnenrollOCTI: React.FC<Props> = ({ queryRef, platformId }) => {
  const t = useTranslations();
  const canUnenrollPreloadedQuery =
    usePreloadedQuery<enrollCanUnenrollOCTIPlatformQuery>(
      EnrollCanUnenrollOCTIPlatformQueryGraphql,
      queryRef
    );

  const { isAllowed, isPlatformEnrolled, organizationId } = useFragment<enrollCanUnenrollOCTIPlatformFragment$key>(
    CanUnenrollOCTIPlatformFragment,
    canUnenrollPreloadedQuery.canUnenrollOCTIPlatform
  );

  const [
    organizationAdministratorsQueryRef,
    loadOrganizationAdministratorsQuery,
  ] = useQueryLoader<userListOrganizationAdministratorsQuery>(
    UserListOrganizationAdministratorsQueryGraphql
  );
  useMountingLoader(loadOrganizationAdministratorsQuery, {
    organizationId,
  });
  const [unenrollPlatform] =
    useMutation<enrollUnenrollOCTIPlatformMutation>(UnenrollOCTIPlatform);

  const [status, setStatus] = useState<UnenrollmentStatus>('idle');
  const cancel = () => {
    window.opener?.postMessage({ action: 'cancel' }, '*');
  };

  const confirm = () => {
    unenrollPlatform({
      variables: {
        input: {
          platformId,
        },
      },
      onCompleted: () => {
        window.opener?.postMessage({ action: 'unenroll' }, '*');
        setStatus('succeeded');
      },
      onError: (error) => {
        setStatus('failed');
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

  if (!isPlatformEnrolled) {
    return <UnenrollOCTIPlatformNotEnrolled confirm={confirm} />;
  }

  if (status === 'succeeded') {
    return (
      <EnrollStateLayout>
        <h1>{t('Unenroll.OCTI.Succeeded.Title')}</h1>
        <p>{t('Unenroll.OCTI.Succeeded.Description')}</p>
      </EnrollStateLayout>
    );
  }

  if (status === 'failed') {
    return (
      <EnrollStateLayout>
        <h1>{t('Unenroll.OCTI.Failed.Title')}</h1>
        <p>{t('Unenroll.OCTI.Failed.Description')}</p>
      </EnrollStateLayout>
    );
  }

  if (!isAllowed) {
    return organizationAdministratorsQueryRef ? (
      <UnenrollOCTIMissingCapability
        queryRef={organizationAdministratorsQueryRef}
        cancel={cancel}
      />
    ) : (
      <Loader />
    );
  }

  return organizationId ? (
    <UnenrollOCTIConfirm
      cancel={cancel}
      confirm={confirm}
      organizationId={organizationId}
    />
  ) : (
    <Loader />
  );
};
