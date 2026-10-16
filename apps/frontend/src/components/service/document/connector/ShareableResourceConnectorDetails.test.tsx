import { ShareableResourceConnectorDetails } from '@/components/service/document/connector/ShareableResourceConnectorDetails';
import { FiligranWebsiteUtmCampaign } from '@/utils/filigran-website-utm';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const CONTACT_LABEL = 'Service.ShareableResources.Details.ContributorContact';
const CONTACT_VALUE = 'contributor@example.com';
const CONNECTOR_NAME = 'MISP Intel';
const FILIGRAN_DATASHEET_URL = 'https://filigran.io/media/datasheet.pdf';
const VENDOR_URL = 'https://vendor.example.com/contact';
const RESOURCE_PAGE_UTM = {
  campaign: FiligranWebsiteUtmCampaign.RESOURCE_PAGE,
  content: 'integration',
};

describe('ShareableResourceConnectorDetails', () => {
  it('should display the contributor contact when the connector provides one', () => {
    // Given a connector carrying a contributor contact
    testRender(
      <ShareableResourceConnectorDetails
        connectorDetails={{ name: CONNECTOR_NAME, contact: CONTACT_VALUE }}
      />
    );

    // When the details panel is rendered
    // Then the contact is shown as plain text next to its label
    expect(screen.getByText(CONTACT_LABEL)).toBeInTheDocument();
    expect(screen.getByText(CONTACT_VALUE)).toBeInTheDocument();
  });

  it('should not display the contributor contact row when the connector has none', () => {
    // Given a Filigran-supported connector, which carries no contact
    testRender(
      <ShareableResourceConnectorDetails
        connectorDetails={{ name: CONNECTOR_NAME }}
      />
    );

    // When the details panel is rendered
    // Then no empty label is shown
    expect(screen.queryByText(CONTACT_LABEL)).not.toBeInTheDocument();
  });

  it('should display the connector type and the hunted platform of a hunt connector', () => {
    // Given a hunt connector that hunts on Splunk
    testRender(
      <ShareableResourceConnectorDetails
        connectorDetails={{
          name: 'Splunk Hunt',
          connector_type: 'INTERNAL_HUNT',
          hunt_platform: 'splunk',
        }}
      />
    );

    // When the details panel is rendered
    // Then the type and the hunted platform are shown with their labels
    expect(
      screen.getByText('Service.ShareableResources.Details.ConnectorType')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Service.OpenctiIntegrations.ConnectorType.INTERNAL_HUNT'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Service.ShareableResources.Details.HuntedPlatform')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Service.OpenctiIntegrations.HuntPlatform.splunk')
    ).toBeInTheDocument();
  });

  it('should not display connector type rows when the catalog does not know the type', () => {
    // Given a connector ingested before connector types were recorded
    testRender(
      <ShareableResourceConnectorDetails
        connectorDetails={{ name: CONNECTOR_NAME }}
      />
    );

    // Then neither the type nor the hunted platform rows are shown
    expect(
      screen.queryByText('Service.ShareableResources.Details.ConnectorType')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Service.ShareableResources.Details.HuntedPlatform')
    ).not.toBeInTheDocument();
  });

  it('should display the compatibility version only when the connector declares one', () => {
    // Given a connector from a manifest fragment, which declares no product version,
    // and a connector of the legacy manifest, which declares one
    const { unmount } = testRender(
      <ShareableResourceConnectorDetails
        connectorDetails={{
          name: 'Splunk Hunt',
          connector_type: 'INTERNAL_HUNT',
        }}
      />
    );

    // Then no empty compatibility row is shown for the first one
    expect(
      screen.queryByText('Service.ShareableResources.Details.ProductVersion')
    ).not.toBeInTheDocument();
    unmount();

    testRender(
      <ShareableResourceConnectorDetails
        connectorDetails={{ name: CONNECTOR_NAME, product_version: '6.8.3' }}
      />
    );
    expect(
      screen.getByText('Service.ShareableResources.Details.ProductVersion')
    ).toBeInTheDocument();
    expect(screen.getByText('6.8.3')).toBeInTheDocument();
  });

  it('should tag the filigran.io links of the panel when a filigran website utm is given', () => {
    // Given a connector whose datasheet is hosted on filigran.io and whose vendor link is not
    testRender(
      <ShareableResourceConnectorDetails
        connectorDetails={{
          name: CONNECTOR_NAME,
          datasheet_url: FILIGRAN_DATASHEET_URL,
          subscription_link: VENDOR_URL,
        }}
        filigranWebsiteUtm={RESOURCE_PAGE_UTM}
      />
    );

    // When the details panel is rendered
    const datasheetLink = screen.getByRole('link', {
      name: FILIGRAN_DATASHEET_URL,
    });

    // Then only the filigran.io link is tagged, and its displayed url stays untouched
    expect(datasheetLink).toHaveAttribute(
      'href',
      `${FILIGRAN_DATASHEET_URL}?utm_source=xtm_hub&utm_medium=referral&utm_campaign=resource_page&utm_content=integration`
    );
    expect(
      screen.getByRole('link', { name: 'Service.Connectors.VendorContact' })
    ).toHaveAttribute('href', VENDOR_URL);
  });
});
