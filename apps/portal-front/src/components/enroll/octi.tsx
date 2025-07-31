import { EnrollOCTIPlatform } from '@/components/enroll/enroll.graphql';
import { EnrollNeverEnrolled } from '@/components/enroll/never-enrolled';
import { EnrollStateLayout } from '@/components/enroll/state/layout';
import Loader from '@/components/loader';
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

export type RegistrationRequestStatus = 'idle' | 'succeeded' | 'failed';

export const EnrollOCTI: React.FC<Props> = ({ queryRef, platform }) => {
  const t = useTranslations();

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

    if (shouldRefreshToken && isPlatformRegistered.organizationId) {
      enroll(isPlatformRegistered.organizationId);
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
    enrollPlatform({
      variables: {
        input: { organizationId, platform },
      },
      onCompleted: (response) => {
        setEnrollFragmentRef(response.enrollOCTIPlatform);
      },
      onError: (error) => {
        setRegistrationRequestStatus('failed');
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

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
