import { PlatformInformation } from '@/components/service/registration/PlatformInformation';
import { basePlatform } from '@/components/service/registration/registered-platform.fixtures';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import testRender from '@/utils/test/test-render';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import {
  PortalCapability,
  useRegisteredSaasPlatformDataQuery,
} from '@graphql/generated';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const HOSTNAME = 'my-platform.filigran.io';

const platform: registeredPlatformByServiceInstanceId_fragment$data =
  basePlatform;

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal()),
  useFragment: () => platform,
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();
  const useRegisteredSaasPlatformDataQuery = Object.assign(vi.fn(), {
    getKey: actual.useRegisteredSaasPlatformDataQuery.getKey,
  });
  return { ...actual, useRegisteredSaasPlatformDataQuery };
});

const mockSaasPlatformDataQuery = ({
  isPending = false,
}: { isPending?: boolean } = {}) =>
  vi.mocked(useRegisteredSaasPlatformDataQuery).mockReturnValue({
    data: isPending
      ? undefined
      : {
          registeredSaasPlatformData: {
            metadata: {
              hostname: HOSTNAME,
              plan: null,
              start_date: null,
              end_date: null,
              region: null,
            },
          },
        },
    isPending,
  } as ReturnType<typeof useRegisteredSaasPlatformDataQuery>);

const renderInformation = ({
  isSaas = true,
  capabilities = [PortalCapability.ReadSaasMetrics],
}: { isSaas?: boolean; capabilities?: PortalCapability[] } = {}) =>
  testRender(
    <PlatformInformation
      registeredPlatform={platform}
      serviceInstanceId={platform.service_instance_id}
      isSaas={isSaas}
    />,
    { me: { capabilities: capabilities.map((name) => ({ name })) } }
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PlatformInformation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useIsFeatureEnabled).mockReturnValue(true);
    mockSaasPlatformDataQuery();
  });

  it('should display the platform information heading', () => {
    // Given / When
    renderInformation();

    // Then
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Register.Details.PlatformInformation',
      })
    ).toBeInTheDocument();
  });

  it('should display the registration details of the platform', () => {
    // Given / When
    renderInformation();

    // Then
    expect(screen.getByText(platform.url)).toBeInTheDocument();
  });

  it('should display the SaaS subscription metadata of the platform when SAAS_METRICS is enabled', () => {
    // Given / When
    renderInformation();

    // Then
    expect(screen.getByText(HOSTNAME)).toBeInTheDocument();
  });

  it('should not display the SaaS subscription metadata of the platform when SAAS_METRICS is disabled', () => {
    // Given SAAS_METRICS is disabled
    vi.mocked(useIsFeatureEnabled).mockReturnValue(false);

    // When
    renderInformation();

    // Then
    expect(screen.queryByText(HOSTNAME)).not.toBeInTheDocument();
    expect(screen.getByText(platform.url)).toBeInTheDocument();
  });

  it('should query the SaaS platform data of a SaaS platform when SAAS_METRICS is enabled', () => {
    // Given / When
    renderInformation();

    // Then
    expect(useRegisteredSaasPlatformDataQuery).toHaveBeenLastCalledWith(
      expect.anything(),
      { input: { service_instance_id: platform.service_instance_id } },
      expect.objectContaining({ enabled: true })
    );
  });

  it('should not query the SaaS platform data when SAAS_METRICS is disabled', () => {
    // Given SAAS_METRICS is disabled
    vi.mocked(useIsFeatureEnabled).mockReturnValue(false);

    // When
    renderInformation();

    // Then
    expect(useRegisteredSaasPlatformDataQuery).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ enabled: false })
    );
  });

  it('should neither query nor display the SaaS subscription metadata when the platform is not SaaS', () => {
    // Given / When
    renderInformation({ isSaas: false });

    // Then
    expect(useRegisteredSaasPlatformDataQuery).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ enabled: false })
    );
    expect(
      screen.queryByText('Register.Metrics.Metadata.Hostname:')
    ).not.toBeInTheDocument();
  });

  it.each([[PortalCapability.Bypass], [PortalCapability.ReadSaasMetrics]])(
    'should query and display the SaaS subscription metadata when the user has %s',
    (capability) => {
      // Given / When
      renderInformation({ capabilities: [capability] });

      // Then
      expect(useRegisteredSaasPlatformDataQuery).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ enabled: true })
      );
      expect(screen.getByText(HOSTNAME)).toBeInTheDocument();
    }
  );

  it.each([[[]], [[PortalCapability.ReadTrials]]])(
    'should neither query nor display the SaaS subscription metadata when the user capabilities are %j',
    (capabilities) => {
      // Given / When
      renderInformation({ capabilities });

      // Then
      expect(useRegisteredSaasPlatformDataQuery).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ enabled: false })
      );
      expect(
        screen.queryByText('Register.Metrics.Metadata.Hostname:')
      ).not.toBeInTheDocument();
      expect(screen.getByText(platform.url)).toBeInTheDocument();
    }
  );

  it('should display the SaaS subscription metadata as loading while the query is pending', () => {
    // Given
    mockSaasPlatformDataQuery({ isPending: true });

    // When
    renderInformation();

    // Then
    expect(
      screen.getByText('Register.Metrics.Metadata.Hostname:').closest('section')
    ).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText(HOSTNAME)).not.toBeInTheDocument();
  });
});
