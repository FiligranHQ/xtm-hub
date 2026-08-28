import { PrivateXtmPlatformTrialPanel } from '@/components/service/trial-instances/xtm-platform-trial/PrivateXtmPlatformTrialPanel';
import testRender from '@/utils/test/test-render';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestSource,
  DeploymentRequestUseCase,
  PlatformIdentifier,
  PlatformTrialStatusQueryVariables,
} from '@graphql/generated';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const graphqlMocks = vi.hoisted(() => ({
  usePlatformTrialStatusQuery: Object.assign(vi.fn(), {
    getKey: vi.fn((variables: PlatformTrialStatusQueryVariables) => [
      'PlatformTrialStatus',
      variables,
    ]),
    getRootKey: vi.fn(() => ['PlatformTrialStatus']),
  }),
  useCreateDeploymentRequestMutation: vi.fn(),
  mutate: vi.fn(),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();

  return {
    ...actual,
    usePlatformTrialStatusQuery: graphqlMocks.usePlatformTrialStatusQuery,
    useCreateDeploymentRequestMutation:
      graphqlMocks.useCreateDeploymentRequestMutation,
  };
});

vi.mock('@/lib/graphql-client', () => ({
  portalGraphqlClient: { _mock: 'portalGraphqlClient' },
}));

let capturedHandleSubmit:
  | ((values: {
      region: string;
      job_title: string;
      activity_sector: string;
      acceptTerms: boolean;
      use_cases_by_product: {
        platform_identifier: PlatformIdentifier;
        use_case?: DeploymentRequestUseCase;
      }[];
    }) => void)
  | undefined;

vi.mock(
  '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialForm',
  () => ({
    XtmPlatformTrialForm: ({
      handleSubmit,
      hasOngoingStandaloneTrials,
    }: {
      handleSubmit: typeof capturedHandleSubmit;
      hasOngoingStandaloneTrials?: boolean;
    }) => {
      capturedHandleSubmit = handleSubmit;
      return (
        <div data-testid="xtm-platform-trial-form">
          {hasOngoingStandaloneTrials ? 'has-ongoing' : 'no-ongoing'}
        </div>
      );
    },
    xtmPlatformTrialFormSchema: {},
  })
);

const allowedMe = { selected_org_capabilities: ['ADMINISTRATE_ORGANIZATION'] };

describe('PrivateXtmPlatformTrialPanel', () => {
  beforeEach(() => {
    graphqlMocks.usePlatformTrialStatusQuery.mockReset();
    graphqlMocks.useCreateDeploymentRequestMutation.mockReset();
    graphqlMocks.mutate.mockReset();
    graphqlMocks.useCreateDeploymentRequestMutation.mockReturnValue({
      mutate: graphqlMocks.mutate,
    });
    capturedHandleSubmit = undefined;
  });

  it('renders nothing while the trial status query is loading', () => {
    graphqlMocks.usePlatformTrialStatusQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isPending: true,
      isError: false,
    });

    const { container } = testRender(<PrivateXtmPlatformTrialPanel />, {
      me: allowedMe,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the personal space message when the organization is a personal space', () => {
    graphqlMocks.usePlatformTrialStatusQuery.mockReturnValue({
      data: { platformTrialStatus: { ongoingStandaloneTrials: [] } },
      isLoading: false,
      isPending: false,
      isError: false,
    });

    testRender(<PrivateXtmPlatformTrialPanel />, {
      me: {
        ...allowedMe,
        selected_organization_id: 'mock_id',
        organizations: [
          { id: 'mock_id', name: 'Personal Space', personal_space: true },
        ],
      },
    });

    expect(
      screen.getByText('Service.Trials.XtmPlatform.Page.PersonalSpace.Title')
    ).toBeInTheDocument();
  });

  it('renders the not-admin message when the user is not allowed to request a trial', () => {
    graphqlMocks.usePlatformTrialStatusQuery.mockReturnValue({
      data: { platformTrialStatus: { ongoingStandaloneTrials: [] } },
      isLoading: false,
      isPending: false,
      isError: false,
    });

    testRender(<PrivateXtmPlatformTrialPanel />, {
      me: { selected_org_capabilities: [] },
    });

    expect(
      screen.getByText('Service.Trials.XtmPlatform.Page.NotAdmin.Title')
    ).toBeInTheDocument();
  });

  it('renders the form without the ongoing trial flag when there are no ongoing standalone trials', () => {
    graphqlMocks.usePlatformTrialStatusQuery.mockReturnValue({
      data: { platformTrialStatus: { ongoingStandaloneTrials: [] } },
      isLoading: false,
      isPending: false,
      isError: false,
    });

    testRender(<PrivateXtmPlatformTrialPanel />, { me: allowedMe });

    expect(screen.getByTestId('xtm-platform-trial-form')).toHaveTextContent(
      'no-ongoing'
    );
  });

  it('renders the form with the ongoing trial flag when there are ongoing standalone trials', () => {
    graphqlMocks.usePlatformTrialStatusQuery.mockReturnValue({
      data: {
        platformTrialStatus: {
          ongoingStandaloneTrials: [PlatformIdentifier.Opencti],
        },
      },
      isLoading: false,
      isPending: false,
      isError: false,
    });

    testRender(<PrivateXtmPlatformTrialPanel />, { me: allowedMe });

    expect(screen.getByTestId('xtm-platform-trial-form')).toHaveTextContent(
      'has-ongoing'
    );
  });

  it('submits a bundle deployment request with only the entries that have a use case', () => {
    graphqlMocks.usePlatformTrialStatusQuery.mockReturnValue({
      data: { platformTrialStatus: { ongoingStandaloneTrials: [] } },
      isLoading: false,
      isPending: false,
      isError: false,
    });

    testRender(<PrivateXtmPlatformTrialPanel />, { me: allowedMe });

    capturedHandleSubmit?.({
      region: 'eu',
      job_title: 'CISO',
      activity_sector: 'IT',
      acceptTerms: true,
      use_cases_by_product: [
        {
          platform_identifier: PlatformIdentifier.Opencti,
          use_case: DeploymentRequestUseCase.ThreatHunting,
        },
        {
          platform_identifier: PlatformIdentifier.Openaev,
          use_case: undefined,
        },
      ],
    });

    expect(graphqlMocks.mutate).toHaveBeenCalledWith({
      input: {
        region: 'eu',
        job_title: 'CISO',
        activity_sector: 'IT',
        use_cases_by_product: [
          {
            platform_identifier: PlatformIdentifier.Opencti,
            use_case: DeploymentRequestUseCase.ThreatHunting,
          },
        ],
        type: DeploymentRequestDeploymentType.Bundle,
        source: DeploymentRequestSource.Xtmhub,
      },
    });
  });
});
