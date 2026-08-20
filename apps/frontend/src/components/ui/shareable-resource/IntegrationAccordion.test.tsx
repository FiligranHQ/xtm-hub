import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import IntegrationAccordion from './IntegrationAccordion';

describe('IntegrationAccordion', () => {
  const integrationType = 'connector';
  const count = 2;
  const childrenText = 'accordion-child-content';
  const triggerLabelPattern = new RegExp(
    `Service\\.OpenctiIntegrations\\.Type\\.${integrationType}`
  );

  it('should display the accordion label and count when rendered', () => {
    // Given
    // When
    testRender(
      <IntegrationAccordion
        integrationType={integrationType}
        count={count}>
        <div>{childrenText}</div>
      </IntegrationAccordion>
    );

    // Then
    expect(
      screen.getByRole('button', { name: triggerLabelPattern })
    ).toBeInTheDocument();
    expect(screen.getByText(String(count))).toBeInTheDocument();
  });

  it('should display the children when the accordion is opened', async () => {
    // Given
    const { user } = testRender(
      <IntegrationAccordion
        integrationType={integrationType}
        count={count}>
        <div>{childrenText}</div>
      </IntegrationAccordion>
    );

    // When
    await user.click(screen.getByRole('button', { name: triggerLabelPattern }));

    // Then
    expect(screen.getByText(childrenText)).toBeInTheDocument();
  });
});
