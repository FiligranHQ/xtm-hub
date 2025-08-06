import Loader from '@/components/loader';
import { RegisterNeverRegistered } from '@/components/register/never-registered';
import { RegisterOCTIPlatform } from '@/components/register/register.graphql';
import { RegisterStateLayout } from '@/components/register/state/layout';
import { RegisterStateMissingCapability } from '@/components/register/state/missing-capability';
import { PlatformRegistrationStatusEnum } from '@generated/models/PlatformRegistrationStatus.enum';
import registerIsOCTIPlatformRegisteredFragmentGraphql, {
  registerIsOCTIPlatformRegisteredFragment$key,
} from '@generated/registerIsOCTIPlatformRegisteredFragment.graphql';
import RegisterIsOCTIPlatformRegisteredQueryGraphql, {
  registerIsOCTIPlatformRegisteredQuery,
} from '@generated/registerIsOCTIPlatformRegisteredQuery.graphql';
import registerOCTIFragmentGraphql, {
  registerOCTIFragment$key,
} from '@generated/registerOCTIFragment.graphql';
import { OCTIPlatformContract } from '@generated/registerOCTIPlatformFragment.graphql';
import { registerOCTIPlatformMutation } from '@generated/registerOCTIPlatformMutation.graphql';
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
  queryRef: PreloadedQuery<registerIsOCTIPlatformRegisteredQuery>;
}

export type RegistrationRequestStatus =
  | 'idle'
  | 'succeeded'
  | 'failed'
  | 'missed-capability';

export const RegisterOCTI: React.FC<Props> = ({ queryRef, platform }) => {
  const t = useTranslations();
  const [chosenOrganizationId, setChosenOrganizationId] = useState<string>();

  const isOCTIPlatformRegisteredPreloadedQuery =
    usePreloadedQuery<registerIsOCTIPlatformRegisteredQuery>(
      RegisterIsOCTIPlatformRegisteredQueryGraphql,
      queryRef
    );

  const isPlatformRegistered =
    useFragment<registerIsOCTIPlatformRegisteredFragment$key>(
      registerIsOCTIPlatformRegisteredFragmentGraphql,
      isOCTIPlatformRegisteredPreloadedQuery.isOCTIPlatformRegistered
    );

  useEffect(() => {
    const shouldRefreshToken =
      isPlatformRegistered.status ===
        PlatformRegistrationStatusEnum.REGISTERED ||
      isPlatformRegistered.status ===
        PlatformRegistrationStatusEnum.UNREGISTERED;

    if (shouldRefreshToken && isPlatformRegistered.organization) {
      register(isPlatformRegistered.organization.id);
    }
  }, [isPlatformRegistered]);

  const [registrationRequestStatus, setRegistrationRequestStatus] =
    useState<RegistrationRequestStatus>('idle');

  const [registerPlatform] =
    useMutation<registerOCTIPlatformMutation>(RegisterOCTIPlatform);

  const [registerFragmentRef, setRegisterFragmentRef] =
    useState<registerOCTIFragment$key | null>(null);
  const registerDataResponse = useFragment<registerOCTIFragment$key>(
    registerOCTIFragmentGraphql,
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
    setChosenOrganizationId(organizationId);
    registerPlatform({
      variables: {
        input: { organizationId, platform },
      },
      onCompleted: (response) => {
        setRegisterFragmentRef(response.registerOCTIPlatform);
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
      <RegisterStateLayout>
        <h1>{t('Register.OCTI.Succeeded.Title')}</h1>
        <p>{t('Register.OCTI.Succeeded.Description')}</p>
      </RegisterStateLayout>
    );
  }

  if (registrationRequestStatus === 'failed') {
    return (
      <RegisterStateLayout cancel={cancel}>
        <h1>{t('Register.OCTI.Failed.Title')}</h1>
        <p>{t('Register.OCTI.Failed.Description')}</p>
      </RegisterStateLayout>
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
