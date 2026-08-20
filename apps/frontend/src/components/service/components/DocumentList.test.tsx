import testRender from '@/utils/test/test-render';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DocumentList from './DocumentList';

vi.mock('@/components/service/components/ServiceContext', () => ({
  useServiceContext: () => ({
    translationKey: 'Service.Connector',
    serviceInstance: {
      id: 'service-instance-1',
      slug: 'my-service',
      service_definition: {
        identifier: 'opencti',
      },
    },
    setIntegrationType: vi.fn(),
  }),
}));

describe('DocumentList', () => {
  it('renders one service card per document with expected URLs', () => {
    const documents = [
      {
        id: 'doc-1',
        slug: 'first-document',
        name: 'First document',
        type: 'opencti_integration',
        short_description: 'Description 1',
        use_cases: [],
      },
      {
        id: 'doc-2',
        slug: 'second-document',
        name: 'Second document',
        type: 'opencti_integration',
        short_description: 'Description 2',
        use_cases: [],
      },
    ] as documentItem_fragment$data[];

    testRender(<DocumentList documents={documents} />);

    expect(screen.getByText('First document')).toBeInTheDocument();
    expect(screen.getByText('Second document')).toBeInTheDocument();

    const detailLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('/app/service/'));

    expect(detailLinks).toHaveLength(2);
    expect(detailLinks[0]).toHaveAttribute(
      'href',
      '/app/service/opencti/service-instance-1/doc-1'
    );
    expect(detailLinks[1]).toHaveAttribute(
      'href',
      '/app/service/opencti/service-instance-1/doc-2'
    );
  });
});
