import { ServiceListIntegrationDropdown } from '@/components/service/components/header/ServiceListIntegrationDropdown';
import testRender from '@/utils/test/test-render';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { screen, waitFor } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { describe, expect, it, vi } from 'vitest';

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
    const dropdownButton = await queryByText(
      'Service.OpenctiIntegrations.AddService'
    );
    expect(dropdownButton).toBeInTheDocument();
  });

  it('opens the dropdown and shows the label after clicking the trigger', async () => {
    // Given
    const environment = createMockEnvironment();
    const onIntegrationTypeSelect = vi.fn();

    const { user, getByRole } = testRender(
      <ServiceListIntegrationDropdown
        onIntegrationTypeSelect={onIntegrationTypeSelect}
      />,
      { relayConfig: environment }
    );

    // When
    await user.click(
      getByRole('button', { name: 'Service.OpenctiIntegrations.AddService' })
    );

    // Then
    await waitFor(() => {
      expect(
        screen.getByText('Service.OpenctiIntegrations.IntegrationType')
      ).toBeInTheDocument();
    });
  });

  it.each`
    label                                                         | expectedEnum
    ${'Service.OpenctiIntegrations.Type.csv_feed'}                | ${IntegrationTypeEnum.CSV_FEED}
    ${'Service.OpenctiIntegrations.Type.taxii_feed'}              | ${IntegrationTypeEnum.TAXII_FEED}
    ${'Service.OpenctiIntegrations.Type.stream'}                  | ${IntegrationTypeEnum.STREAM}
    ${'Service.OpenctiIntegrations.Type.third_party_integration'} | ${IntegrationTypeEnum.THIRD_PARTY_INTEGRATION}
    ${'Service.OpenctiIntegrations.Type.rss_feed'}                | ${IntegrationTypeEnum.RSS_FEED}
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
        screen.getByRole('button', {
          name: 'Service.OpenctiIntegrations.AddService',
        })
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
      screen.getByRole('button', {
        name: 'Service.OpenctiIntegrations.AddService',
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText('Service.OpenctiIntegrations.Type.json_feed')
      ).toBeInTheDocument();
    });

    const disabledItem = screen.getByText(
      'Service.OpenctiIntegrations.Type.json_feed'
    );

    // Then
    expect(disabledItem.closest('[aria-disabled="true"]')).toBeInTheDocument();

    await user.click(disabledItem);
    expect(onIntegrationTypeSelect).not.toHaveBeenCalled();
  });
});
