import Loader from '@/components/loader';
import { EnrollNeverEnrolled } from '@/components/register/never-registered';
import { EnrollOCTIPlatform } from '@/components/register/register.graphql';
import { EnrollStateLayout } from '@/components/register/state/layout';
import { EnrollStateMissingCapability } from '@/components/register/state/missing-capability';
import enrollIsOCTIPlatformRegisteredFragmentGraphql, {
  enrollIsOCTIPlatformRegisteredFragment$key,
} from '@generated/enrollIsOCTIPlatformRegisteredFragment.graphql';
import EnrollIsOCTIPlatformRegisteredQueryGraphql, {
  enrollIsOCTIPlatformRegisteredQuery,
} from '@generated/enrollIsOCTIPlatformRegisteredQuery.graphql';
import enrollOCTIFragmentGraphql, {
  enrollOCTIFragment$key,
} from '@generated/enrollOCTIFragment.graphql';
import { OCTIPlatformContract } from '@generated/enrollOCTIPlatformFragment.graphql';
import { enrollOCTIPlatformMutation } from '@generated/enrollOCTIPlatformMutation.graphql';
import { PlatformRegistrationStatusEnum } from '@generated/models/PlatformRegistrationStatus.enum';
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
  queryRef: PreloadedQuery<enrollIsOCTIPlatformRegisteredQuery>;
}

export type RegistrationRequestStatus =
  | 'idle'
  | 'succeeded'
  | 'failed'
  | 'missed-capability';

export const EnrollOCTI: React.FC<Props> = ({ queryRef, platform }) => {
  const t = useTranslations();
  const [chosenOrganizationId, setChosenOrganizationId] = useState<string>();

  const isOCTIPlatformRegisteredPreloadedQuery =
    usePreloadedQuery<enrollIsOCTIPlatformRegisteredQuery>(
      EnrollIsOCTIPlatformRegisteredQueryGraphql,
      queryRef
    );

  const isPlatformRegistered =
    useFragment<enrollIsOCTIPlatformRegisteredFragment$key>(
      enrollIsOCTIPlatformRegisteredFragmentGraphql,
      isOCTIPlatformRegisteredPreloadedQuery.isOCTIPlatformRegistered
    );

  useEffect(() => {
    const shouldRefreshToken =
      isPlatformRegistered.status ===
        PlatformRegistrationStatusEnum.REGISTERED ||
      isPlatformRegistered.status ===
        PlatformRegistrationStatusEnum.UNREGISTERED;

    if (shouldRefreshToken && isPlatformRegistered.organization) {
      enroll(isPlatformRegistered.organization.id);
    }
  }, [isPlatformRegistered]);

  const [registrationRequestStatus, setRegistrationRequestStatus] =
    useState<RegistrationRequestStatus>('idle');

  const [enrollPlatform] =
    useMutation<enrollOCTIPlatformMutation>(EnrollOCTIPlatform);

  const [enrollFragmentRef, setEnrollFragmentRef] =
    useState<enrollOCTIFragment$key | null>(null);
  const enrollDataResponse = useFragment<enrollOCTIFragment$key>(
    enrollOCTIFragmentGraphql,
    enrollFragmentRef
  );

  useEffect(() => {
    if (!enrollDataResponse?.token) {
      return;
    }

    setRegistrationRequestStatus('succeeded');
    window.opener?.postMessage(
      {
        action: 'enroll',
        token: enrollDataResponse.token,
      },
      '*'
    );
  }, [enrollDataResponse]);

  const cancel = () => {
    window.opener?.postMessage({ action: 'cancel' }, '*');
  };

  const enroll = (organizationId: string) => {
    setChosenOrganizationId(organizationId);
    enrollPlatform({
      variables: {
        input: { organizationId, platform },
      },
      onCompleted: (response) => {
        setEnrollFragmentRef(response.enrollOCTIPlatform);
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
      <EnrollStateMissingCapability
        organizationId={chosenOrganizationId}
        cancel={cancel}
      />
    ) : (
      <Loader />
    );
  }

  if (registrationRequestStatus === 'succeeded') {
    return (
      <EnrollStateLayout>
        <h1>{t('Enroll.OCTI.Succeeded.Title')}</h1>
        <p>{t('Enroll.OCTI.Succeeded.Description')}</p>
      </EnrollStateLayout>
    );
  }

  if (registrationRequestStatus === 'failed') {
    return (
      <EnrollStateLayout cancel={cancel}>
        <h1>{t('Enroll.OCTI.Failed.Title')}</h1>
        <p>{t('Enroll.OCTI.Failed.Description')}</p>
      </EnrollStateLayout>
    );
  }

  if (
    isPlatformRegistered.status ===
    PlatformRegistrationStatusEnum.NEVER_REGISTERED
  ) {
    return (
      <EnrollNeverEnrolled
        cancel={cancel}
        confirm={enroll}
      />
    );
  }

  return <Loader />;
};
