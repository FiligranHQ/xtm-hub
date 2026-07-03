import testRender from '@/utils/test/test-render';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TryOtherPlatformProductBlock from './TryOtherPlatformProductBlock';

describe('TryOtherPlatformProductBlock', () => {
  it.each`
    product                             | expectedDescriptionKey    | expectedCtaKey      | expectedHref
    ${PlatformIdentifierEnum.OPENAEV}  | ${'OpenAEV.Description'} | ${'OpenAEV.Cta'}    | ${'/app/service/openaev-free-trial'}
    ${PlatformIdentifierEnum.OPENCTI}  | ${'OpenCTI.Description'} | ${'OpenCTI.Cta'}    | ${'/app/service/opencti-free-trial'}
  `(
    'renders cross-sell block for $product with correct trial CTA',
    ({ product, expectedDescriptionKey, expectedCtaKey, expectedHref }) => {
      testRender(<TryOtherPlatformProductBlock product={product} />);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText(expectedDescriptionKey)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: expectedCtaKey })).toHaveAttribute(
        'href',
        expectedHref
      );
    }
  );
});
