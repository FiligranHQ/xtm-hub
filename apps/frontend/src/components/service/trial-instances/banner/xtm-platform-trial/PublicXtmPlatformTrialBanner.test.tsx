import { PublicXtmPlatformTrialBanner } from '@/components/service/trial-instances/banner/xtm-platform-trial/PublicXtmPlatformTrialBanner';
import testRender from '@/utils/test/test-render';
import { describe, expect, it } from 'vitest';

describe('PublicXtmPlatformTrialBanner', () => {
  it('should always render the no-trial banner without running any query', () => {
    // Given
    const { getByText } = testRender(<PublicXtmPlatformTrialBanner />);

    // Then
    expect(
      getByText('Service.Trials.XtmPlatform.NoTrial.Text')
    ).toBeInTheDocument();
  });
});
