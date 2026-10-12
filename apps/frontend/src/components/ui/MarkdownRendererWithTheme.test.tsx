import MarkdownRendererWithTheme from '@/components/ui/MarkdownRendererWithTheme';
import { FiligranWebsiteUtmCampaign } from '@/utils/filigran-website-utm';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const SOURCE =
  '[Datasheet](https://filigran.io/datasheet?ref=1) and [Docs](https://docs.filigran.io/)';

describe('MarkdownRendererWithTheme', () => {
  it('should tag filigran.io links when a filigran website utm is given', () => {
    testRender(
      <MarkdownRendererWithTheme
        source={SOURCE}
        filigranWebsiteUtm={{
          campaign: FiligranWebsiteUtmCampaign.RESOURCE_PAGE,
          content: 'integration',
        }}
      />
    );

    expect(screen.getByRole('link', { name: 'Datasheet' })).toHaveAttribute(
      'href',
      'https://filigran.io/datasheet?ref=1&utm_source=xtm_hub&utm_medium=referral&utm_campaign=resource_page&utm_content=integration'
    );
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      'https://docs.filigran.io/'
    );
  });

  it('should leave links untouched when no filigran website utm is given', () => {
    testRender(<MarkdownRendererWithTheme source={SOURCE} />);

    expect(screen.getByRole('link', { name: 'Datasheet' })).toHaveAttribute(
      'href',
      'https://filigran.io/datasheet?ref=1'
    );
  });
});
