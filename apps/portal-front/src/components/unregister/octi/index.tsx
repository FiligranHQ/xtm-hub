import Loader from '@/components/loader';
import {
  CanUnregisterOCTIPlatformFragment,
  UnregisterOCTIPlatform,
} from '@/components/register/register.graphql';
import { RegisterStateLayout } from '@/components/register/state/layout';
import { UnregisterOCTIConfirm } from '@/components/unregister/octi/confirm';
import { UnregisterOCTIMissingCapability } from '@/components/unregister/octi/missing-capability';
import { UnregisterOCTIPlatformNotRegistered } from '@/components/unregister/octi/platform-not-registered';
import { registerCanUnregisterOCTIPlatformFragment$key } from '@generated/registerCanUnregisterOCTIPlatformFragment.graphql';
import RegisterCanUnregisterOCTIPlatformQueryGraphql, {
  registerCanUnregisterOCTIPlatformQuery,
} from '@generated/registerCanUnregisterOCTIPlatformQuery.graphql';
import { registerUnregisterOCTIPlatformMutation } from '@generated/registerUnregisterOCTIPlatformMutation.graphql';
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
  queryRef: PreloadedQuery<registerCanUnregisterOCTIPlatformQuery>;
}

type UnregistrationStatus = 'idle' | 'succeeded' | 'failed';

export const UnregisterOCTI: React.FC<Props> = ({ queryRef, platformId }) => {
  const t = useTranslations();
  const canUnregisterPreloadedQuery =
    usePreloadedQuery<registerCanUnregisterOCTIPlatformQuery>(
      RegisterCanUnregisterOCTIPlatformQueryGraphql,
      queryRef
    );

  const { isAllowed, isPlatformRegistered, isInOrganization, organizationId } =
    useFragment<registerCanUnregisterOCTIPlatformFragment$key>(
      CanUnregisterOCTIPlatformFragment,
      canUnregisterPreloadedQuery.canUnregisterOCTIPlatform
    );

  const [unregisterPlatform] =
    useMutation<registerUnregisterOCTIPlatformMutation>(UnregisterOCTIPlatform);

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
      <RegisterStateLayout>
        <h1>{t('Unregister.OCTI.Succeeded.Title')}</h1>
        <p>{t('Unregister.OCTI.Succeeded.Description')}</p>
      </RegisterStateLayout>
    );
  }

  if (status === 'failed') {
    return (
      <RegisterStateLayout>
        <h1>{t('Unregister.OCTI.Failed.Title')}</h1>
        <p>{t('Unregister.OCTI.Failed.Description')}</p>
      </RegisterStateLayout>
    );
  }

  if (!isPlatformRegistered) {
    return <UnregisterOCTIPlatformNotRegistered confirm={confirm} />;
  }

  if (!isAllowed) {
    if (!isInOrganization) {
      return (
        <RegisterStateLayout cancel={cancel}>
          <h1>{t('Unregister.OCTI.Error.NotInOrganization.Title')}</h1>
        </RegisterStateLayout>
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
