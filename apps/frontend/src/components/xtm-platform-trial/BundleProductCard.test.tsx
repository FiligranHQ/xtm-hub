import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BundleProductCard } from './BundleProductCard';
import {
  XtmoneIntegrationStatus,
  XtmoneStatusState,
} from './useXtmoneIntegrationStatus';
import { XtmPlatformBundleProduct } from './xtm-platform-bundle.types';

const buildProduct = (
  overrides: Partial<XtmPlatformBundleProduct> = {}
): XtmPlatformBundleProduct => ({
  platform_identifier:
    'opencti' as XtmPlatformBundleProduct['platform_identifier'],
  service_instance_id: 'service-instance-1',
  name: 'OpenCTI Instance',
  connectivity_status:
    'active' as XtmPlatformBundleProduct['connectivity_status'],
  last_connectivity_check: '2026-07-30T12:31:53+00:00',
  url: 'https://opencti.example.io',
  roles: [{ id: 'group-1', name: 'Admin' }],
  ...overrides,
});

const buildXtmoneStatus = (connected: boolean): XtmoneIntegrationStatus => ({
  opencti: {
    status: connected ? 'connected' : 'disconnected',
    connected,
    last_checked_at: '2026-07-30T12:31:53+00:00',
  },
  openaev: {
    status: connected ? 'connected' : 'disconnected',
    connected,
    last_checked_at: '2026-07-30T12:31:53+00:00',
  },
  linked: connected,
  last_checked_at: '2026-07-30T12:31:53+00:00',
});

const emptyXtmoneStatus: XtmoneStatusState = {
  data: undefined,
  isLoading: false,
  isError: false,
  hasUrl: false,
};

const connectedXtmoneStatus: XtmoneStatusState = {
  data: buildXtmoneStatus(true),
  isLoading: false,
  isError: false,
  hasUrl: true,
};

describe('BundleProductCard', () => {
  it('renders the product name and role', () => {
    testRender(
      <BundleProductCard
        product={buildProduct()}
        xtmoneStatus={emptyXtmoneStatus}
        canManage={false}
      />
    );

    expect(screen.getByText('OpenCTI')).toBeInTheDocument();
    expect(screen.getByText('OpenCTI Instance')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it.each`
    status        | expected
    ${'active'}   | ${'StatusActive'}
    ${'inactive'} | ${'ConnectionLost'}
    ${null}       | ${'StatusUnavailable'}
  `(
    'renders "$expected" for connectivity_status "$status" from the platform configuration',
    ({ status, expected }) => {
      testRender(
        <BundleProductCard
          product={buildProduct({ connectivity_status: status })}
          xtmoneStatus={emptyXtmoneStatus}
          canManage={false}
        />
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
    }
  );

  it('renders the no-role fallback and disables access when the user has no role', () => {
    testRender(
      <BundleProductCard
        product={buildProduct({ roles: [] })}
        xtmoneStatus={emptyXtmoneStatus}
        canManage={false}
      />
    );

    expect(screen.getByText('NoRole NoRoleHint')).toBeInTheDocument();
    expect(screen.getByText('AccessProduct').closest('button')).toBeDisabled();
  });

  it('renders the XTM One connection rows from the integration status', () => {
    testRender(
      <BundleProductCard
        product={buildProduct({
          platform_identifier:
            'xtmone' as XtmPlatformBundleProduct['platform_identifier'],
          name: 'XTM One Instance',
          url: 'https://xtmone.example.io',
        })}
        xtmoneStatus={connectedXtmoneStatus}
        canManage={false}
      />
    );

    expect(screen.getByText('ConnectionOpencti:')).toBeInTheDocument();
    expect(screen.getByText('ConnectionOpenaev:')).toBeInTheDocument();
    expect(screen.getByText('ProductName:')).toBeInTheDocument();
    expect(screen.getByText('XTM One Instance')).toBeInTheDocument();
  });

  it('hides the edit-name button when the user cannot manage', () => {
    testRender(
      <BundleProductCard
        product={buildProduct()}
        xtmoneStatus={emptyXtmoneStatus}
        canManage={false}
      />
    );

    expect(screen.queryByLabelText('EditName')).not.toBeInTheDocument();
  });

  it('shows the edit-name button when the user can manage', () => {
    testRender(
      <BundleProductCard
        product={buildProduct()}
        xtmoneStatus={emptyXtmoneStatus}
        canManage={true}
      />
    );

    expect(screen.getByLabelText('EditName')).toBeInTheDocument();
  });

  it('shows the edit-name button on the XTM One card when the user can manage', () => {
    testRender(
      <BundleProductCard
        product={buildProduct({
          platform_identifier:
            'xtmone' as XtmPlatformBundleProduct['platform_identifier'],
          name: 'XTM One Instance',
        })}
        xtmoneStatus={emptyXtmoneStatus}
        canManage={true}
      />
    );

    expect(screen.getByLabelText('EditName')).toBeInTheDocument();
  });
});
