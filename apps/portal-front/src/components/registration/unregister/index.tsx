import Loader from '@/components/loader';
import { RegistrationContext } from '@/components/registration/context';
import { RegistrationLayout } from '@/components/registration/layout';
import {
  CanUnregisterPlatformFragment,
  UnregisterPlatform,
} from '@/components/registration/register/register.graphql';
import { UnregisterConfirm } from '@/components/registration/unregister/confirm';
import { UnregisterMissingCapability } from '@/components/registration/unregister/missing-capability';
import { UnregisterPlatformNotRegistered } from '@/components/registration/unregister/platform-not-registered';
import { toast } from '@filigran/ui/clients';
import { registerCanUnregisterPlatformFragment$key } from '@generated/registerCanUnregisterPlatformFragment.graphql';
import RegisterCanUnregisterPlatformQueryGraphql, {
  registerCanUnregisterPlatformQuery,
} from '@generated/registerCanUnregisterPlatformQuery.graphql';
import { registerUnregisterPlatformMutation } from '@generated/registerUnregisterPlatformMutation.graphql';
import { useTranslations } from 'next-intl';
import React, { useContext, useState } from 'react';
import {
  PreloadedQuery,
  useFragment,
  useMutation,
  usePreloadedQuery,
} from 'react-relay';

interface Props {
  platformId: string;
  queryRef: PreloadedQuery<registerCanUnregisterPlatformQuery>;
}

type UnregistrationStatus = 'idle' | 'succeeded' | 'failed';

export const Unregister: React.FC<Props> = ({ queryRef, platformId }) => {
  const { displayedIdentifier, identifier } = useContext(RegistrationContext);
  const t = useTranslations();
  const canUnregisterPreloadedQuery =
    usePreloadedQuery<registerCanUnregisterPlatformQuery>(
      RegisterCanUnregisterPlatformQueryGraphql,
      queryRef
    );

  const { isAllowed, isPlatformRegistered, isInOrganization, organizationId } =
    useFragment<registerCanUnregisterPlatformFragment$key>(
      CanUnregisterPlatformFragment,
      canUnregisterPreloadedQuery.canUnregisterPlatform
    );

  const [unregisterPlatform] =
    useMutation<registerUnregisterPlatformMutation>(UnregisterPlatform);

  const [status, setStatus] = useState<UnregistrationStatus>('idle');
  const cancel = () => {
    window.opener?.postMessage({ action: 'cancel' }, '*');
  };

  const confirm = () => {
    if (!identifier) {
      return;
    }

    unregisterPlatform({
      variables: {
        input: {
          platformId,
          identifier,
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
      <RegistrationLayout>
        <h1>
          {t(`Unregister.Succeeded.Title`, {
            platformIdentifier: displayedIdentifier,
          })}
        </h1>
        <p>{t(`Unregister.Succeeded.Description`)}</p>
      </RegistrationLayout>
    );
  }

  if (status === 'failed') {
    return (
      <RegistrationLayout>
        <h1>{t(`Unregister.Failed.Title`)}</h1>
        <p>{t(`Unregister.Failed.Description`)}</p>
      </RegistrationLayout>
    );
  }

  if (!isPlatformRegistered) {
    return <UnregisterPlatformNotRegistered confirm={confirm} />;
  }

  if (!isAllowed) {
    if (!isInOrganization) {
      return (
        <RegistrationLayout cancel={cancel}>
          <h1>{t(`Unregister.Error.NotInOrganization.Title`)}</h1>
        </RegistrationLayout>
      );
    }

    return organizationId ? (
      <UnregisterMissingCapability
        organizationId={organizationId}
        cancel={cancel}
      />
    ) : (
      <Loader />
    );
  }

  return organizationId ? (
    <UnregisterConfirm
      cancel={cancel}
      confirm={confirm}
      organizationId={organizationId}
    />
  ) : (
    <Loader />
  );
};
