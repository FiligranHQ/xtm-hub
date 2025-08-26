import Loader from '@/components/loader';
import { RegisterOrganizationForm } from '@/components/register/form/organization';
import { RegisterOpenCTIPlatform } from '@/components/register/register.graphql';
import { RegisterStateLayout } from '@/components/register/state/layout';
import { RegisterStateMissingCapability } from '@/components/register/state/missing-capability';
import { PlatformRegistrationStatusEnum } from '@generated/models/PlatformRegistrationStatus.enum';
import OrganizationListUserOrganizationsQueryGraphql, {
  organizationListUserOrganizationsQuery,
} from '@generated/organizationListUserOrganizationsQuery.graphql';
import registerIsOpenCTIPlatformRegisteredFragmentGraphql, {
  registerIsOpenCTIPlatformRegisteredFragment$key,
} from '@generated/registerIsOpenCTIPlatformRegisteredFragment.graphql';
import RegisterIsOpenCTIPlatformRegisteredQueryGraphql, {
  registerIsOpenCTIPlatformRegisteredQuery,
} from '@generated/registerIsOpenCTIPlatformRegisteredQuery.graphql';
import registerOpenCTIFragmentGraphql, {
  registerOpenCTIFragment$key,
} from '@generated/registerOpenCTIFragment.graphql';
import {
  OpenCTIPlatformContract,
  registerOpenCTIPlatformMutation,
} from '@generated/registerOpenCTIPlatformMutation.graphql';
import { toast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';
import {
  PreloadedQuery,
  useFragment,
  useLazyLoadQuery,
  useMutation,
  usePreloadedQuery,
} from 'react-relay';

interface Props {
  platform: {
    id: string;
    url: string;
    title: string;
    contract: OpenCTIPlatformContract;
  };
  queryRef: PreloadedQuery<registerIsOpenCTIPlatformRegisteredQuery>;
}

export type RegistrationRequestStatus =
  | 'idle'
  | 'succeeded'
  | 'failed'
  | 'missed-capability';

export const RegisterOpenCTI: React.FC<Props> = ({ queryRef, platform }) => {
  const t = useTranslations();
  const [chosenOrganizationId, setChosenOrganizationId] = useState<string>();

  const isOpenCTIPlatformRegisteredPreloadedQuery =
    usePreloadedQuery<registerIsOpenCTIPlatformRegisteredQuery>(
      RegisterIsOpenCTIPlatformRegisteredQueryGraphql,
      queryRef
    );

  const userOrganizationsQueryData =
    useLazyLoadQuery<organizationListUserOrganizationsQuery>(
      OrganizationListUserOrganizationsQueryGraphql,
      {}
    );

  const isPlatformRegistered =
    useFragment<registerIsOpenCTIPlatformRegisteredFragment$key>(
      registerIsOpenCTIPlatformRegisteredFragmentGraphql,
      isOpenCTIPlatformRegisteredPreloadedQuery.isOpenCTIPlatformRegistered
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

  const [registerPlatform] = useMutation<registerOpenCTIPlatformMutation>(
    RegisterOpenCTIPlatform
  );

  const [registerFragmentRef, setRegisterFragmentRef] =
    useState<registerOpenCTIFragment$key | null>(null);
  const registerDataResponse = useFragment<registerOpenCTIFragment$key>(
    registerOpenCTIFragmentGraphql,
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
        setRegisterFragmentRef(response.registerOpenCTIPlatform);
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
        <h1>{t('Register.OpenCTI.Succeeded.Title')}</h1>
        <p>{t('Register.OpenCTI.Succeeded.Description')}</p>
      </RegisterStateLayout>
    );
  }

  if (registrationRequestStatus === 'failed') {
    return (
      <RegisterStateLayout cancel={cancel}>
        <h1>{t('Register.OpenCTI.Failed.Title')}</h1>
        <p>{t('Register.OpenCTI.Failed.Description')}</p>
      </RegisterStateLayout>
    );
  }

  if (
    isPlatformRegistered.status ===
    PlatformRegistrationStatusEnum.NEVER_REGISTERED
  ) {
    return (
      <RegisterOrganizationForm
        userOrganizationsQueryData={userOrganizationsQueryData}
        cancel={cancel}
        confirm={register}
      />
    );
  }

  return <Loader />;
};
