import { ServiceDelete } from '@/components/service/components/service-delete';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import testRender from '@/utils/test/test-render';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { screen, within } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { describe, expect, it, vi } from 'vitest';

describe('ServiceDelete', () => {
  it.each`
    userCanDelete | shouldRender
    ${true}       | ${true}
    ${false}      | ${false}
    ${undefined}  | ${false}
  `(
    'renders delete trigger according to userCanDelete=$userCanDelete',
    ({ userCanDelete, shouldRender }) => {
      // Given
      const environment = createMockEnvironment();

      const { queryByRole } = testRender(
        <ServiceDelete
          userCanDelete={userCanDelete}
          serviceName={'My service'}
          integrationType={IntegrationTypeEnum.CSV_FEED}
        />,
        { relayConfig: environment }
      );

      // Then
      const deleteButton = queryByRole('button', { name: 'Delete' });

      if (shouldRender) {
        expect(deleteButton).toMatchObject({ textContent: 'Delete' });
        return;
      }

      expect(deleteButton).toBeNull();
    }
  );

  it.each`
    shareableResourceType                             | type
    ${IntegrationTypeEnum.CSV_FEED}                   | ${'CSV Feed'}
    ${IntegrationTypeEnum.CONNECTOR}                  | ${'Connector'}
    ${IntegrationTypeEnum.TAXII_FEED}                 | ${'TAXII Feed'}
    ${IntegrationTypeEnum.RSS_FEED}                   | ${'RSS Feed'}
    ${IntegrationTypeEnum.STREAM}                     | ${'Stream'}
    ${IntegrationTypeEnum.THIRD_PARTY_INTEGRATION}    | ${'Third Party Integration'}
    ${ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD} | ${'dashboard'}
    ${ShareableResourceType.OPENAEV_SCENARIO}         | ${'scenario'}
  `(
    'maps deletion texts for shareableResourceType=shareableResourceType',
    async ({ shareableResourceType, type }) => {
      // Given
      const environment = createMockEnvironment();
      const serviceName = 'another service name';
      const { user } = testRender(
        <ServiceDelete
          userCanDelete={true}
          serviceName={serviceName}
          integrationType={shareableResourceType}
        />,
        { relayConfig: environment }
      );

      // When
      await user.click(screen.getByRole('button', { name: 'Delete' }));

      // Then
      expect(
        await screen.findByText(
          `Are you sure you want to delete the ${type} ${serviceName}?`
        )
      ).toBeInTheDocument();
    }
  );

  it('calls onDelete when confirming deletion', async () => {
    // Given
    const environment = createMockEnvironment();
    const onDelete = vi.fn();
    const { user } = testRender(
      <ServiceDelete
        userCanDelete={true}
        serviceName={'Connector A'}
        integrationType={IntegrationTypeEnum.CONNECTOR}
        onDelete={onDelete}
      />,
      { relayConfig: environment }
    );

    // When
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    const alertDialog = await screen.findByRole('alertdialog');
    await user.click(
      within(alertDialog).getByRole('button', { name: 'Delete' })
    );

    // Then
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith();
  });
});
