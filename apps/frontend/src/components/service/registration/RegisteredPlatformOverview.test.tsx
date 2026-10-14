import { RegisteredPlatformOverview } from '@/components/service/registration/RegisteredPlatformOverview';
import { basePlatform } from '@/components/service/registration/registered-platform.fixtures';
import testRender from '@/utils/test/test-render';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { act, screen, within } from '@testing-library/react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { describe, expect, it, vi } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

let mockPlatformData: registeredPlatformByServiceInstanceId_fragment$data | null;

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal()),
  useLazyLoadQuery: vi.fn(() => ({ registeredPlatform: mockPlatformData })),
  useFragment: () => mockPlatformData,
  useMutation: () => [vi.fn(), false],
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SERVICE_INSTANCE_ID = 'service instance/id';
const NOT_FOUND_ERROR = 'NEXT_NOT_FOUND';

const renderOverview = async (
  platform: registeredPlatformByServiceInstanceId_fragment$data | null
) => {
  mockPlatformData = platform;
  await act(async () => {
    testRender(
      <Suspense>
        <RegisteredPlatformOverview
          params={Promise.resolve({
            serviceInstanceId: encodeURIComponent(SERVICE_INSTANCE_ID),
          })}
        />
      </Suspense>
    );
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('RegisteredPlatformOverview', () => {
  it('should load the registered platform of the decoded service instance id', async () => {
    // Given / When
    await renderOverview(basePlatform);

    // Then
    expect(useLazyLoadQuery).toHaveBeenCalledWith(expect.anything(), {
      input: { service_instance_id: SERVICE_INSTANCE_ID },
    });
  });

  it('should redirect to the not found page when the platform is not visible to the user', async () => {
    // Given
    vi.mocked(notFound).mockImplementationOnce(() => {
      throw new Error(NOT_FOUND_ERROR);
    });
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    // When
    await renderOverview(null).catch(() => undefined);

    // Then
    expect(notFound).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should display the platform title in the breadcrumb', async () => {
    // Given / When
    await renderOverview(basePlatform);

    // Then
    const breadcrumb = screen
      .getByRole('link', { name: 'MenuLinks.Home' })
      .closest('nav') as HTMLElement;
    expect(
      within(breadcrumb).getByText(basePlatform.title)
    ).toBeInTheDocument();
  });

  it('should display the platform header and its information', async () => {
    // Given / When
    await renderOverview(basePlatform);

    // Then
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Register.Details.PlatformInformation',
      })
    ).toBeInTheDocument();
  });
});
