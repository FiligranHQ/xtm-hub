import Loader from '@/components/loader';
import { RegisterNeverRegistered } from '@/components/register/never-registered';
import { RegisterPlatform } from '@/components/register/register.graphql';
import { RegisterStateMissingCapability } from '@/components/register/state/missing-capability';
import { RegistrationContext } from '@/components/registration/context';
import { RegistrationLayout } from '@/components/registration/layout';
import { PlatformRegistrationStatusEnum } from '@generated/models/PlatformRegistrationStatus.enum';
import registerFragmentGraphql, {
  registerFragment$key,
} from '@generated/registerFragment.graphql';
import registerIsPlatformRegisteredFragmentGraphql, {
  registerIsPlatformRegisteredFragment$key,
} from '@generated/registerIsPlatformRegisteredFragment.graphql';
import RegisterIsPlatformRegisteredQueryGraphql, {
  registerIsPlatformRegisteredQuery,
} from '@generated/registerIsPlatformRegisteredQuery.graphql';
import {
  PlatformContract,
  registerPlatformMutation,
} from '@generated/registerPlatformMutation.graphql';
import { toast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import React, { useContext, useEffect, useRef, useState } from 'react';
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
    contract: PlatformContract;
  };
  queryRef: PreloadedQuery<registerIsPlatformRegisteredQuery>;
}

export type RegistrationRequestStatus =
  | 'idle'
  | 'succeeded'
  | 'failed'
  | 'missed-capability';

export const Register: React.FC<Props> = ({ queryRef, platform }) => {
  const t = useTranslations();
  const { translationKey, identifier } = useContext(RegistrationContext);

  const [chosenOrganizationId, setChosenOrganizationId] = useState<string>();

  const isPlatformRegisteredPreloadedQuery =
    usePreloadedQuery<registerIsPlatformRegisteredQuery>(
      RegisterIsPlatformRegisteredQueryGraphql,
      queryRef
    );

  const isPlatformRegistered =
    useFragment<registerIsPlatformRegisteredFragment$key>(
      registerIsPlatformRegisteredFragmentGraphql,
      isPlatformRegisteredPreloadedQuery.isPlatformRegistered
    );

  // required to prevent React strict mode double registration
  const hasRun = useRef(false);
  useEffect(() => {
    const shouldRefreshToken =
      isPlatformRegistered.status ===
        PlatformRegistrationStatusEnum.REGISTERED ||
      isPlatformRegistered.status ===
        PlatformRegistrationStatusEnum.UNREGISTERED;

    if (
      shouldRefreshToken &&
      isPlatformRegistered.organization &&
      !hasRun.current
    ) {
      hasRun.current = true;
      register(isPlatformRegistered.organization.id);
    }
  }, [isPlatformRegistered]);

  const [registrationRequestStatus, setRegistrationRequestStatus] =
    useState<RegistrationRequestStatus>('idle');

  const [registerPlatform] =
    useMutation<registerPlatformMutation>(RegisterPlatform);

  const [registerFragmentRef, setRegisterFragmentRef] =
    useState<registerFragment$key | null>(null);
  const registerDataResponse = useFragment<registerFragment$key>(
    registerFragmentGraphql,
    registerFragmentRef
  );

  useEffect(() => {
    if (!registerDataResponse?.token) {
      return;
    }

    setRegistrationRequestStatus('succeeded');
    window.opener?.postMessage(
      {
        action: 'register',
        token: registerDataResponse.token,
      },
      '*'
    );
  }, [registerDataResponse]);

  const cancel = () => {
    window.opener?.postMessage({ action: 'cancel' }, '*');
  };

  const register = (organizationId: string) => {
    if (!identifier) {
      return;
    }

    setChosenOrganizationId(organizationId);
    registerPlatform({
      variables: {
        input: { organizationId, platform, identifier },
      },
      onCompleted: (response) => {
        setRegisterFragmentRef(response.registerPlatform);
      },
      onError: (error) => {
        if (error.message === 'MISSING_CAPABILITY_ON_ORGANIZATION') {
          setRegistrationRequestStatus('missed-capability');
          return;
        }

        setRegistrationRequestStatus('failed');
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

  if (registrationRequestStatus === 'missed-capability') {
    return chosenOrganizationId ? (
      <RegisterStateMissingCapability
        organizationId={chosenOrganizationId}
        cancel={cancel}
      />
    ) : (
      <Loader />
    );
  }

  if (registrationRequestStatus === 'succeeded') {
    return (
      <RegistrationLayout>
        <h1>{t(`Register.${translationKey}.Succeeded.Title`)}</h1>
        <p>{t(`Register.${translationKey}.Succeeded.Description`)}</p>
      </RegistrationLayout>
    );
  }

  if (registrationRequestStatus === 'failed') {
    return (
      <RegistrationLayout cancel={cancel}>
        <h1>{t(`Register.${translationKey}.Failed.Title`)}</h1>
        <p>{t(`Register.${translationKey}.Failed.Description`)}</p>
      </RegistrationLayout>
    );
  }

  if (
    isPlatformRegistered.status ===
    PlatformRegistrationStatusEnum.NEVER_REGISTERED
  ) {
    return (
      <RegisterNeverRegistered
        cancel={cancel}
        confirm={register}
      />
    );
  }

  return <Loader />;
};
