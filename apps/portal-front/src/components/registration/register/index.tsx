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
import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useReducer,
  useRef,
} from 'react';
import {
  PreloadedQuery,
  useFragment,
  useLazyLoadQuery,
  useMutation,
  usePreloadedQuery,
} from 'react-relay';
import Loader from '@/components/Loader';
import { RegistrationContext } from '@/components/registration/Context';
import { RegistrationLayout } from '@/components/registration/Layout';
import { RegisterStateMissingCapability } from '@/components/registration/register/MissingCapability';
import { RegisterOrganizationForm } from '@/components/registration/register/OrganizationForm';

interface Props {
  platform: PlatformInput;
  queryRef: PreloadedQuery<registerIsPlatformRegisteredQuery>;
}

export type RegistrationRequestStatus =
  | 'idle'
  | 'succeeded'
  | 'failed'
  | 'missed-capability';

interface State {
  registrationRequestStatus: RegistrationRequestStatus;
  chosenOrganizationId?: string;
  registerFragmentRef: registerFragment$key | null;
}

type Action =
  | { type: 'SET_ORGANIZATION_ID'; payload: string }
  | { type: 'SET_FRAGMENT_REF'; payload: registerFragment$key }
  | { type: 'SET_STATUS'; payload: RegistrationRequestStatus }
  | { type: 'SET_SUCCEEDED' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ORGANIZATION_ID':
      return { ...state, chosenOrganizationId: action.payload };
    case 'SET_FRAGMENT_REF':
      return { ...state, registerFragmentRef: action.payload };
    case 'SET_STATUS':
      return { ...state, registrationRequestStatus: action.payload };
    case 'SET_SUCCEEDED':
      return { ...state, registrationRequestStatus: 'succeeded' };
    default:
      return state;
  }
};

const initialState: State = {
  registrationRequestStatus: 'idle',
  chosenOrganizationId: undefined,
  registerFragmentRef: null,
};

export const Register: React.FC<Props> = ({ queryRef, platform }) => {
  const t = useTranslations();
  const { displayedIdentifier, identifier } = useContext(RegistrationContext);
  const [state, dispatch] = useReducer(reducer, initialState);

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

  const [registerPlatform] =
    useMutation<registerPlatformMutation>(RegisterPlatform);

  const registerDataResponse = useFragment<registerFragment$key>(
    registerFragmentGraphql,
    state.registerFragmentRef
  );

  const hasPostedMessageRef = useRef(false);
  const hasAutoRegisteredRef = useRef(false);

  const cancel = useCallback(() => {
    window.opener?.postMessage({ action: 'cancel' }, '*');
  }, []);

  const register = useCallback(
    (organizationId: string) => {
      if (!identifier) {
        return;
      }
      dispatch({ type: 'SET_ORGANIZATION_ID', payload: organizationId });
      registerPlatform({
        variables: {
          input: { organizationId, platform, identifier },
        },
        onCompleted: (response) => {
          dispatch({
            type: 'SET_FRAGMENT_REF',
            payload: response.registerPlatform,
          });
        },
        onError: (error) => {
          if (error.message === 'MISSING_CAPABILITY_ON_ORGANIZATION') {
            dispatch({ type: 'SET_STATUS', payload: 'missed-capability' });
          } else {
            dispatch({ type: 'SET_STATUS', payload: 'failed' });
            toast({
              variant: 'destructive',
              title: t('Utils.Error'),
              description: t(`Error.Server.${error.message}`),
            });
          }
        },
      });
    },
    [identifier, platform, registerPlatform, t]
  );

  useLayoutEffect(() => {
    if (registerDataResponse?.token && !hasPostedMessageRef.current) {
      hasPostedMessageRef.current = true;
      window.opener?.postMessage(
        {
          action: 'register',
          token: registerDataResponse.token,
        },
        '*'
      );
      dispatch({ type: 'SET_SUCCEEDED' });
    }
  }, [registerDataResponse?.token]);

  useLayoutEffect(() => {
    const shouldAutoRegister =
      isPlatformRegistered.status ===
        PlatformRegistrationStatusEnum.REGISTERED &&
      isPlatformRegistered.organization &&
      !hasAutoRegisteredRef.current;

    if (shouldAutoRegister) {
      hasAutoRegisteredRef.current = true;
      register(isPlatformRegistered.organization.id);
    }
  }, [isPlatformRegistered, register]);

  if (state.registrationRequestStatus === 'missed-capability') {
    return state.chosenOrganizationId ? (
      <RegisterStateMissingCapability
        organizationId={state.chosenOrganizationId}
        cancel={cancel}
      />
    ) : (
      <Loader />
    );
  }

  if (state.registrationRequestStatus === 'succeeded') {
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

  if (state.registrationRequestStatus === 'failed') {
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
