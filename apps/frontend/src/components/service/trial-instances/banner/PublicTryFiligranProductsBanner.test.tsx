import { PublicTryFiligranProductsBanner } from '@/components/service/trial-instances/banner/PublicTryFiligranProductsBanner';
import testRender from '@/utils/test/test-render';
import { createMockEnvironment } from 'relay-test-utils';

describe('Filigran product banner text on public pages', () => {
  it('should render the correct text on the banner', async () => {
    // Given
    const environment = createMockEnvironment();
    // The component is rendered
    const { queryByText } = testRender(<PublicTryFiligranProductsBanner />, {
      relayConfig: environment,
    });

    // Then
    const bannerText = await queryByText('Service.Trials.ExploreProducts');
    expect(bannerText).toBeInTheDocument();
  });
});
