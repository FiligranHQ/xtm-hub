import ShareableResourceSlug from '@/components/service/document/ShareableResourceSlug';
import { SettingsContext } from '@/components/settings/EnvPortalContext';
import testRender from '@/utils/test/test-render';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { screen } from '@testing-library/react';
import { ComponentPropsWithoutRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// Mock hooks /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
vi.mock('@/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: vi.fn(),
}));

vi.mock('../../../hooks/use-decoded-params', () => ({
  default: () => ({
    serviceInstanceId: 'test-service-id',
  }),
}));

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// Mock children components ///////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
vi.mock('../../ui/share-link/ShareLinkButton', () => ({
  ShareLinkButton: () => <div>ShareLinkButton</div>,
}));

vi.mock('../../ui/BadgeOverflowCounter', () => ({
  default: () => <div>Badges</div>,
}));

vi.mock('../../ui/BreadcrumbNav', () => ({
  BreadcrumbNav: () => <nav>Breadcrumb</nav>,
}));

vi.mock('./one-click-deploy/OneClickDeploy', () => ({
  default: () => <div>OneClickDeployComponentMock</div>,
}));

vi.mock('./ShareableResouceDetails', () => ({
  default: () => <div>Details</div>,
}));

vi.mock('./ShareableResourceDescription', () => ({
  default: () => <div>Description</div>,
}));

vi.mock('./ui/ShareableResourceCarouselView', () => ({
  default: () => <div>Carousel</div>,
}));

vi.mock('@filigran/ui', () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: ComponentPropsWithoutRef<'button'>) => (
    <button
      onClick={onClick}
      {...props}>
      {children}
    </button>
  ),
}));

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// Mocks values /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const mockSettings = {
  base_url_front: 'https://test.com',
};

describe('Component: ShareableResourceSlug - OneClickDeploy Logic', () => {
  const serviceInstance = {
    id: 'service-instance-1',
  } as unknown as serviceInstance_fragment$data;

  it.each`
    shouldShowOneClickComponent | documentType                  | documentActive | integrationType
    ${true}                     | ${'opencti_custom_dashboard'} | ${true}        | ${false}
    ${false}                    | ${'opencti_custom_dashboard'} | ${false}       | ${false}
    ${true}                     | ${'opencti_integration'}      | ${true}        | ${IntegrationTypeEnum.CSV_FEED}
    ${true}                     | ${'opencti_integration'}      | ${true}        | ${IntegrationTypeEnum.TAXII_FEED}
    ${true}                     | ${'opencti_integration'}      | ${true}        | ${IntegrationTypeEnum.STREAM}
    ${false}                    | ${'opencti_integration'}      | ${true}        | ${IntegrationTypeEnum.THIRD_PARTY_INTEGRATION}
    ${false}                    | ${'opencti_integration'}      | ${false}       | ${IntegrationTypeEnum.CSV_FEED}
    ${true}                     | ${'openaev_scenario'}         | ${true}        | ${false}
    ${false}                    | ${'openaev_scenario'}         | ${false}       | ${false}
  `(
    'should show OneClickDeploy=$shouldShowOneClickComponent when document is $documentType is $documentActive and integration type is $integrationType',
    ({
      shouldShowOneClickComponent,
      documentType,
      documentActive,
      integrationType,
    }) => {
      const testDocumentData = {
        active: documentActive,
        description: 'description',
        download_number: 1,
        name: 'Test Document',
        type: documentType,
        integration_type: integrationType,
      } as unknown as documentItem_fragment$data;

      testRender(
        <SettingsContext.Provider value={{ settings: mockSettings as never }}>
          <ShareableResourceSlug
            breadcrumbValue={[]}
            documentData={testDocumentData}
            serviceInstance={serviceInstance}
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
