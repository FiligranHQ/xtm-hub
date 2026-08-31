import testRender from '@/utils/test/test-render';
import { XtmPlatformBundleProductFragment } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BundleProductCard } from './BundleProductCard';
import {
  XtmoneIntegrationStatus,
  XtmoneStatusState,
} from './useXtmoneIntegrationStatus';

const buildProduct = (
  overrides: Partial<XtmPlatformBundleProductFragment> = {}
): XtmPlatformBundleProductFragment => ({
  platform_identifier:
    'opencti' as XtmPlatformBundleProductFragment['platform_identifier'],
  service_instance_id: 'service-instance-1',
  name: 'OpenCTI Instance',
  connectivity_status:
    'active' as XtmPlatformBundleProductFragment['connectivity_status'],
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

    expect(screen.getByAltText('OpenCTI')).toBeInTheDocument();
    expect(screen.getByText('OpenCTI Instance')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it.each`
    status        | expected
    ${'active'}   | ${'XtmPlatformTrial.Products.StatusActive'}
    ${'inactive'} | ${'XtmPlatformTrial.Products.ConnectionLost'}
    ${null}       | ${'XtmPlatformTrial.Products.StatusUnavailable'}
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

    expect(
      screen.getByText(
        'XtmPlatformTrial.Products.NoRole XtmPlatformTrial.Products.NoRoleHint'
      )
    ).toBeInTheDocument();
    expect(
      screen
        .getByText('XtmPlatformTrial.Products.AccessProduct')
        .closest('button')
    ).toBeDisabled();
  });

  it('renders the XTM One connection rows from the integration status', () => {
    testRender(
      <BundleProductCard
        product={buildProduct({
          platform_identifier:
            'xtmone' as XtmPlatformBundleProductFragment['platform_identifier'],
          name: 'XTM One Instance',
          url: 'https://xtmone.example.io',
        })}
        xtmoneStatus={connectedXtmoneStatus}
        canManage={false}
      />
    );

    expect(
      screen.getAllByText('XtmPlatformTrial.Products.Connection:')
    ).toHaveLength(2);
    expect(
      screen.getByText('XtmPlatformTrial.Products.ProductName:')
    ).toBeInTheDocument();
    expect(screen.getByText('XTM One Instance')).toBeInTheDocument();
  });

  it('enables the XTM One access link from its url even without a role', () => {
    testRender(
      <BundleProductCard
        product={buildProduct({
          platform_identifier:
            'xtmone' as XtmPlatformBundleProductFragment['platform_identifier'],
          name: 'XTM One Instance',
          url: 'https://xtmone.example.io',
          roles: [],
        })}
        xtmoneStatus={connectedXtmoneStatus}
        canManage={false}
      />
    );

    const accessLink = screen
      .getByText('XtmPlatformTrial.Products.AccessProduct')
      .closest('a');
    expect(accessLink).not.toBeNull();
    expect(accessLink).toHaveAttribute('href', 'https://xtmone.example.io');
  });

  it('hides the edit-name button when the user cannot manage', () => {
    testRender(
      <BundleProductCard
        product={buildProduct()}
        xtmoneStatus={emptyXtmoneStatus}
        canManage={false}
      />
    );

    expect(
      screen.queryByLabelText('XtmPlatformTrial.Products.EditName')
    ).not.toBeInTheDocument();
  });

  it('shows the edit-name button when the user can manage', () => {
    testRender(
      <BundleProductCard
        product={buildProduct()}
        xtmoneStatus={emptyXtmoneStatus}
        canManage={true}
      />
    );

    expect(
      screen.getByLabelText('XtmPlatformTrial.Products.EditName')
    ).toBeInTheDocument();
  });

  it('shows the edit-name button on the XTM One card when the user can manage', () => {
    testRender(
      <BundleProductCard
        product={buildProduct({
          platform_identifier:
            'xtmone' as XtmPlatformBundleProductFragment['platform_identifier'],
          name: 'XTM One Instance',
        })}
        xtmoneStatus={emptyXtmoneStatus}
        canManage={true}
      />
    );

    expect(
      screen.getByLabelText('XtmPlatformTrial.Products.EditName')
    ).toBeInTheDocument();
  });
});
