import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import { SettingsContext } from '@/components/settings/env-portal-context';
import testRender from '@/utils/test/test-render';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// Mock hooks /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
vi.mock('@/hooks/useDecodedParams', () => ({
  default: () => ({
    serviceInstanceId: 'test-service-id',
  }),
}));

vi.mock('next-intl', async () => {
  const actual = await vi.importActual('next-intl');
  return {
    ...actual,
    useTranslations: () => (key: string) => key,
  };
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// Mock children components ///////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
vi.mock('@/components/ui/share-link/share-link-button', () => ({
  ShareLinkButton: () => <div>ShareLinkButton</div>,
}));

vi.mock('@/components/ui/badge-overflow-counter', () => ({
  default: () => <div>Badges</div>,
}));

vi.mock('@/components/ui/breadcrumb-nav', () => ({
  BreadcrumbNav: () => <nav>Breadcrumb</nav>,
}));

vi.mock(
  '@/components/service/document/one-click-deploy/one-click-deploy',
  () => ({
    default: () => <div>OneClickDeployComponentMock</div>,
  })
);

vi.mock('@/components/service/document/shareable-resouce-details', () => ({
  default: () => <div>Details</div>,
}));

vi.mock('@/components/service/document/shareable-resource-description', () => ({
  default: () => <div>Description</div>,
}));

vi.mock('filigran-ui/servers', () => ({
  Button: ({ children, onClick, ...props }) => (
    <button
      onClick={onClick}
      {...props}>
      {children}
    </button>
  ),
}));

vi.mock('filigran-icon', () => ({
  DownloadIcon: () => <span>DownloadIcon</span>,
}));

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// Mocks values /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const mockSettings = {
  base_url_front: 'https://test.com',
};

describe('Component: ShareableResourceSlug - OneClickDeploy Logic', () => {
  it.each`
    shouldShowOneClickComponent | documentType          | documentActive
    ${true}                     | ${'custom_dashboard'} | ${true}
    ${false}                    | ${'custom_dashboard'} | ${false}
    ${true}                     | ${'csv_feed'}         | ${true}
    ${false}                    | ${'csv_feed'}         | ${false}
    ${false}                    | ${'obas_scenario'}    | ${false}
    ${false}                    | ${'obas_scenario'}    | ${true}
  `(
    'should show OneClickDeploy=$shouldShowOneClickComponent when document is $documentType is $documentActive',
    ({ shouldShowOneClickComponent, documentType, documentActive }) => {
      const testDocumentData = {
        active: documentActive,
        description: 'description',
        download_number: 1,
        name: 'Test Document',
        type: documentType,
      } as unknown as customDashboardsItem_fragment$data;

      testRender(
        <SettingsContext.Provider value={{ settings: mockSettings }}>
          <ShareableResourceSlug
            breadcrumbValue={[]}
            documentData={testDocumentData}
          />
        </SettingsContext.Provider>
      );

      const oneClickDeploy = screen.queryByText('OneClickDeployComponentMock');

      if (shouldShowOneClickComponent) {
        expect(oneClickDeploy).toBeInTheDocument();
      } else {
        expect(oneClickDeploy).not.toBeInTheDocument();
      }
    }
  );
});
