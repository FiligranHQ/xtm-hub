import {
  LastDeployedOverview,
  LastDeployedPlatform,
} from '@/components/homepage/LastDeployedResourcesSection';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LastDeployedResourcesClient from './LastDeployedResourcesClient';

const buildResource = () => ({
  document: {
    __typename: 'CustomView',
    id: 'doc-1',
    name: 'My Custom View',
    short_description: null,
    type: 'opencti_custom_view',
    active: true,
    slug: 'my-custom-view',
    service_instance_id: 'svc-1',
    children_documents: [],
    use_cases: [
      { id: 'uc-1', name: 'Malware Analysis' },
      { id: 'uc-2', name: 'Threat Hunting' },
      { id: 'uc-3', name: 'Incident Response' },
    ],
  },
  deployedAt: '2026-07-03T10:00:00.000Z',
  deployedBy: {
    id: 'user-1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@filigran.io',
    picture: null,
  },
});

const buildPlatform = (
  id: string,
  title: string,
  resources: unknown[],
  productName = 'OpenCTI'
): LastDeployedPlatform => ({
  id,
  title,
  productName,
  overview: { resources } as unknown as LastDeployedOverview,
});

const renderClient = (platforms: LastDeployedPlatform[]) =>
  testRender(<LastDeployedResourcesClient platforms={platforms} />);

describe('LastDeployedResourcesClient', () => {
  it('renders the title and deployed resource rows', () => {
    renderClient([
      buildPlatform('platform-1', 'OpenCTI Platform', [buildResource()]),
    ]);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('OpenCTI - OpenCTI Platform')).toBeInTheDocument();
    expect(screen.getByText('My Custom View')).toBeInTheDocument();
    expect(screen.getByText('Malware Analysis')).toBeInTheDocument();
    expect(screen.queryByText('Threat Hunting')).toBeNull();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getByText('On')).toBeInTheDocument();
    expect(screen.getByText('By')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders the empty state image when there are no deployed resources', () => {
    renderClient([buildPlatform('platform-1', 'OpenCTI Platform', [])]);

    // In the test harness next-intl returns the message key as the alt text
    expect(screen.getByRole('img', { name: 'ImageAlt' })).toBeInTheDocument();
    // Empty state hides the title and the product select
    expect(screen.queryByText('Title')).toBeNull();
    expect(screen.queryByText('By')).toBeNull();
  });

  it('only lists platforms that have deployed resources', () => {
    renderClient([
      buildPlatform('platform-empty', 'OpenAEV Platform', [], 'OpenAEV'),
      buildPlatform('platform-1', 'OpenCTI Platform', [buildResource()]),
    ]);

    expect(screen.getByText('My Custom View')).toBeInTheDocument();
    expect(screen.getByText('OpenCTI - OpenCTI Platform')).toBeInTheDocument();
    expect(screen.queryByText('OpenAEV - OpenAEV Platform')).toBeNull();
  });
});
