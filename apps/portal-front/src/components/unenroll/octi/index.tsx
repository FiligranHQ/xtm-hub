import {
  CanUnenrollOCTIInstanceFragment,
  UnenrollOCTIInstance,
} from '@/components/enroll/enroll.graphql';
import { EnrollStateLayout } from '@/components/enroll/state/layout';
import Loader from '@/components/loader';
import { UnenrollOCTIConfirm } from '@/components/unenroll/octi/confirm';
import { UnenrollOCTIInstanceNotEnrolled } from '@/components/unenroll/octi/instance-not-enrolled';
import { UnenrollOCTIMissingCapability } from '@/components/unenroll/octi/missing-capability';
import useMountingLoader from '@/hooks/useMountingLoader';
import { enrollCanUnenrollOCTIInstanceFragment$key } from '@generated/enrollCanUnenrollOCTIInstanceFragment.graphql';
import EnrollCanUnenrollOCTIInstanceQueryGraphql, {
  enrollCanUnenrollOCTIInstanceQuery,
} from '@generated/enrollCanUnenrollOCTIInstanceQuery.graphql';
import { enrollUnenrollOCTIInstanceMutation } from '@generated/enrollUnenrollOCTIInstanceMutation.graphql';
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
  queryRef: PreloadedQuery<enrollCanUnenrollOCTIInstanceQuery>;
}

type UnenrollmentStatus = 'idle' | 'succeeded' | 'failed';

export const UnenrollOCTI: React.FC<Props> = ({ queryRef, platformId }) => {
  const t = useTranslations();
  const canUnenrollPreloadedQuery =
    usePreloadedQuery<enrollCanUnenrollOCTIInstanceQuery>(
      EnrollCanUnenrollOCTIInstanceQueryGraphql,
      queryRef
    );

  const { instance } = useFragment<enrollCanUnenrollOCTIInstanceFragment$key>(
    CanUnenrollOCTIInstanceFragment,
    canUnenrollPreloadedQuery.canUnenrollOCTIInstance
  );

  const [
    organizationAdministratorsQueryRef,
    loadOrganizationAdministratorsQuery,
  ] = useQueryLoader<userListOrganizationAdministratorsQuery>(
    UserListOrganizationAdministratorsQueryGraphql
  );
  useMountingLoader(loadOrganizationAdministratorsQuery, {
    organizationId: instance?.organizationId,
  });
  const [unenrollInstance] =
    useMutation<enrollUnenrollOCTIInstanceMutation>(UnenrollOCTIInstance);

  const [status, setStatus] = useState<UnenrollmentStatus>('idle');
  const cancel = () => {
    window.opener?.postMessage({ action: 'cancel' }, '*');
  };

  const confirm = () => {
    unenrollInstance({
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

  if (!instance) {
    return <UnenrollOCTIInstanceNotEnrolled confirm={confirm} />;
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

  if (!instance?.isAllowed) {
    return organizationAdministratorsQueryRef ? (
      <UnenrollOCTIMissingCapability
        queryRef={organizationAdministratorsQueryRef}
        cancel={cancel}
      />
    ) : (
      <Loader />
    );
  }

  return (
    <UnenrollOCTIConfirm
      cancel={cancel}
      confirm={confirm}
      organizationId={instance?.organizationId}
    />
  );
};
