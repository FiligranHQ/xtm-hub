import { PublicTryFiligranProductsBanner } from '@/components/service/trial-instances/banner/public-try-filigran-products-banner';
import testRender from '@/utils/test/test-render';
import { createMockEnvironment } from 'relay-test-utils';

describe('Filigran product banner text on public pages', () => {
  it.each`
    isFeatureEnabled      | expectedText
    ${['OPENAEV_TRIALS']} | ${/Explore OpenCTI or OpenAEV platform with 30 days/i}
    ${['']}               | ${/Explore the full potential of OpenCTI Enterprise Edition, start your 30 days free trial./i}
  `(
    'should render the correct text depending the feature flag is enable $isFeatureEnabled',
    async ({ isFeatureEnabled, expectedText }) => {
      // Given
      const environment = createMockEnvironment();
      // The component is rendered
      const { queryByText } = testRender(<PublicTryFiligranProductsBanner />, {
        relayConfig: environment,
        settings: {
          platform_feature_flags: isFeatureEnabled,
        },
      });

      // Then
      const bannerText = await queryByText(expectedText);
      expect(bannerText).toBeInTheDocument();
    }
  );
});
