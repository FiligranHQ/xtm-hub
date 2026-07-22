import testRender from '@/utils/test/test-render';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShareableResourceCardHeader } from './ShareableResourceCardHeader';

vi.mock('@/components/service/integrations/Integration.utils', () => ({
  getIntegrationSubTypeMetadata: () => ({ label: 'Subtype label' }),
}));

vi.mock('@/utils/documents', () => ({
  findDocumentLogo: () => null,
}));

describe('ShareableResourceCardHeader', () => {
  const baseDocument = {
    name: 'Short name',
    use_cases: [],
  };

  it('renders connector branch with subtype metadata', () => {
    const { container } = testRender(
      <ShareableResourceCardHeader
        document={
          {
            ...baseDocument,
            integration_subtype: 'EXTERNAL_IMPORT',
          } as documentItem_fragment$data
        }
        serviceInstanceId="svc-id"
        shouldDisplayBothIcons
        isConnector
      />
    );

    expect(screen.getByText('Short name')).toBeInTheDocument();
    expect(screen.getByText('Subtype label')).toBeInTheDocument();
    expect(container.querySelector('h2')).toHaveClass('md:text-lg');
  });

  it('renders non-connector branch without subtype metadata', () => {
    testRender(
      <ShareableResourceCardHeader
        document={baseDocument as documentItem_fragment$data}
        serviceInstanceId="svc-id"
        shouldDisplayBothIcons={false}
        isConnector={false}
      />
    );

    expect(screen.getByText('Short name')).toBeInTheDocument();
    expect(screen.queryByText('Subtype label')).not.toBeInTheDocument();
  });
});
