import Loader from '@/components/loader';
import {
  CanUnregisterOpenCTIPlatformFragment,
  UnregisterOpenCTIPlatform,
} from '@/components/register/register.graphql';
import { RegisterStateLayout } from '@/components/register/state/layout';
import { UnregisterOpenCTIConfirm } from '@/components/unregister/opencti/confirm';
import { UnregisterOpenCTIMissingCapability } from '@/components/unregister/opencti/missing-capability';
import { UnregisterOpenCTIPlatformNotRegistered } from '@/components/unregister/opencti/platform-not-registered';
import { registerCanUnregisterOpenCTIPlatformFragment$key } from '@generated/registerCanUnregisterOpenCTIPlatformFragment.graphql';
import RegisterCanUnregisterOpenCTIPlatformQueryGraphql, {
  registerCanUnregisterOpenCTIPlatformQuery,
} from '@generated/registerCanUnregisterOpenCTIPlatformQuery.graphql';
import { registerUnregisterOpenCTIPlatformMutation } from '@generated/registerUnregisterOpenCTIPlatformMutation.graphql';
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
  queryRef: PreloadedQuery<registerCanUnregisterOpenCTIPlatformQuery>;
}

type UnregistrationStatus = 'idle' | 'succeeded' | 'failed';

export const UnregisterOpenCTI: React.FC<Props> = ({
  queryRef,
  platformId,
}) => {
  const t = useTranslations();
  const canUnregisterPreloadedQuery =
    usePreloadedQuery<registerCanUnregisterOpenCTIPlatformQuery>(
      RegisterCanUnregisterOpenCTIPlatformQueryGraphql,
      queryRef
    );

  const { isAllowed, isPlatformRegistered, isInOrganization, organizationId } =
    useFragment<registerCanUnregisterOpenCTIPlatformFragment$key>(
      CanUnregisterOpenCTIPlatformFragment,
      canUnregisterPreloadedQuery.canUnregisterOpenCTIPlatform
    );

  const [unregisterPlatform] =
    useMutation<registerUnregisterOpenCTIPlatformMutation>(
      UnregisterOpenCTIPlatform
    );

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
        // TODO: remove after OpenCTI PR is merged
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
      <RegisterStateLayout>
        <h1>{t('Unregister.OpenCTI.Succeeded.Title')}</h1>
        <p>{t('Unregister.OpenCTI.Succeeded.Description')}</p>
      </RegisterStateLayout>
    );
  }

  if (status === 'failed') {
    return (
      <RegisterStateLayout>
        <h1>{t('Unregister.OpenCTI.Failed.Title')}</h1>
        <p>{t('Unregister.OpenCTI.Failed.Description')}</p>
      </RegisterStateLayout>
    );
  }

  if (!isPlatformRegistered) {
    return <UnregisterOpenCTIPlatformNotRegistered confirm={confirm} />;
  }

  if (!isAllowed) {
    if (!isInOrganization) {
      return (
        <RegisterStateLayout cancel={cancel}>
          <h1>{t('Unregister.OpenCTI.Error.NotInOrganization.Title')}</h1>
        </RegisterStateLayout>
      );
    }

    return organizationId ? (
      <UnregisterOpenCTIMissingCapability
        organizationId={organizationId}
        cancel={cancel}
      />
    ) : (
      <Loader />
    );
  }

  return organizationId ? (
    <UnregisterOpenCTIConfirm
      cancel={cancel}
      confirm={confirm}
      organizationId={organizationId}
    />
  ) : (
    <Loader />
  );
};
