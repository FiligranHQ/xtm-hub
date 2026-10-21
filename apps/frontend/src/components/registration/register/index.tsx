import Loader from '@/components/Loader';
import { RegistrationContext } from '@/components/registration/Context';
import { RegisterStateConfirmReregistration } from '@/components/registration/register/ConfirmReregistration';
import { RegisterStateFailed } from '@/components/registration/register/Failed';
import { RegisterStateMissingCapability } from '@/components/registration/register/MissingCapability';
import { RegisterOrganizationForm } from '@/components/registration/register/OrganizationForm';
import { RegisterPlatform } from '@/components/registration/register/register.graphql';
import { RegisterStateSucceeded } from '@/components/registration/register/Succeeded';
import { RegisterStateTooManyOrganizations } from '@/components/registration/register/TooManyOrganizations';
import {
  isTargetedRegistration,
  postRegistrationMessage,
} from '@/components/registration/registration-message';
import { showSnackbar } from '@/components/ui/snackbar/snackbar-store';
import { useTranslate } from '@/hooks/use-translate';
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
import { PlatformRegistrationStatus } from '@graphql/generated';
import {
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
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

interface RegisterProps {
  platform: PlatformInput;
  queryRef: PreloadedQuery<registerIsPlatformRegisteredQuery>;
  /** Echoed back to the platform with the token (XTM One). */
  state?: string;
}

export type RegistrationRequestStatus =
  'idle' | 'succeeded' | 'failed' | 'missed-capability';

interface State {
  registrationRequestStatus: RegistrationRequestStatus;
  chosenOrganizationId?: string;
  registerFragmentRef: registerFragment$key | null;
  // The token, when the platform could not receive it: shown to copy.
  undeliveredToken?: string | null;
}

type Action =
  | { type: 'SET_ORGANIZATION_ID'; payload: string }
  | { type: 'SET_FRAGMENT_REF'; payload: registerFragment$key }
  | { type: 'SET_STATUS'; payload: RegistrationRequestStatus }
  | { type: 'SET_SUCCEEDED'; undeliveredToken?: string | null };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ORGANIZATION_ID':
      return { ...state, chosenOrganizationId: action.payload };
    case 'SET_FRAGMENT_REF':
      return { ...state, registerFragmentRef: action.payload };
    case 'SET_STATUS':
      return { ...state, registrationRequestStatus: action.payload };
    case 'SET_SUCCEEDED':
      return {
        ...state,
        registrationRequestStatus: 'succeeded',
        undeliveredToken: action.undeliveredToken ?? null,
      };
    default:
      return state;
  }
};

const initialState: State = {
  registrationRequestStatus: 'idle',
  chosenOrganizationId: undefined,
  registerFragmentRef: null,
};

export const Register = ({
  queryRef,
  platform,
  state: openerState,
}: RegisterProps) => {
  const t = useTranslate();
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
  const targeted = isTargetedRegistration(identifier);

  const cancel = useCallback(() => {
    postRegistrationMessage(
      window.opener,
      identifier,
      platform.url,
      { action: 'cancel' },
      openerState
    );
  }, [identifier, platform.url, openerState]);

  const register = useCallback(
    (organizationId: string, platformName: string = platform.title) => {
      if (!identifier) {
        return;
      }
      dispatch({ type: 'SET_ORGANIZATION_ID', payload: organizationId });
      registerPlatform({
        variables: {
          input: {
            organizationId,
            platform: { ...platform, title: platformName },
            identifier,
          },
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
            showSnackbar({
              severity: 'error',
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
      // Best-effort delivery: postMessage gives no receipt, and a targeted post
      // whose target origin differs from the opener's is dropped silently. So a
      // targeted platform always gets the token to copy; its own window closes
      // this popup once it received the message, so the copy box is unseen on
      // the happy path and is the only fallback when the message did not land.
      postRegistrationMessage(
        window.opener,
        identifier,
        platform.url,
        { action: 'register', token: registerDataResponse.token },
        openerState
      );
      dispatch({
        type: 'SET_SUCCEEDED',
        undeliveredToken: targeted ? registerDataResponse.token : null,
      });
    }
  }, [
    registerDataResponse?.token,
    identifier,
    platform.url,
    openerState,
    targeted,
  ]);

  useLayoutEffect(() => {
    // A platform registered again issues a new token: for a targeted platform
    // (XTM One) that takes an explicit confirmation, since anyone can open
    // this page with a known platform id and their own platform URL.
    const shouldAutoRegister =
      !targeted &&
      isPlatformRegistered.status === PlatformRegistrationStatus.Registered &&
      isPlatformRegistered.organization &&
      !hasAutoRegisteredRef.current;

    if (shouldAutoRegister) {
      hasAutoRegisteredRef.current = true;
      register(isPlatformRegistered.organization.id);
    }
  }, [isPlatformRegistered, register, targeted]);

  return useMemo(() => {
    const renderers = new Map<RegistrationRequestStatus, () => ReactNode>([
      [
        'missed-capability',
        () =>
          state.chosenOrganizationId ? (
            <RegisterStateMissingCapability
              organizationId={state.chosenOrganizationId}
              cancel={cancel}
            />
          ) : (
            <Loader />
          ),
      ],
      [
        'succeeded',
        () => (
          <RegisterStateSucceeded
            displayedIdentifier={displayedIdentifier}
            token={state.undeliveredToken}
          />
        ),
      ],
      ['failed', () => <RegisterStateFailed cancel={cancel} />],
    ]);

    const renderer = renderers.get(state.registrationRequestStatus);
    if (renderer) {
      return renderer();
    }

    const shouldRegisterOnSameOrganization =
      isPlatformRegistered.status === PlatformRegistrationStatus.Unregistered &&
      userOrganizationsQueryData.userOrganizations.length > 2;
    if (shouldRegisterOnSameOrganization) {
      return (
        <RegisterStateTooManyOrganizations
          cancel={cancel}
          confirm={() => register(isPlatformRegistered.organization?.id ?? '')}
          displayedIdentifier={displayedIdentifier}
          platformTitle={isPlatformRegistered.platformTitle ?? ''}
        />
      );
    }

    if (
      targeted &&
      isPlatformRegistered.status === PlatformRegistrationStatus.Registered &&
      isPlatformRegistered.organization
    ) {
      const organization = isPlatformRegistered.organization;
      // Named only when it is one of the user's organizations: the Hub does
      // not tell who registered a platform to anyone else.
      const organizationName =
        userOrganizationsQueryData.userOrganizations.find(
          ({ id }) => id === organization.id
        )?.name ?? '-';
      return (
        <RegisterStateConfirmReregistration
          cancel={cancel}
          confirm={() => register(organization.id)}
          displayedIdentifier={displayedIdentifier}
          platformTitle={platform.title}
          platformUrl={platform.url}
          organizationName={organizationName}
        />
      );
    }

    if (
      isPlatformRegistered.status ===
        PlatformRegistrationStatus.NeverRegistered ||
      isPlatformRegistered.status === PlatformRegistrationStatus.Unregistered
    ) {
      return (
        <RegisterOrganizationForm
          userOrganizationsQueryData={userOrganizationsQueryData}
          defaultPlatformName={platform.title}
          destinationUrl={targeted ? platform.url : undefined}
          cancel={cancel}
          confirm={register}
        />
      );
    }

    return <Loader />;
  }, [
    cancel,
    state.chosenOrganizationId,
    state.registrationRequestStatus,
    platform.title,
    platform.url,
    targeted,
    state.undeliveredToken,
    displayedIdentifier,
    isPlatformRegistered,
    register,
    userOrganizationsQueryData,
  ]);
};
