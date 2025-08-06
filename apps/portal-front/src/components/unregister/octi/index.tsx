import Loader from '@/components/loader';
import {
  CanUnregisterOCTIPlatformFragment,
  UnregisterOCTIPlatform,
} from '@/components/register/register.graphql';
import { EnrollStateLayout } from '@/components/register/state/layout';
import { UnregisterOCTIConfirm } from '@/components/unregister/octi/confirm';
import { UnregisterOCTIMissingCapability } from '@/components/unregister/octi/missing-capability';
import { UnregisterOCTIPlatformNotEnrolled } from '@/components/unregister/octi/platform-not-registered';
import { enrollCanUnregisterOCTIPlatformFragment$key } from '@generated/enrollCanUnregisterOCTIPlatformFragment.graphql';
import EnrollCanUnregisterOCTIPlatformQueryGraphql, {
  enrollCanUnregisterOCTIPlatformQuery,
} from '@generated/enrollCanUnregisterOCTIPlatformQuery.graphql';
import { enrollUnregisterOCTIPlatformMutation } from '@generated/enrollUnregisterOCTIPlatformMutation.graphql';
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
  queryRef: PreloadedQuery<enrollCanUnregisterOCTIPlatformQuery>;
}

type UnregistrationStatus = 'idle' | 'succeeded' | 'failed';

export const UnregisterOCTI: React.FC<Props> = ({ queryRef, platformId }) => {
  const t = useTranslations();
  const canUnregisterPreloadedQuery =
    usePreloadedQuery<enrollCanUnregisterOCTIPlatformQuery>(
      EnrollCanUnregisterOCTIPlatformQueryGraphql,
      queryRef
    );

  const { isAllowed, isPlatformEnrolled, isInOrganization, organizationId } =
    useFragment<enrollCanUnregisterOCTIPlatformFragment$key>(
      CanUnregisterOCTIPlatformFragment,
      canUnregisterPreloadedQuery.canUnregisterOCTIPlatform
    );

  const [unregisterPlatform] =
    useMutation<enrollUnregisterOCTIPlatformMutation>(UnregisterOCTIPlatform);

  const [status, setStatus] = useState<UnregistrationStatus>('idle');
  const cancel = () => {
    window.opener?.postMessage({ action: 'cancel' }, '*');
  };

  const confirm = () => {
    unregisterPlatform({
      variables: {
        input: {
          platformId,
        },
      },
      onCompleted: () => {
        window.opener?.postMessage({ action: 'unregister' }, '*');
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
        <h1>{t('Unregister.OCTI.Succeeded.Title')}</h1>
        <p>{t('Unregister.OCTI.Succeeded.Description')}</p>
      </EnrollStateLayout>
    );
  }

  if (status === 'failed') {
    return (
      <EnrollStateLayout>
        <h1>{t('Unregister.OCTI.Failed.Title')}</h1>
        <p>{t('Unregister.OCTI.Failed.Description')}</p>
      </EnrollStateLayout>
    );
  }

  if (!isPlatformEnrolled) {
    return <UnregisterOCTIPlatformNotEnrolled confirm={confirm} />;
  }

  if (!isAllowed) {
    if (!isInOrganization) {
      return (
        <EnrollStateLayout cancel={cancel}>
          <h1>{t('Unregister.OCTI.Error.NotInOrganization.Title')}</h1>
        </EnrollStateLayout>
      );
    }

    return organizationId ? (
      <UnregisterOCTIMissingCapability
        organizationId={organizationId}
        cancel={cancel}
      />
    ) : (
      <Loader />
    );
  }

  return organizationId ? (
    <UnregisterOCTIConfirm
      cancel={cancel}
      confirm={confirm}
      organizationId={organizationId}
    />
  ) : (
    <Loader />
  );
};
