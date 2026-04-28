import testRender from '@/utils/test/test-render';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { screen, waitFor } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { ServiceListIntegrationDropdown } from './ServiceListIntegrationDropdown';

describe('Button with dropdown to add any kind of integration in the lib', () => {
  it('renders the trigger button', async () => {
    // Given
    const environment = createMockEnvironment();
    const onIntegrationTypeSelect = vi.fn();

    // The component is rendered
    const { queryByText } = testRender(
      <ServiceListIntegrationDropdown
        onIntegrationTypeSelect={onIntegrationTypeSelect}
      />,
      {
        relayConfig: environment,
      }
    );

    // Then
    const dropdownButton = await queryByText('Add new Integration');
    expect(dropdownButton).toBeInTheDocument();
  });

  it('opens the dropdown and shows the label after clicking the trigger', async () => {
    // Given
    const environment = createMockEnvironment();
    const onIntegrationTypeSelect = vi.fn();

    const { user, getByRole, getByText } = testRender(
      <ServiceListIntegrationDropdown
        onIntegrationTypeSelect={onIntegrationTypeSelect}
      />,
      { relayConfig: environment }
    );

    // When
    await user.click(getByRole('button', { name: 'Add new Integration' }));

    // Then
    await waitFor(() => {
      expect(getByText('Integration type')).toBeInTheDocument();
    });
  });

  it.each`
    label                         | expectedEnum
    ${'CSV Feeds'}                | ${IntegrationTypeEnum.CSV_FEED}
    ${'TAXII Feeds'}              | ${IntegrationTypeEnum.TAXII_FEED}
    ${'OpenCTI Streams'}          | ${IntegrationTypeEnum.STREAM}
    ${'Third party integrations'} | ${IntegrationTypeEnum.THIRD_PARTY_INTEGRATION}
    ${'RSS Feeds'}                | ${IntegrationTypeEnum.RSS_FEED}
  `(
    'clicking "$label" calls onIntegrationTypeSelect with $expectedEnum',
    async ({ label, expectedEnum }) => {
      // Given
      const environment = createMockEnvironment();
      const onIntegrationTypeSelect = vi.fn();

      const { user } = testRender(
        <ServiceListIntegrationDropdown
          onIntegrationTypeSelect={onIntegrationTypeSelect}
        />,
        { relayConfig: environment }
      );

      // When
      await user.click(
        screen.getByRole('button', { name: 'Add new Integration' })
      );

      await screen.findByText(label);
      await user.click(screen.getByText(label));

      // Then
      expect(onIntegrationTypeSelect).toHaveBeenCalledOnce();
      expect(onIntegrationTypeSelect).toHaveBeenCalledWith(expectedEnum);
    }
  );

  it('the "JSON Feeds (coming soon)" item is disabled and does not call onIntegrationTypeSelect when clicked', async () => {
    // Given
    const environment = createMockEnvironment();
    const onIntegrationTypeSelect = vi.fn();

    const { user } = testRender(
      <ServiceListIntegrationDropdown
        onIntegrationTypeSelect={onIntegrationTypeSelect}
      />,
      { relayConfig: environment }
    );

    // When
    await user.click(
      screen.getByRole('button', { name: 'Add new Integration' })
    );

    await waitFor(() => {
      expect(screen.getByText('JSON Feeds (coming soon)')).toBeInTheDocument();
    });

    const disabledItem = screen.getByText('JSON Feeds (coming soon)');

    // Then
    expect(disabledItem.closest('[aria-disabled="true"]')).toBeInTheDocument();

    await user.click(disabledItem);
    expect(onIntegrationTypeSelect).not.toHaveBeenCalled();
  });
});
