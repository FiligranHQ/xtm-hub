import Loader from '@/components/loader';
import { RegistrationContext } from '@/components/registration/context';
import { RegistrationLayout } from '@/components/registration/layout';
import { RegisterStateMissingCapability } from '@/components/registration/register/missing-capability';
import { RegisterOrganizationForm } from '@/components/registration/register/organization-form';
import { RegisterPlatform } from '@/components/registration/register/register.graphql';
import { toast } from '@filigran/ui/clients';
import { PlatformRegistrationStatusEnum } from '@generated/models/PlatformRegistrationStatus.enum';
import OrganizationListUserOrganizationsQueryGraphql, {
  organizationListUserOrganizationsQuery,
} from '@generated/organizationListUserOrganizationsQuery.graphql';
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
  PlatformInput,
  registerPlatformMutation,
} from '@generated/registerPlatformMutation.graphql';
import { useTranslations } from 'next-intl';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  PreloadedQuery,
  useFragment,
  useLazyLoadQuery,
  useMutation,
  usePreloadedQuery,
} from 'react-relay';

interface Props {
  platform: PlatformInput;
  queryRef: PreloadedQuery<registerIsPlatformRegisteredQuery>;
}

export type RegistrationRequestStatus =
  | 'idle'
  | 'succeeded'
  | 'failed'
  | 'missed-capability';

export const Register: React.FC<Props> = ({ queryRef, platform }) => {
  const t = useTranslations();
  const { displayedIdentifier, identifier } = useContext(RegistrationContext);

  const [chosenOrganizationId, setChosenOrganizationId] = useState<string>();

  const isPlatformRegisteredPreloadedQuery =
    usePreloadedQuery<registerIsPlatformRegisteredQuery>(
      RegisterIsPlatformRegisteredQueryGraphql,
      queryRef
    );

  const userOrganizationsQueryData =
    useLazyLoadQuery<organizationListUserOrganizationsQuery>(
      OrganizationListUserOrganizationsQueryGraphql,
      {}
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
      isPlatformRegistered.status === PlatformRegistrationStatusEnum.REGISTERED;

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
        <h1>
          {t(`Register.Succeeded.Title`, {
            platformIdentifier: displayedIdentifier,
          })}
        </h1>
        <p>{t(`Register.Succeeded.Description`)}</p>
      </RegistrationLayout>
    );
  }

  if (registrationRequestStatus === 'failed') {
    return (
      <RegistrationLayout cancel={cancel}>
        <h1>{t(`Register.Failed.Title`)}</h1>
        <p>{t(`Register.Failed.Description`)}</p>
      </RegistrationLayout>
    );
  }

  const shouldRegisterOnSameOrganization =
    isPlatformRegistered.status ===
      PlatformRegistrationStatusEnum.UNREGISTERED &&
    userOrganizationsQueryData.userOrganizations.length > 2;
  if (shouldRegisterOnSameOrganization) {
    return (
      <RegistrationLayout
        cancel={cancel}
        confirm={() => register(isPlatformRegistered.organization?.id ?? '')}>
        <h1>{t(`Register.TooMuchOrganization.Title`)}</h1>
        <p>
          {t(`Register.TooMuchOrganization.Description1`, {
            platformIdentifier: displayedIdentifier,
            platformTitle: isPlatformRegistered.platformTitle ?? '',
          })}
          <br />
          {t(`Register.TooMuchOrganization.Description2`)}
        </p>
      </RegistrationLayout>
    );
  }

  if (
    isPlatformRegistered.status ===
      PlatformRegistrationStatusEnum.NEVER_REGISTERED ||
    isPlatformRegistered.status === PlatformRegistrationStatusEnum.UNREGISTERED
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
