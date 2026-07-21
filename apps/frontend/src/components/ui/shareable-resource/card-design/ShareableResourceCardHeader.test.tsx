import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShareableResourceCardHeader } from './ShareableResourceCardHeader';

vi.mock('@/components/service/integrations/Integration.utils', () => ({
  getIntegrationSubTypeMetadata: () => ({ label: 'Subtype label' }),
}));

vi.mock(
  '@/components/ui/shareable-resource/card-design/ShareableResourceCardImage',
  () => ({
    ShareableResourceCardImage: ({
      serviceInstanceId,
    }: {
      serviceInstanceId: string;
    }) => <div data-testid="card-image">{serviceInstanceId}</div>,
  })
);

vi.mock(
  '@/components/ui/shareable-resource/card-design/ShareableResourceCardIcon',
  () => ({
    ShareableResourceCardIcon: ({
      shouldDisplayBothIcons,
    }: {
      shouldDisplayBothIcons: boolean;
    }) => <div data-testid="card-icon">{String(shouldDisplayBothIcons)}</div>,
  })
);

vi.mock(
  '@/components/service/document/ui/ShareableResourceEntityTypes',
  () => ({
    ShareableResourceEntityTypes: () => <div data-testid="entity-types" />,
  })
);

vi.mock('@/components/ui/BadgeOverflowCounter', () => ({
  __esModule: true,
  default: () => <div data-testid="use-cases" />,
}));

describe('ShareableResourceCardHeader', () => {
  const baseDocument = {
    name: 'Short name',
    use_cases: [],
  };

  it('renders connector branch with subtype metadata and entity types', () => {
    const { container } = testRender(
      <ShareableResourceCardHeader
        document={
          { ...baseDocument, integration_subtype: 'EXTERNAL_IMPORT' } as never
        }
        serviceInstanceId="svc-id"
        shouldDisplayBothIcons
        isConnector
      />
    );

    expect(screen.getByTestId('card-image')).toHaveTextContent('svc-id');
    expect(screen.getByText('Subtype label')).toBeInTheDocument();
    expect(screen.getByTestId('entity-types')).toBeInTheDocument();
    expect(screen.queryByTestId('use-cases')).not.toBeInTheDocument();
    expect(container.querySelector('h2')).toHaveClass('md:text-lg');
  });

  it('renders non connector branch with use-cases badges', () => {
    testRender(
      <ShareableResourceCardHeader
        document={baseDocument as never}
        serviceInstanceId="svc-id"
        shouldDisplayBothIcons={false}
        isConnector={false}
      />
    );

    expect(screen.queryByText('Subtype label')).not.toBeInTheDocument();
    expect(screen.getByTestId('use-cases')).toBeInTheDocument();
    expect(screen.queryByTestId('entity-types')).not.toBeInTheDocument();
  });
});
