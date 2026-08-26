import { TrialsProductValues } from '@/components/trials/tab/TrialsProductValues';
import testRender from '@/utils/test/test-render';
import {
  DeploymentRequestHubStatus,
  PlatformIdentifier,
  TrialsProductFragment,
} from '@graphql/generated';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const OPENCTI_PLATFORM_ID = 'opencti-tenant';

const makeProduct = (
  platformIdentifier: PlatformIdentifier,
  platformId: string | null
): TrialsProductFragment => ({
  id: `product-${platformIdentifier}`,
  platform_identifier: platformIdentifier,
  hub_status: DeploymentRequestHubStatus.Active,
  platform_id: platformId,
  platform_url: null,
  service_instance_id: `instance-${platformIdentifier}`,
});

describe('TrialsProductValues', () => {
  it('should only list the products holding a value, prefixed by their name', () => {
    // Given
    const products = [
      makeProduct(PlatformIdentifier.Opencti, OPENCTI_PLATFORM_ID),
      makeProduct(PlatformIdentifier.Openaev, null),
    ];

    // When
    testRender(
      <TrialsProductValues
        products={products}
        valueOf={(product) => product.platform_id}
      />
    );

    // Then
    expect(screen.getByText(OPENCTI_PLATFORM_ID)).toBeInTheDocument();
    expect(screen.getByText('OPENCTI')).toBeInTheDocument();
    expect(screen.queryByText('OPENAEV')).not.toBeInTheDocument();
  });

  it('should fall back to a dash when no product holds a value', () => {
    // Given
    const products = [makeProduct(PlatformIdentifier.Opencti, null)];

    // When
    testRender(
      <TrialsProductValues
        products={products}
        valueOf={(product) => product.platform_id}
      />
    );

    // Then
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.queryByText('OPENCTI')).not.toBeInTheDocument();
  });
});
