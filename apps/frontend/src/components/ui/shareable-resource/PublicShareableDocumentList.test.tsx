import { ServiceListDisplayModeEnum } from '@/components/service/components/header/ServiceListHeader';
import testRender from '@/utils/test/test-render';
import { publicDocumentListItemFragment$data } from '@generated/publicDocumentListItemFragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PublicShareableDocumentList } from './PublicShareableDocumentList';

describe('PublicShareableDocumentList', () => {
  const serviceInstance = {
    id: 'service-1',
    slug: 'my-service',
  } as seoServiceInstanceFragment$data;

  const documents = [
    {
      id: 'doc-1',
      slug: 'connector-doc',
      name: 'Connector document',
      type: 'opencti_custom_dashboard',
      short_description: 'Connector description',
      use_cases: [],
    },
    {
      id: 'doc-2',
      slug: 'dashboard-doc',
      name: 'Dashboard document',
      type: 'opencti_custom_dashboard',
      short_description: 'Dashboard description',
      use_cases: [],
    },
  ] as publicDocumentListItemFragment$data[];

  it('renders one public card per document with expected public URLs in tab mode', () => {
    testRender(
      <PublicShareableDocumentList
        documents={documents}
        serviceInstance={serviceInstance}
        baseUrl="https://xtm.local"
        displayMode={ServiceListDisplayModeEnum.Tab}
      />
    );

    expect(screen.getByText('Connector document')).toBeInTheDocument();
    expect(screen.getByText('Dashboard document')).toBeInTheDocument();

    const detailLinks = screen
      .getAllByRole('link')
      .filter((link) =>
        link.getAttribute('href')?.startsWith('/en/cybersecurity-solutions/')
      );

    expect(detailLinks).toHaveLength(2);
    expect(detailLinks[0]).toHaveAttribute(
      'href',
      '/en/cybersecurity-solutions/my-service/connector-doc'
    );
    expect(detailLinks[1]).toHaveAttribute(
      'href',
      '/en/cybersecurity-solutions/my-service/dashboard-doc'
    );
  });

  it('renders list mode without public detail card links', () => {
    testRender(
      <PublicShareableDocumentList
        documents={documents}
        serviceInstance={serviceInstance}
        baseUrl="https://xtm.local"
        displayMode={ServiceListDisplayModeEnum.List}
      />
    );

    expect(screen.getByText('Connector document')).toBeInTheDocument();
    expect(screen.getByText('Dashboard document')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Connector document' })
    ).toBeNull();
    expect(
      screen.queryByRole('link', { name: 'Dashboard document' })
    ).toBeNull();
  });
});
