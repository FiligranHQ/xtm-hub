import testRender from '@/utils/test/test-render';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TryOtherPlatformProductBlock from './TryOtherPlatformProductBlock';

describe('TryOtherPlatformProductBlock', () => {
  it.each`
    product                           | expectedHref
    ${PlatformIdentifierEnum.OPENAEV} | ${'/app/service/openaev-free-trial'}
    ${PlatformIdentifierEnum.OPENCTI} | ${'/app/service/opencti-free-trial'}
  `(
    'renders cross-sell block for $product with correct trial CTA',
    ({ product, expectedHref }) => {
      testRender(<TryOtherPlatformProductBlock product={product} />);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Cta' })).toHaveAttribute(
        'href',
        expectedHref
      );
    }
  );
});
