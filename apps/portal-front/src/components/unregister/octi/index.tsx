import Loader from '@/components/loader';
import {
  CanUnenrollOCTIPlatformFragment,
  UnenrollOCTIPlatform,
} from '@/components/register/register.graphql';
import { EnrollStateLayout } from '@/components/register/state/layout';
import { UnenrollOCTIConfirm } from '@/components/unregister/octi/confirm';
import { UnenrollOCTIMissingCapability } from '@/components/unregister/octi/missing-capability';
import { UnenrollOCTIPlatformNotEnrolled } from '@/components/unregister/octi/platform-not-registered';
import { enrollCanUnenrollOCTIPlatformFragment$key } from '@generated/enrollCanUnenrollOCTIPlatformFragment.graphql';
import EnrollCanUnenrollOCTIPlatformQueryGraphql, {
  enrollCanUnenrollOCTIPlatformQuery,
} from '@generated/enrollCanUnenrollOCTIPlatformQuery.graphql';
import { enrollUnenrollOCTIPlatformMutation } from '@generated/enrollUnenrollOCTIPlatformMutation.graphql';
import { toast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import {
  PreloadedQuery,
  useFragment,
  useMutation,
  usePreloadedQuery,
} from 'react-relay';

interface Props {
  platformId: string;
  queryRef: PreloadedQuery<enrollCanUnenrollOCTIPlatformQuery>;
}

type UnregistrationStatus = 'idle' | 'succeeded' | 'failed';

export const UnenrollOCTI: React.FC<Props> = ({ queryRef, platformId }) => {
  const t = useTranslations();
  const canUnenrollPreloadedQuery =
    usePreloadedQuery<enrollCanUnenrollOCTIPlatformQuery>(
      EnrollCanUnenrollOCTIPlatformQueryGraphql,
      queryRef
    );

  const { isAllowed, isPlatformEnrolled, isInOrganization, organizationId } =
    useFragment<enrollCanUnenrollOCTIPlatformFragment$key>(
      CanUnenrollOCTIPlatformFragment,
      canUnenrollPreloadedQuery.canUnenrollOCTIPlatform
    );

  const [unenrollPlatform] =
    useMutation<enrollUnenrollOCTIPlatformMutation>(UnenrollOCTIPlatform);

  const [status, setStatus] = useState<UnregistrationStatus>('idle');
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

  if (!isPlatformEnrolled) {
    return <UnenrollOCTIPlatformNotEnrolled confirm={confirm} />;
  }

  if (!isAllowed) {
    if (!isInOrganization) {
      return (
        <EnrollStateLayout cancel={cancel}>
          <h1>{t('Unenroll.OCTI.Error.NotInOrganization.Title')}</h1>
        </EnrollStateLayout>
      );
    }

    return organizationId ? (
      <UnenrollOCTIMissingCapability
        organizationId={organizationId}
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
