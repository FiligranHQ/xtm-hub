import { PublicXtmPlatformTrialBanner } from '@/components/service/trial-instances/banner/xtm-platform-trial/PublicXtmPlatformTrialBanner';
import testRender from '@/utils/test/test-render';
import { afterEach, describe, expect, it } from 'vitest';

describe('PublicXtmPlatformTrialBanner', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('should always render the no-trial banner without running any query', () => {
    const { getByText } = testRender(<PublicXtmPlatformTrialBanner />);

    expect(
      getByText('Service.Trials.XtmPlatform.NoTrial.Text')
    ).toBeInTheDocument();
  });
});
