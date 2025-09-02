import Loader from '@/components/loader';
import { RegistrationContext } from '@/components/registration/context';
import { RegistrationLayout } from '@/components/registration/layout';
import {
  CanUnregisterPlatformFragment,
  UnregisterOpenCTIPlatform,
} from '@/components/registration/register/register.graphql';
import { UnregisterOpenCTIConfirm } from '@/components/registration/unregister/confirm';
import { UnregisterOpenCTIMissingCapability } from '@/components/registration/unregister/missing-capability';
import { UnregisterOpenCTIPlatformNotRegistered } from '@/components/registration/unregister/platform-not-registered';
import { registerCanUnregisterPlatformFragment$key } from '@generated/registerCanUnregisterPlatformFragment.graphql';
import RegisterCanUnregisterPlatformQueryGraphql, {
  registerCanUnregisterPlatformQuery,
} from '@generated/registerCanUnregisterPlatformQuery.graphql';
import { registerUnregisterOpenCTIPlatformMutation } from '@generated/registerUnregisterOpenCTIPlatformMutation.graphql';
import { toast } from 'filigran-ui/clients';
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
  const { translationKey } = useContext(RegistrationContext);
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
        <h1>{t(`Unregister.${translationKey}.Succeeded.Title`)}</h1>
        <p>{t(`Unregister.${translationKey}.Succeeded.Description`)}</p>
      </RegistrationLayout>
    );
  }

  if (status === 'failed') {
    return (
      <RegistrationLayout>
        <h1>{t(`Unregister.${translationKey}.Failed.Title`)}</h1>
        <p>{t(`Unregister.${translationKey}.Failed.Description`)}</p>
      </RegistrationLayout>
    );
  }

  if (!isPlatformRegistered) {
    return <UnregisterOpenCTIPlatformNotRegistered confirm={confirm} />;
  }

  if (!isAllowed) {
    if (!isInOrganization) {
      return (
        <RegistrationLayout cancel={cancel}>
          <h1>
            {t(`Unregister.${translationKey}.Error.NotInOrganization.Title`)}
          </h1>
        </RegistrationLayout>
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
