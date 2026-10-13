import { RegistrationDetailsPage } from '@/components/service/registration/RegistrationDetailsPage';
import testRender from '@/utils/test/test-render';
import { act, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const SERVICE_INSTANCE_ID = 'service-instance-1';
const PLATFORM_TITLE = 'ACME OpenCTI';
const NOT_FOUND_ERROR = 'NEXT_NOT_FOUND';

const renderPage = (registeredPlatform: { title: string } | null) => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Query: () => ({ registeredPlatform }),
    })
  );

  return testRender(
    <Suspense fallback={null}>
      <RegistrationDetailsPage
        params={Promise.resolve({ serviceInstanceId: SERVICE_INSTANCE_ID })}
      />
    </Suspense>,
    { relayConfig: environment }
  );
};

describe('RegistrationDetailsPage', () => {
  beforeEach(() => {
    vi.mocked(notFound).mockReset();
  });

  it('should show the platform title in the breadcrumb when the registered platform exists', async () => {
    // Given
    const registeredPlatform = { title: PLATFORM_TITLE };

    // When
    await act(async () => {
      renderPage(registeredPlatform);
    });

    // Then
    expect(
      screen.getByRole('navigation', { name: /breadcrumb/i })
    ).toHaveTextContent(PLATFORM_TITLE);
  });

  it('should throw notFound when there is no registered platform for the service instance', async () => {
    // Given
    vi.mocked(notFound).mockImplementation(() => {
      throw new Error(NOT_FOUND_ERROR);
    });

    // When
    const rendering = act(async () => {
      renderPage(null);
    });

    // Then
    await expect(rendering).rejects.toThrow(NOT_FOUND_ERROR);
  });
});
