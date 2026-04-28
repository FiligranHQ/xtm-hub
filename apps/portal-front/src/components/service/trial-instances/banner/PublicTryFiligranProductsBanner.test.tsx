import testRender from '@/utils/test/test-render';
import { createMockEnvironment } from 'relay-test-utils';
import { PublicTryFiligranProductsBanner } from './PublicTryFiligranProductsBanner';

describe('Filigran product banner text on public pages', () => {
  it('should render the correct text on the banner', async () => {
    // Given
    const environment = createMockEnvironment();
    // The component is rendered
    const { queryByText } = testRender(<PublicTryFiligranProductsBanner />, {
      relayConfig: environment,
    });

    // Then
    const bannerText = await queryByText(
      'Explore OpenCTI or OpenAEV platform with 30 days'
    );
    expect(bannerText).toBeInTheDocument();
  });
});
